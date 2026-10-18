"use client";

import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { EditorView, keymap } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import { useMemo } from "react";

const theme = EditorView.theme({
  "&": { fontSize: "13.5px", backgroundColor: "#fffdfa", border: "1px solid #e4dcd0", borderRadius: "8px" },
  "&.cm-focused": { outline: "2px solid rgb(168 92 64 / 0.35)", outlineOffset: "0" },
  ".cm-content": { fontFamily: "var(--font-mono)", padding: "8px 0", caretColor: "#a85c40" },
  ".cm-gutters": { backgroundColor: "#faf8f4", color: "#a89c8d", borderRight: "1px solid #ece5d8", borderRadius: "8px 0 0 8px" },
  ".cm-activeLine": { backgroundColor: "#f6efe6" },
  ".cm-activeLineGutter": { backgroundColor: "#f1e8dc", color: "#7a6f63" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": { backgroundColor: "#ecd3c6 !important" },
  ".cm-cursor": { borderLeftColor: "#a85c40" },
});

export default function CodeEditor({
  value,
  onChange,
  onRun,
  height = "320px",
  readOnly = false,
  ariaLabel = "Code editor",
}: {
  value: string;
  onChange?: (v: string) => void;
  onRun?: () => void;
  height?: string;
  readOnly?: boolean;
  ariaLabel?: string;
}) {
  const extensions = useMemo(
    () => [
      cpp(),
      theme,
      EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
      Prec.highest(
        keymap.of([
          {
            key: "Mod-Enter",
            run: () => {
              onRun?.();
              return true;
            },
          },
        ]),
      ),
    ],
    [onRun, ariaLabel],
  );
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      height={height}
      readOnly={readOnly}
      extensions={extensions}
      basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: true, indentOnInput: true, bracketMatching: true, closeBrackets: true, autocompletion: false, tabSize: 4 }}
      indentWithTab
    />
  );
}
