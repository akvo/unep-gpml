/* eslint-disable no-else-return */
import { UIStore } from "../../../store";
import React, { useState, useCallback, useMemo } from "react";
import {
  Editor,
  Transforms,
  createEditor,
  Descendant,
  Element as SlateElement,
} from "slate";
import { Editable, withReact, useSlate, Slate } from "slate-react";
import { withHistory } from "slate-history";
import { Element, Leaf } from "./SlateEditorMarkup";
import SlateEditorToolbar, { toggleMark } from "./SlateEditorToolbar";
import isHotkey from "is-hotkey";

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
};

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

const RichWidget = ({
  autofocus,
  disabled,
  formContext,
  id,
  // label,
  onBlur,
  onChange,
  onFocus,
  options,
  // placeholder,
  readonly,
  required,
  schema,
  // value,
  rawErrors,
}) => {
  const { readonlyAsDisabled = true } = formContext;

  const { enumOptions, enumDisabled } = options;

  const handleChange = ({ target: { value: nextValue } }) =>
    onChange(schema.type === "boolean" ? nextValue !== "false" : nextValue);

  const handleBlur = ({ target }) => onBlur(id, target.value);

  const handleFocus = ({ target }) => onFocus(id, target.value);

  const [value, setValue] = useState(initialValue);
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  // custom
  const highlight = UIStore.useState((s) => s.highlight);

  return (
    <Slate editor={editor} value={value} onChange={(value) => setValue(value)}>
      <SlateEditorToolbar />
      <div
        className="prose"
        style={{
          padding: "20px",
          backgroundColor: "#edf2f7",
        }}
      >
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Enter some rich text…"
          spellCheck
          autoFocus
          onKeyDown={(event) => {
            Object.keys(HOTKEYS).forEach((hotkey) => {
              if (isHotkey(hotkey, event)) {
                event.preventDefault();
                const mark = HOTKEYS[hotkey];
                toggleMark(editor, mark);
              }
            });
          }}
        />
      </div>
    </Slate>
  );
};

export default RichWidget;
