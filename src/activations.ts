import * as vscode from "vscode";
import {TextDocumentWillSaveEvent} from "vscode";
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

// As per the documentation, this is not 100% guaranteed to be called
// All listeners share the same 1.5s time budget, and also they are called sequentially, so if one of the listeners
// before ours goes over the budget, then our listener *will* not be called. Offending listeners are ignored after
// 3 violations, so eventually our listener will be called.
export function handleBeforeFileSaved(event: TextDocumentWillSaveEvent) {
    if (!shouldProcessFile(event.document)) {
        return;
    }

    event.waitUntil(Promise.resolve([
        // TODO: Notify the server about changes
        vscode.TextEdit.insert(new vscode.Position(0, 0), `// This file was modified at tea-vscode extension at ${new Date().toISOString()}\n`)
    ]));
}

function shouldProcessFile(doc: vscode.TextDocument): boolean {
    return !doc.isUntitled && doc.uri.scheme === 'file';
}