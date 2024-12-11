import * as console from "node:console";
import * as net from "net";

let id = 0;

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

    public makeTestRequest() {
        try {
            // TODO: Implement the actual request
            this.makeRequest({path: "tgest data"});
        } catch (e) {
            console.error("Failed to send request", e);
        }
    }

    private makeRequest<T>(data: T) {
        const payloadBuffer = new TextEncoder().encode(JSON.stringify(data));

        const headerBuffer = Buffer.alloc(12);
        headerBuffer.writeInt32BE(payloadBuffer.byteLength, 0); // size
        headerBuffer.writeInt32BE(id++, 4); // id
        headerBuffer.writeInt32BE(67, 8); // type

        const finalPayload = Buffer.concat([headerBuffer, payloadBuffer]);

        this.#socket.sendBinaryData(finalPayload);
        this.#socket.onData((data) => {
            console.log(data);
        });
    }
}