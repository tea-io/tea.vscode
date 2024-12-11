import * as vscode from "vscode";
import {Disposable} from "vscode";
import {HttpService} from "./api/http-service";
import {handleFileClosed, handleFileOpened} from "./activations";

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
    readonly #httpClient: HttpService;

    constructor(context: vscode.ExtensionContext) {
        this.#httpClient = new HttpService("0.0.0.0", 5212);

        context.subscriptions.push(TeaState.registerInitialConnectionCommand());
        context.subscriptions.push(...TeaState.registerOnFileOpenClose(context, this.#httpClient));
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

    private static registerOnFileOpenClose(context: vscode.ExtensionContext, httpClient: HttpService) {
        const openDisposable = vscode.workspace.onDidOpenTextDocument((doc) => handleFileOpened(doc, httpClient));
        const closeDisposable = vscode.workspace.onDidCloseTextDocument((doc) => handleFileClosed(doc, httpClient));

        return [openDisposable, closeDisposable];
    }
}
