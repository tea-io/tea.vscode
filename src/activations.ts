import * as vscode from "vscode";
import * as console from "node:console";

export function handleFileOpened(doc: vscode.TextDocument) {
    if (!shouldProcessFile(doc)) {
        return;
    }

    console.log("File opened: " + doc.fileName);
}

export function handleFileClosed(doc: vscode.TextDocument) {
    if (!shouldProcessFile(doc)) {
        return;
    }

    console.log("File closed: " + doc.fileName);
}

function shouldProcessFile(doc: vscode.TextDocument): boolean {
    return !doc.isUntitled && doc.uri.scheme === 'file';
}