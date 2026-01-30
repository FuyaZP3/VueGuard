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
			const resultParse = parser.parseForESLint(code, {
				parser: require.resolve('@typescript-eslint/parser'),
				sourceType: 'module',
				ecmaVersion: 2020,
			});

			const ast = resultParse.ast;
			const scopeManager = resultParse.scopeManager;
			let targetName = '';
			let targetIdentifier: any = null;
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
				leaveNode: () => {}
			});

			// for template body (VNodes, VElement...)
			if(ast.templateBody) {
				parser.AST.traverseNodes(ast.templateBody, {
					enterNode: checkNode,
					leaveNode: () => {}
				});
			}

			// get identifier name
			if (foundNode && foundNode.type === 'VIdentifier' || foundNode.type === 'Identifier') {
				targetName = foundNode.name;
				console.log('Bulunan Değişken Adı: ', foundNode.name);

				const variable = scopeManager?.acquire(foundNode) || scopeManager?.getDeclaredVariables(foundNode.parent)[0];

				if(variable) {
					// get real refs for this variable
					const refs = variable.references.map((ref: any) => {
						const line = editor.document.positionAt(ref.identifier.range[0]).line;
						const lineText = editor.document.lineAt(line).text.trim();

						return `[Satır ${line + 1}]: ${lineText}`;
					});

					console.log(`Gerçek Referanslar (${variable}): `, refs);

					vscode.window.showInformationMessage(`${variable} için ${refs.length} gerçek referans bulundu.`);
				}

			}
		} catch(error: any) {
			vscode.window.showErrorMessage('AST Ayrıştırma Hatası: ', error);
		}
	});

	context.subscriptions.push(analyzeCommand);
}

export function deactivate() {}