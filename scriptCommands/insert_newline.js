async (logger, context) => {
    const vscode = require("vscode");
    
    if (!vscode.window.activeTextEditor) {
        vscode.window.showErrorMessage("No editor active, cannot insert newline");
    }

    let editor = vscode.window.activeTextEditor;

    try {
        editor.edit((editBuilder => {
            /** @type {vscode.Position} */
            let location = null;
            if (editor.selection.isEmpty) {
                location = editor.selection.active;
            } else {
                location = editor.selection.start;
            }
            
            let line = editor.document.getText(new vscode.Range(new vscode.Position(location.line, 0), new vscode.Position(location.line, location.character)));
            let tabSize = -1;
            for (let i = line.length - 1; i >= 0; i--) {
                if (line[i].trim() === "") {
                    if (tabSize == -1) tabSize = i;
                } else {
                    tabSize = -1;
                }
            }
            if (tabSize == -1) tabSize = 0;

            logger("Final tabSize = " + tabSize);

            let indent = " ".repeat(tabSize + 1);

            let newPos = new vscode.Position(location.line - 1, Number.MAX_SAFE_INTEGER);
            editBuilder.insert(newPos, "\n" + indent);
        })).then(() => {
            let newSelections = [];
            for (const selection of editor.selections) {
                const oldCursorPosition = selection.start;
                const newCursorPosition = new vscode.Position(
                    oldCursorPosition.line - 1,
                    Number.MAX_SAFE_INTEGER
                );
            
                // We set start & end to the same Position, so this is setting a cursor position,
                // not a selected range of text
                const newSelection = new vscode.Selection(newCursorPosition, newCursorPosition);
                newSelections.push(newSelection);
            }
            editor.selections = newSelections;
        });
    } catch (e) {
        vscode.window.showErrorMessage("Error editing: " + e);
    }
}