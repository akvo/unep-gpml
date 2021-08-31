/* eslint-disable no-else-return */
import { UIStore } from "../../store";
import React from "react";

import Radio from "antd/lib/radio";

const RadioWidget = ({
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

  const handleChange = ({ target: { value: nextValue } }) =>
    onChange(schema.type === "boolean" ? nextValue !== "false" : nextValue);

  const handleBlur = ({ target }) => onBlur(id, target.value);

  const handleFocus = ({ target }) => onFocus(id, target.value);

  // custom
  const highlight = UIStore.useState((s) => s.highlight);

  return (
    <Radio.Group
      disabled={disabled || (readonlyAsDisabled && readonly)}
      id={id}
      name={id}
      onBlur={!readonly ? handleBlur : undefined}
      onChange={!readonly ? handleChange : undefined}
      onFocus={!readonly ? handleFocus : undefined}
      value={`${value}`}
    >
      {enumOptions.map(({ value: optionValue, label: optionLabel }, i) => (
        <Radio
          className={
            required && !!rawErrors
              ? "radio-required"
              : required && highlight && !!rawErrors === false
              ? "radio-highlight"
              : undefined
          }
          autoFocus={i === 0 ? autofocus : false}
          disabled={enumDisabled && enumDisabled.indexOf(value) !== -1}
          key={`${optionValue}`}
          value={`${optionValue}`}
        >
          {optionLabel}
        </Radio>
      ))}
    </Radio.Group>
  );
};

export default RadioWidget;
