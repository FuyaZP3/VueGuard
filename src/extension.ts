import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('vue-guard is now active!');

	const hoverProvider = vscode.languages.registerHoverProvider('vue', {
		provideHover(document, position) {
			const range = document.getWordRangeAtPosition(position);
			const word = document.getText(range);

			if(word) {
				return new vscode.Hover(
					new vscode.MarkdownString(`### 🛡️ VueGuard Test\n\nŞu an **${word}** üzerindesiniz.`)
				);
			}

			// // return {
			// // 	contents: ['Hover Content']
			// // };
		}
	});

	context.subscriptions.push(hoverProvider);
}

export function deactivate() {}