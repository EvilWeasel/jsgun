import * as vscode from "vscode";
import * as path from "path";
import { addDecorationWithText } from "./decorations";
import { DebuggerUtils } from "./debugger-utils";

export async function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "jsgun" is now active!');

  const debuggerUtils = new DebuggerUtils();

  let disposable = vscode.commands.registerCommand(
    "jsgun.helloWorld",
    async () => {
      const activeEditor = vscode!.window!.activeTextEditor;
      if (!activeEditor) {
        return;
      }

      const document = activeEditor!.document;
      const fileName = path.basename(document.uri.toString());

      const { scriptId } = await debuggerUtils.post("Runtime.compileScript", {
        expression: document.getText(),
        sourceURL: fileName,
        persistScript: true,
      });

      await debuggerUtils.post("Runtime.runScript", {
        scriptId,
      });
      const data = await debuggerUtils.post("Runtime.globalLexicalScopeNames", {
        executionContextId: 1,
      });
      data.names.map(async (expression: string) => {
        const {
          result: { value },
        } = await debuggerUtils.post("Runtime.evaluate", {
          expression,
          contextId: 1,
        });
        const { result } = await debuggerUtils.post("Debugger.searchInContent", {
          scriptId,
          query: expression,
        });
        addDecorationWithText(
          `${expression}: ${value}`,
          result[0].lineNumber,
          result[0].lineContent.length,
          activeEditor
        );
      });

      vscode.window.showInformationMessage("Done!");
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(debuggerUtils);
}

// This method is called when your extension is deactivated
export function deactivate() {}
