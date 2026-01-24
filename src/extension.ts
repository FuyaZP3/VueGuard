import * as vscode from 'vscode';
import * as parser from 'vue-eslint-parser';

export function activate(context: vscode.ExtensionContext) {
	console.log('VueGuard active!');

	let analyzeCommand = vscode.commands.registerCommand('vueGuard.analyzeBlock', async () => {
		const editor = vscode.window.activeTextEditor;
		if(!editor || !editor.document.fileName.endsWith('.vue')) {
			vscode.window.showWarningMessage('Lütfen bir Vue dosyası açın.');
			return;
		}

		const document = editor.document;
		const code = document.getText();
		const cursorOffset = document.offsetAt(editor.selection.active);

		try {
			const ast = parser.parse(code, {
				parser: require.resolve('@typescript-eslint/parser'),
				sourceType: 'module',
				ecmaVersion: 2020,
				ecmaFeatures: { jsx: true }
			});

			let foundNode: any = null;

			const checkNode = (node: parser.AST.Node) => {
				if(cursorOffset >= node.range[0] && cursorOffset <= node.range[1]) {
					if(!foundNode || (node.range[1] - node.range[0]) < (foundNode.range[1] - foundNode.range[0])) {
						foundNode = node;
					}
				}
			};

			// for JS/TS
			parser.AST.traverseNodes(ast, {
				enterNode: checkNode,
				leaveNode() {}
			});

			// for template body (VNodes, VElement...)
			if(ast.templateBody) {
				parser.AST.traverseNodes(ast.templateBody, {
					enterNode: checkNode,
					leaveNode() {}
				});
			}

			if(foundNode) {
				const isTemplate = foundNode.type.startsWith('V');
				const label = isTemplate ? 'Template Düğümü' : 'Script Düğümü';

				vscode.window.showInformationMessage(`${label}: ${foundNode.type}`);
				console.log('Düğüm Detayı: ', foundNode);

				if (foundNode.type === 'VIdentifier' || foundNode.type === 'Identifier') {
					console.log('Bulunan Değişken Adı: ', foundNode.name);
				}
			
			} else {
				vscode.window.showInformationMessage('Bu konumda bir düğüm bulunamadı!');
			}
		} catch(error: any) {
			vscode.window.showErrorMessage('AST Ayrıştırma Hatası: ', error);
		}
	});

	context.subscriptions.push(analyzeCommand);
}

export function deactivate() {}