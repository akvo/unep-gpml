import React, { useState } from "react";

import Input from "antd/lib/input";

import words from "lodash/words";

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
    if (keyCode === 32) {
      const char = target?.value != "" ? target?.value.length : 0;
      const wordLength = target?.value != "" ? words(target?.value).length : 0;
      if (!isMaxWord && wordLength === maxWord) {
        setIsMaxWord(char);
      }
      if (isMaxWord && wordLength < maxWord) {
        setIsMaxWord(false);
      }
      setWordCount(wordLength);
      // end of custom maxWord handle
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
