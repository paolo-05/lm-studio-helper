import * as vscode from "vscode";
import fetch from "node-fetch";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "lm-studio-helper.askModel",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("No active editor.");
        return;
      }

      const selection = editor.selection;
      const selectedText = selection.isEmpty
        ? editor.document.getText()
        : editor.document.getText(selection);

      const prompt = `Act as a helpful programming assistant. Analyze, improve, or comment on the following code:\n\n${selectedText}`;

      try {
        const response = await fetch(
          "http://localhost:1234/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer dummy-key", // Remove if LM Studio doesn't require it
            },
            body: JSON.stringify({
              model: "lmstudio", // Replace with actual model name if needed
              messages: [{ role: "user", content: prompt }],
              temperature: 0.5,
              max_tokens: 512,
            }),
          }
        );

        const data = await response.json();
        console.log(response);

        const content = data.choices?.[0]?.message?.content?.trim();

        if (!content) {
          vscode.window.showErrorMessage("No response from LM Studio.");
          return;
        }
        // handle whole document, so create a new window
        // Insert response below the selection
        editor.edit((editBuilder) => {
          const insertPos = selection.end;
          const commentedOutput = `\n\n/* LM Studio Suggestion:\n${content}\n*/\n`;
          editBuilder.insert(insertPos, commentedOutput);
        });

        vscode.window.showInformationMessage("LM Studio suggestion inserted.");
      } catch (err: any) {
        vscode.window.showErrorMessage(`LM Studio Error: ${err.message}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
