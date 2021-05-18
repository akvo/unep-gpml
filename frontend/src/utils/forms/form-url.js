import React from "react";

import Input from "antd/lib/input";

const INPUT_STYLE = {
  width: "100%",
};

const URLWidget = ({
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

  const handleChange = ({ target }) =>
    onChange(target.value === "" ? options.emptyValue : target.value);

  const handleBlur = ({ target }) => onBlur(id, target.value);

  const handleFocus = ({ target }) => onFocus(id, target.value);

  const addOnBefore = uiSchema?.["ui:addOnBefore"];

  return (
    <Input
      addonBefore={addOnBefore}
      disabled={disabled || (readonlyAsDisabled && readonly)}
      id={id}
      name={id}
      onBlur={!readonly ? handleBlur : undefined}
      onChange={!readonly ? handleChange : undefined}
      onFocus={!readonly ? handleFocus : undefined}
      placeholder={placeholder}
      style={INPUT_STYLE}
      type="text"
      value={value}
    />
  );
};

export default URLWidget;
