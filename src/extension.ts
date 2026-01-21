import * as vscode from 'vscode';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export function activate(context: vscode.ExtensionContext) {
	console.log('VueGuard active!');

	const hoverProvider = vscode.languages.registerHoverProvider('vue', {
		async provideHover(document, position) {
			// Önce kullanıcının apiKey tanımlamasını kontrol ediyoruz
			const config = vscode.workspace.getConfiguration('vueGuard');
			const apiKey = config.get<string>('apiKey');

			if(!apiKey) {
				return new vscode.Hover(
					new vscode.MarkdownString('⚠️ **VueGuard:** Lütfen ayarlardan bir API Key tanımlayın.')
				);
			}

			const googleAI = createGoogleGenerativeAI({
				apiKey: apiKey
			});

			// Seçilen aralığı ve kelimeyi alıyoruz
			const range = document.getWordRangeAtPosition(position);
			const word = document.getText(range);

			try {
				const { text } = await generateText({
					model: googleAI('gemini-3-flash-preview'),
					system: `You are a Senior Vue 3 Performance Expert.
									Analyze the provided code for performance issues, memory leaks, and best practices.
									STRICT RULES:
									1. Always analyze based on Vue 3 Composition API.
									2. Provide your response ONLY in TURKISH.
									3. Use a clear, developer-friendy tone.
									
									RESPONSE FORMAT:
									🚨 **SORUN:** (Brief explanation in Turkish)
									✅ **ÇÖZÜM:** (Code snippet)
									💡 **NEDEN:** (Performance benefit in Turkish)`,
					prompt: word
				});

				const responseMarkdown = new vscode.MarkdownString();
				responseMarkdown.appendMarkdown(`### 🛡️ VueGuard Analizi\n\n`);
				responseMarkdown.appendMarkdown(text);

				return new vscode.Hover(responseMarkdown);
			} catch (error: any) {
				return new vscode.Hover(`❌ **AI Hatası:** ${error}`);
			}
		}
	});

	context.subscriptions.push(hoverProvider);
}

export function deactivate() {}