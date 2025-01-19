import * as vscode from "vscode";
import {Disposable} from "vscode";
import {HttpService} from "./api/http-service";
import {
    DocumentFilter,
    LanguageClient,
    LanguageClientOptions,
    MessageTransports,
    ServerOptions
} from "vscode-languageclient/node";

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
                const p = new Promise<boolean>(resolve => {
                    const instance = TeaStateInstance.getInstance();
                    const clientOptions: LanguageClientOptions = {
                        documentSelector: [{scheme: 'file', language: language} as DocumentFilter],
                        synchronize: {
                            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.*')
                        }
                    };

                    const transformer = instance.getHttpClientTransformer(url, language);

                    const serverOptions: ServerOptions = () => {
                        return new Promise((resolve) => resolve(transformer));
                    };

                    const client = new LanguageClient(
                        `tea-${language}-lsp-proxy`,
                        `Tea ${language} LSP Proxy`,
                        serverOptions,
                        clientOptions,
                    );

                    client.start()
                        .then(() => {
                            console.log("Client started");
                            resolve(true);
                        })
                        .catch(console.error);
                });

                if (await p) {
                    vscode.window.showInformationMessage("Connected to Tea filesystem");
                } else {
                    vscode.window.showErrorMessage("Failed to connect to Tea filesystem");
                }
            });
        });
    }

    public getHttpClientTransformer(address: string, language: string): MessageTransports {
        const [host, port] = address.split(":");
        const httpClient = new HttpService(host, parseInt(port));
        return httpClient.createTransport(language);
    }
}
