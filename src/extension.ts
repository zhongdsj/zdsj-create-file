// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CreateFileManager } from './createFileManager';
import * as fs from 'fs';

let createFileManager = new CreateFileManager();

interface FileTypeToPackageJson{
	extension: string,
	group: string,
	defaultContent: string
}

class FileTypeToPackageJsonClass implements FileTypeToPackageJson{
	extension: string;
	group: string;
	defaultContent: string;
	
	constructor(extension: string, group: string = "Other", defaultContent: string = ""){
		this.extension = extension;
		this.group = group;
		this.defaultContent = defaultContent;
	}
}

function addFileTypeToPackageJson(fileTypeToPackageJson: Array<FileTypeToPackageJsonClass>){
	fs.readFile('F:/projects/uni-app/zdsj-create-file/package.json', 'utf-8', (err, data) => {
		if(!err){
			let jsonData : {[key: string]: any} = JSON.parse(data);
			for(let item of fileTypeToPackageJson){
				jsonData['contributes']['configuration'][0]['properties']['zdsj-create-file.defaultFileContent']['default'][item.extension] = item.defaultContent;
				jsonData['contributes']['commands'].push({
					"command": "zdsj-create-file." + item.extension,
					"title": item.extension
				});
				jsonData['contributes']['menus']['createFile'].push({
					"command": "zdsj-create-file." + item.extension,
					"when": "explorerResourceIsFolder",
					"group": item.group,
				});
			}
			
			fs.writeFile('F:/projects/uni-app/zdsj-create-file/package.json', JSON.stringify(jsonData, null, 2), 'utf-8', (err) => {});
		}else{
			console.log(err);
		}
	});
}

export function activate(context: vscode.ExtensionContext) {
	// addFileTypeToPackageJson([new FileTypeToPackageJsonClass('pom', 'Java'),
	// 	new FileTypeToPackageJsonClass('md', 'Other'),
	// 	// new FileTypeToPackageJsonClass('c', 'C/Cpp')
	// ]);

	const defaultFileContent: { [key: string]: any } = vscode.workspace.getConfiguration('zdsj-create-file').get('defaultFileContent') as Object;
	for(let key in defaultFileContent){
		context.subscriptions.push(vscode.commands.registerCommand('zdsj-create-file.' + key, (uri: vscode.Uri) => {
			createFileManager.createFile(uri, key);
		}));
	}
}

export function deactivate() {}
