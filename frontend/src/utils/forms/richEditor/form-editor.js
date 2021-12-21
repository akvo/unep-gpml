/* eslint-disable no-else-return */
import { UIStore } from "../../../store";
import React, { useState, useCallback, useMemo } from "react";
import RichTextEditor from "react-rte";

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
  value,
  rawErrors,
}) => {
  const { readonlyAsDisabled = true } = formContext;

  const { enumOptions, enumDisabled } = options;

  const handleChange = (value) => {
    setEditorValue(value);
  };

  const handleBlur = (value) => onBlur(id, value.toString("html"));

  const handleFocus = (value) => onFocus(id, value.toString("html"));

  // custom
  const highlight = UIStore.useState((s) => s.highlight);

  const [editorValue, setEditorValue] = useState(
    RichTextEditor.createValueFromString("", "html")
  );

  return (
    <RichTextEditor
      onChange={handleChange}
      value={editorValue}
      placeholder="Start typing here...."
    />
  );
};

export default RichWidget;
