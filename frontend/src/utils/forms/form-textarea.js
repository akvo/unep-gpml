import React, { useState } from "react";

import Input from "antd/lib/input";

const INPUT_STYLE = {
  width: "100%",
};

const TextareaWidget = ({
  // autofocus,
  disabled,
  formContext,
  id,
  // label,
  onBlur,
  onChange,
  onFocus,
  options,
  placeholder,
  readonly,
  // required,
  // schema,
  value,
  uiSchema,
}) => {
  const { readonlyAsDisabled = true } = formContext;
  // custom state for maxWord
  const [isMaxWord, setIsMaxWord] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  // custom Textarea ui schema,
  const maxWord = uiSchema?.["ui:maxWord"]; // Number
  const maxLength = uiSchema?.["ui:maxLength"]; // Number
  const showCount = uiSchema?.["ui:showCount"]; // Boolean

  const handleChange = ({ target }) =>
    onChange(target.value === "" ? options.emptyValue : target.value);

  const handleBlur = ({ target }) => onBlur(id, target.value);

  const handleFocus = ({ target }) => onFocus(id, target.value);

  const handleOnKeyUp = ({ target, keyCode }) => {
    // custom handle for maxWord
    const text = target?.value.trim();
    const char = text != "" ? target?.value.length : 0;
    const wordLength = text != "" ? text.split(" ").length : 0;
    if (keyCode === 32 && !isMaxWord && wordLength >= maxWord) {
      // when hit space
      setIsMaxWord(char);
    }
    if (keyCode === 8 && isMaxWord && wordLength <= maxWord) {
      // when hit backspace
      setIsMaxWord(false);
    }
    setWordCount(wordLength);
    // end of custom maxWord handle
  };

  const handleOnPaste = ({ clipboardData }) => {
    // slice text value if more then maxWord
    const text = clipboardData.getData("text").trim();
    const word = text.split(" ");
    if (text !== "" && !isMaxWord && word.length >= maxWord) {
      setIsMaxWord(word.slice(0, maxWord).join(" ").length);
    }
  };

  return (
    <>
      <Input.TextArea
        disabled={disabled || (readonlyAsDisabled && readonly)}
        id={id}
        name={id}
        onBlur={!readonly ? handleBlur : undefined}
        onChange={!readonly ? handleChange : undefined}
        onFocus={!readonly ? handleFocus : undefined}
        onKeyUp={handleOnKeyUp}
        onPaste={handleOnPaste}
        placeholder={placeholder}
        rows={options.rows || 4}
        style={INPUT_STYLE}
        type="textarea"
        value={value}
        maxLength={maxLength || isMaxWord}
        showCount={showCount}
      />
      {maxWord && (
        <span
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >{`${wordCount}/${maxWord}`}</span>
      )}
    </>
  );
};

export default TextareaWidget;
