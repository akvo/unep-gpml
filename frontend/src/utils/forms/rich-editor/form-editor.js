/* eslint-disable no-else-return */
import { UIStore } from "../../../store";
import React, { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("react-rte"), { ssr: false });

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
  const handleChange = (value) => {
    setEditorValue(value);
    onChange(value === "" ? options.emptyValue : value.toString("html"));
  };

  const [editorValue, setEditorValue] = useState(
    RichTextEditor.createValueFromString("", "html")
  );

  useEffect(() => {
    setEditorValue(
      RichTextEditor.createValueFromString(value ? value : "", "html")
    );
  }, [value]);

  const toolbarConfig = {
    // Optionally specify the groups to display (displayed in the order listed).
    display: [
      "INLINE_STYLE_BUTTONS",
      "BLOCK_TYPE_BUTTONS",
      "LINK_BUTTONS",
      "BLOCK_TYPE_DROPDOWN",
      "HISTORY_BUTTONS",
    ],
    INLINE_STYLE_BUTTONS: [
      { label: "Bold", style: "BOLD", className: "custom-css-class" },
      { label: "Italic", style: "ITALIC" },
      { label: "Underline", style: "UNDERLINE" },
      { label: "Code", style: "CODE" },
    ],
    BLOCK_TYPE_DROPDOWN: [
      { label: "Normal", style: "unstyled" },
      { label: "Heading Large", style: "header-one" },
      { label: "Heading Medium", style: "header-two" },
      { label: "Heading Small", style: "header-three" },
    ],
    BLOCK_TYPE_BUTTONS: [
      { label: "UL", style: "unordered-list-item" },
      { label: "OL", style: "ordered-list-item" },
    ],
  };

  return (
    <RichTextEditor
      toolbarConfig={toolbarConfig}
      onChange={handleChange}
      value={editorValue}
      placeholder="Start typing here...."
    />
  );
};

export default RichWidget;
