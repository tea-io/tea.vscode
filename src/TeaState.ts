import * as vscode from "vscode";
import {Disposable} from "vscode";

export class TeaStateInstance {
    static #instance: TeaState;

    constructor() {
    }

    public static getInstance = () => this.#instance;

    public static initialize(context: vscode.ExtensionContext) {
        if (!this.#instance) {
            this.#instance = new TeaState(context);
        }
    }
}

class TeaState {
    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(TeaState.registerInitialConnectionCommand());
    }

    private static registerInitialConnectionCommand(): Disposable {
        return vscode.commands.registerCommand("tea-vscode.connect", async () => {
            const url = await vscode.window.showInputBox({
                title: "Enter the URL of the Tea file system",
                value: "127.0.0.1:5211"
            });
            if (!url) {
                vscode.window.showInformationMessage("Invalid URL");
                return;
            }
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Connecting to Tea file system",
                cancellable: false
            }, async () => {
                // TODO: Implement connection logic
                const p = new Promise<boolean>(resolve => {
                    setTimeout(() => {
                        return resolve(Math.random() > 0.5);
                    }, 1500);
                });

                if (await p) {
                    vscode.window.showInformationMessage("Connected to Tea filesystem");
                } else {
                    vscode.window.showErrorMessage("Failed to connect to Tea filesystem");
                }
            });
        });
    }

    public testGettingInstance() {
        console.log("Instance initialized correctly");
    }
}
