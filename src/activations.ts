import * as vscode from "vscode";
import {TextDocumentWillSaveEvent} from "vscode";
import * as console from "node:console";
import {HttpService} from "./api/http-service";
import {diffWriteDisable, diffWriteEnable} from "./api/message-types";

export function handleFileOpened(doc: vscode.TextDocument, httpService: HttpService) {
    if (!shouldProcessFile(doc)) {
        return;
    }

    console.log("File opened: " + doc.fileName);
}

export function handleFileClosed(doc: vscode.TextDocument, httpService: HttpService) {
    if (!shouldProcessFile(doc)) {
        return;
    }

    console.log("File closed: " + doc.fileName);
}

// As per the documentation, this is not 100% guaranteed to be called
// All listeners share the same 1.5s time budget, and also they are called sequentially, so if one of the listeners
// before ours goes over the budget, then our listener *will* not be called. Offending listeners are ignored after
// 3 violations, so eventually our listener will be called.
export function handleBeforeFileSaved(event: TextDocumentWillSaveEvent, httpService: HttpService) {
    if (!shouldProcessFile(event.document)) {
        return;
    }

    const promise = new Promise(resolve => {
        httpService.makeRequest(diffWriteEnable(event.document.fileName));
        resolve(null);
    });

    event.waitUntil(promise);
}

export function handleAfterFileSaved(doc: vscode.TextDocument, httpService: HttpService) {
    if (!shouldProcessFile(doc)) {
        return;
    }

    console.log("File saved: " + doc.fileName);
    httpService.makeRequest(diffWriteDisable(doc.fileName));
}

function shouldProcessFile(doc: vscode.TextDocument): boolean {
    return !doc.isUntitled && doc.uri.scheme === 'file';
}