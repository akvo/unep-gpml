/* eslint-disable no-else-return */
import React, { useState } from "react";
import { utils } from "@rjsf/core";
import { AutoComplete } from "antd";

const { asNumber, guessType } = utils;

const SELECT_STYLE = {
  width: "100%",
};

const nums = new Set(["number", "integer"]);

const processValue = (schema, value) => {
  const { type, items } = schema;

  if (value === "") {
    return undefined;
  } else if (type === "array" && items && nums.has(items.type)) {
    return value.map(asNumber);
  } else if (type === "boolean") {
    return value === "true";
  } else if (type === "number") {
    return asNumber(value);
  }
  // If type is undefined, but an enum is present, try and infer the type from
  // the enum values
  if (schema.enum) {
    if (schema.enum.every((x) => guessType(x) === "number")) {
      return asNumber(value);
    } else if (schema.enum.every((x) => guessType(x) === "boolean")) {
      return value === "true";
    }
  }
  return value;
};

const AutoCompleteWidget = ({
  autofocus,
  disabled,
  formContext,
  id,
  // label,
  multiple,
  onBlur,
  onChange,
  onFocus,
  options,
  placeholder,
  readonly,
  // required,
  schema,
  uiSchema,
  value,
}) => {
  const { enumOptions, enumDisabled } = options;
  const handleChange = (nextValue) => onChange(nextValue);

  return (
    <>
      <AutoComplete
        options={enumOptions}
        placeholder={placeholder}
        onChange={!readonly ? handleChange : undefined}
        filterOption={(inputValue, option) =>
          option?.value?.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
        }
      />
    </>
  );
};

AutoCompleteWidget.defaultProps = {
  formContext: {},
};

export default AutoCompleteWidget;
