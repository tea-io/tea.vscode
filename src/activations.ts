import * as vscode from "vscode";
import * as console from "node:console";

// Currently we are manually keeping track of the set of open files,
// however, if the need arises, we can just pass it from `vscode.workspace.textDocuments`
// and these function call would be just points, at which, the server would be updated.
const openTextFiles = new Set<string>();

export function handleFileOpened(doc: vscode.TextDocument) {
    if (!shouldProcessFile(doc)) {
        return;
    }

    console.log("File opened: " + doc.fileName);
    openTextFiles.add(doc.fileName);
}

export function handleFileClosed(doc: vscode.TextDocument) {
    if (!shouldProcessFile(doc)) {
        return;
    }

    console.log("File closed: " + doc.fileName);
    openTextFiles.delete(doc.fileName);
}

function shouldProcessFile(doc: vscode.TextDocument): boolean {
    return !doc.isUntitled && doc.uri.scheme === 'file';
}