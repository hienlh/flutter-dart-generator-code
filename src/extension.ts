// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "flutter-dart-generator-code" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('flutter.generateGetterSetter', async () => {
		// The code you place here will be executed every time your command is executed

		const editor = vscode.window.activeTextEditor;

		const validateMessage = validate();

		const getterSetter = createGetterAndSetter(editor?.document.getText(editor.selection) || '');


		editor?.edit(
			editBuilder => editor?.selections?.forEach(selection => {
				editBuilder.insert(selection.end, getterSetter);
			})
		);

		await vscode.commands.executeCommand('editor.action.formatDocument');

		// Display a message box to the user
		vscode.window.showInformationMessage(`${validateMessage}`);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }

function validate(): string {
	// Check if editor is opening
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return 'No editor is opening.';
	}

	// Check if opening dart file.
	if (editor.document.languageId !== 'dart') {
		return 'File is not a dart file.';
	}

	// Check if no selected text.
	if (editor.document.getText(editor.selection).length < 1) {
		return 'No text is being selected.';
	}

	return '';
}

function createGetterAndSetter(text: string): string {
	let result = '\n\n';
	const lines = text.split(/\r?\n/);

	for (let line of lines) {
		line = line.trim();
		line = line.replace(';', '');

		const words = line.split(' ');

		const propertyName = words.pop() || '';
		const propertyType = words.pop() || '';
		
		result += createGetter(propertyName, propertyType).join(' ');
		result += '\n\n';
		result += createSetter(propertyName, propertyType).join(' ');
		result += '\n\n';
	}

	return result;
}

function createName(propertyName: string, propertyType: string, type: 'Getter' | 'Setter') {
	let newPropertyName = '';

	if (propertyName[0] === '_') {
		newPropertyName = propertyName.substr(1, propertyName.length);
	} else {
		newPropertyName = (type === 'Getter' ? 'get' : 'set') + propertyName[0].toUpperCase() + propertyName.substr(1, propertyName.length);
	}

	return newPropertyName;
}

function createGetter(propertyName: string, propertyType: string): string[] {
	const words: string[] = [];

	words.push(propertyType, 'get', createName(propertyName, propertyType, 'Getter'), '=>', `${propertyName};`);

	return words;
}

function createSetter(propertyName: string, propertyType: string): string[] {
	const words: string[] = [];

	const parameterName = 'new' + (propertyName[0] === '_'
		? propertyName[1].toUpperCase() + propertyName.substr(2, propertyName.length)
		: propertyName[0].toUpperCase() + propertyName.substr(1, propertyName.length));

	words.push('set', createName(propertyName, propertyType, 'Setter'), `(${propertyType} ${parameterName}) {\n\t${propertyName} = ${parameterName};\n}`);

	return words;
}
