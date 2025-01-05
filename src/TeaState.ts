import * as vscode from "vscode";
import {Disposable} from "vscode";
import {HttpService} from "./api/http-service";
import {MessageTransports} from "vscode-languageclient/node";

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
        this.#httpClient = new HttpService("0.0.0.0", 5211);

        context.subscriptions.push(TeaState.registerInitialConnectionCommand());
    }

    public getHttpClientTransformer(): MessageTransports {
        return this.#httpClient.createTransport();
    }

    private static registerInitialConnectionCommand(): Disposable {
        return vscode.commands.registerCommand("tea-vscode.connect", async () => {
            const url = await vscode.window.showInputBox({
                title: "Enter the address of the Tea filesystem",
                value: "127.0.0.1:5211"
            });
            if (!url) {
                vscode.window.showInformationMessage("Invalid URL");
                return;
            }

            const language = await vscode.window.showInputBox({
                title: "Enter the language you want to use",
            });
            if (!language) {
                vscode.window.showInformationMessage("Invalid language");
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
}
