import * as vscode from "vscode";
import {TextEditorDecorationType} from "vscode";

export class VirtualCursorsState {
    #decorationTypes: Map<string, vscode.TextEditorDecorationType> = new Map();

    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(event => this.drawCursors(event.textEditor)));

        const userColor = this.getUserColor('test user');
        this.#decorationTypes.set('test user', this.createUserDecoration('test user', userColor));
    }

    public drawCursors(editor: vscode.TextEditor) {
        this.clearUserDecorations('test user');

        const userColor = this.getUserColor('test user');
        this.#decorationTypes.set('test user', this.createUserDecoration('test user', userColor));

        const decorationType = this.#decorationTypes.get('test user')!;
        const decorationOptions = {
            range: new vscode.Range(editor.selection.active, editor.selection.active)
        };
        editor.setDecorations(decorationType, [decorationOptions]);
    }

    private clearUserDecorations(user: string) {
        const existingDecoration = this.#decorationTypes.get(user);
        if (existingDecoration) {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                activeEditor.setDecorations(existingDecoration, []);
            }
            existingDecoration.dispose();
            this.#decorationTypes.delete(user);
        }
    }

    private createUserDecoration(user: string, color: string): TextEditorDecorationType {
        return vscode.window.createTextEditorDecorationType({
            border: '1px',
            borderStyle: 'solid',
            borderColor: color,
            after: {
                contentText: `Editing by test user`,
                color: color,
                margin: '0 0 0 10px',
                fontWeight: 'bold'
            }
        });
    }

    private getUserColor(user: string): string {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', '#6C5CE7'];
        const hash = user.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
        return colors[hash % colors.length];
    }
}