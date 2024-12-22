import { ConfigurationChangeEvent, Uri, window, workspace, WorkspaceConfiguration } from "vscode";

export class CreateFileManager {
    private config: WorkspaceConfiguration;
    private showMessageOnFileCreated: boolean;
    private defaultFileContent: { [key: string]: any };

    constructor() {
        this.config = workspace.getConfiguration('zdsj-create-file');
        this.showMessageOnFileCreated = this.config.get('showMessageOnFileCreated') as boolean;
        this.defaultFileContent = this.config.get('defaultFileContent') as Object;
        workspace.onDidChangeConfiguration((event: ConfigurationChangeEvent) => {
            if(event.affectsConfiguration('zdsj-create-file')) {
                this.getConfiguration();
            }
        });
    }

    private getConfiguration() : any{
        this.config = workspace.getConfiguration('zdsj-create-file');
        this.showMessageOnFileCreated = this.config.get('showMessageOnFileCreated') as boolean;
        this.defaultFileContent = this.config.get('defaultFileContent') as Object;
    }

    public createFile(uri: Uri, extension: string){
        window.showInputBox({
            placeHolder: 'Enter the name of the new file',
            validateInput: (value) => {
                // 判断文件名是否合法
                if(!value || !/[A-Za-z0-9_]*$/.test(value)){
                    return 'Please enter a valid file name.';
                }
                return null;
            }
        }).then((fileName) => {
            if(!fileName){
                // 文件名不存在
                return;
            }
            const fileUri = Uri.file(uri.fsPath + "\\" + fileName + "." + extension);
            // 创建填充
            let fill = "";
            if(this.defaultFileContent.hasOwnProperty(extension)){
                // 存在该配置
                fill = this.defaultFileContent[extension];
            }
            workspace.fs.stat(fileUri).then((stat) => {
                // 文件已存在
                window.showErrorMessage("File already exists: " + fileUri.fsPath);
            }, (err) => {
                // 文件不存在
                // 创建文件
                workspace.fs.writeFile(fileUri, new Uint8Array(Buffer.from(fill, 'utf-8'))).then(() => {
                    if(this.showMessageOnFileCreated === true){
                        window.showInformationMessage("Create file: " + fileUri.fsPath);
                    }
                });
            });
        });
    }
}