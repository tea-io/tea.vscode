import {IMessage} from "./http-service";

export function diffWriteEnable(path: string): IMessage {
    return {
        type: 67,
        data: {
            path
        }
    };
}

export function diffWriteDisable(path: string): IMessage {
    return {
        type: 68,
        data: {
            path
        }
    };
}