// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from "fs"
import * as readline from "readline"
import * as child_process from "child_process"

export function activate(context: vscode.ExtensionContext) {
	vscode.window.showInformationMessage("makefee activate");
	context.subscriptions.push(vscode.commands.registerCommand('extension.build', (info, p) => {
		var fRead = fs.createReadStream(info.fsPath);
		var objReadline = readline.createInterface({
			input: fRead
		});
		var reg = /^(.*)Makefile$/
		var regData = reg.exec(info.fsPath)
		var cwd = ""
		if (regData != null && regData.length > 0){
			cwd = regData[1]
		}
		var parmes = ["取消"]
		objReadline.on('line',function (lineData) {
			// arr.push(line);
			var reg = /^(\w+):$/
			var data = reg.exec(lineData)
			if (data != null && data.length > 0 && parmes.indexOf(data[1]) <= -1){
				parmes.push(data[1])
			}
		});
		objReadline.on('close',function () {
			vscode.window.showQuickPick(parmes).then(function(msg){
				if (msg == "取消" || !msg) return
				let make = child_process.spawn('make', [msg], {
					cwd: cwd
				});
				make.on("close", (code: any) => {
					if (code > 0) {
						vscode.window.showErrorMessage("make failed");
						return;
					}
					vscode.window.showInformationMessage("make is done");
				});
				make.stdout.on("data", (data: any) => {
					console.log(data.toString());
				});
				make.stderr.on("data", (data: any) => {
					console.error(data.toString());
				});
			})
		 });
	}
	));
}

function runMake() {

}

// this method is called when your extension is deactivated
export function deactivate() { }