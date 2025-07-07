import * as vscode from "vscode";
import fetch from "node-fetch"; // We'll add this package next

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "lm-studio-helper.askModel",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("No editor is active.");
        return;
      }

      const selection = editor.selection;
      const text = selection.isEmpty
        ? editor.document.getText()
        : editor.document.getText(selection);

      const prompt = `Act as a programming assistant. Analyze or improve the following code:\n\n${text}`;

      try {
        const response = await fetch(
          "http://localhost:1234/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer dummy-key", // If needed, otherwise remove
            },
            body: JSON.stringify({
              model: "lmstudio", // Replace with your model name if needed
              messages: [{ role: "user", content: prompt }],
              temperature: 0.7,
              max_tokens: 512,
            }),
          }
        );

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (content) {
          vscode.window.showInformationMessage("LM Studio says:");
          const doc = await vscode.workspace.openTextDocument({
            content,
            language: editor.document.languageId,
          });
          vscode.window.showTextDocument(doc, { preview: false });
        } else {
          vscode.window.showErrorMessage("No response from LM Studio.");
        }
      } catch (err: any) {
        vscode.window.showErrorMessage(`Error: ${err.message}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
