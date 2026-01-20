import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('VueGuard active!');

	const hoverProvider = vscode.languages.registerHoverProvider('vue', {
		provideHover(document, position) {
			// Önce kullanıcının apiKey tanımlamasını kontrol ediyoruz
			const config = vscode.workspace.getConfiguration('vueGuard');
			const apiKey = config.get<string>('apiKey');

			if(!apiKey) {
				return new vscode.Hover(
					new vscode.MarkdownString('⚠️ **VueGuard:** Lütfen ayarlardan bir API Key tanımlayın.')
				);
			}

			// Seçilen aralığı ve kelimeyi alıyoruz
			const range = document.getWordRangeAtPosition(position);
			const word = document.getText(range);

			if(word) {
				return new vscode.Hover(
					new vscode.MarkdownString(`🛡️ **VueGuard Modu:** Aktif\n\n**API Key:** ${apiKey}\n\n**Kelime:** ${word}`)
				);
			}
		}
	});

	context.subscriptions.push(hoverProvider);
}

export function deactivate() {}