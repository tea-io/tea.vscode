import * as console from "node:console";
import * as net from "net";
import {MessageTransports} from "vscode-languageclient/node";
import {DataCallback} from "vscode-languageclient";
import {Disposable} from "vscode";

let id = 0;

export class HttpService {
    readonly #socket: net.Socket;

    constructor(endpoint: string, port: number) {
        this.#socket = new net.Socket();
        this.#socket.connect(port, endpoint);
    }

    private static wrapWithHeader(msg: string): Uint8Array<ArrayBufferLike> {
        const payloadBuffer = new TextEncoder().encode(msg);
        const headerBuffer = Buffer.alloc(12);
        headerBuffer.writeInt32BE(payloadBuffer.byteLength, 0); // size
        headerBuffer.writeInt32BE(id++, 4); // id
        headerBuffer.writeInt32BE(0, 8); // type

        return Buffer.concat([headerBuffer, payloadBuffer]);
    }

    private static unwrapHeader(buffer: Buffer): string {
        const size = buffer.readInt32BE(0);
        return buffer.toString('utf-8', 12, 12 + size);
    }

    public createTransport(): MessageTransports {
        const socket = this.#socket;
        return {
            reader: {
                listen(callback: DataCallback): Disposable {
                    const wrappedCallback = (data: Buffer) => {
                        try {
                            const unwrapped = HttpService.unwrapHeader(data);
                            callback(JSON.parse(unwrapped));
                        } catch (e) {
                            console.error("Error while parsing message", e);
                        }
                    };
                    socket.on('data', wrappedCallback);
                    return new Disposable(() => socket.removeListener('data', wrappedCallback));
                },
                onPartialMessage: listener => {
                    socket.on('data', listener);
                    return new Disposable(() => socket.removeListener('data', listener));
                },
                onError: listener => {
                    socket.on('error', listener);
                    return new Disposable(() => socket.removeListener('error', listener));
                },
                onClose: listener => {
                    socket.on('close', listener);
                    return new Disposable(() => socket.removeListener('close', listener));
                },
                dispose: () => socket.destroy()
            },
            writer: {
                write: msg => {
                    const modifiedMsg = HttpService.wrapWithHeader(JSON.stringify(msg));
                    return new Promise((resolve, reject) => {
                        socket.write(modifiedMsg, error => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve();
                            }
                        });
                    });
                },
                onError: listener => {
                    socket.on('error', listener);
                    return new Disposable(() => socket.removeListener('error', listener));
                },
                onClose: listener => {
                    socket.on('close', listener);
                    return new Disposable(() => socket.removeListener('close', listener));
                },
                end: () => socket.end(),
                dispose: () => socket.destroy()
            }
        };
    }
}