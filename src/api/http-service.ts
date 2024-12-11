import * as console from "node:console";
import * as net from "net";

let id = 0;

export interface IMessage {
    type: number;
    data: object
}

class RawSocketClient {
    // @ts-ignore-next-line
    #socket: net.Socket;

    connect(host: string, port: number) {
        this.#socket = new net.Socket();
        this.#socket.connect(port, host);
    }

    sendBinaryData(buffer: Buffer) {
        this.#socket.write(buffer);
    }

    onData(callback: (data: Buffer) => void) {
        this.#socket.on('data', callback);
    }

    close() {
        this.#socket.destroy();
    }
}

export class HttpService {
    #socket: RawSocketClient;

    constructor(endpoint: string, port: number) {
        this.#socket = new RawSocketClient();
        this.#socket.connect(endpoint, port);
    }

    public makeRequest(msg: IMessage) {
        const payloadBuffer = new TextEncoder().encode(JSON.stringify(msg.data));

        const headerBuffer = Buffer.alloc(12);
        headerBuffer.writeInt32BE(payloadBuffer.byteLength, 0); // size
        headerBuffer.writeInt32BE(id++, 4); // id
        headerBuffer.writeInt32BE(msg.type, 8); // type

        const finalPayload = Buffer.concat([headerBuffer, payloadBuffer]);

        this.#socket.sendBinaryData(finalPayload);
        this.#socket.onData((data) => {
            console.log(data);
        });
    }
}