/* eslint-disable no-else-return */
import React, { useState } from "react";
import { utils } from "@rjsf/core";
import { Select, Divider, Input, List } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import ModalAddEntity from "../../modules/flexible-forms/EntityModal/add-entity-modal";

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

const SelectWidget = ({
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
  const { readonlyAsDisabled = true } = formContext;
  const { enumOptions, enumDisabled } = options;
  const handleChange = (nextValue) => onChange(processValue(schema, nextValue));
  const handleBlur = () => onBlur(id, processValue(schema, value));
  const handleFocus = () => onFocus(id, processValue(schema, value));
  const getPopupContainer = (node) => node.parentNode;
  const stringify = (currentValue) =>
    Array.isArray(currentValue) ? value.map(String) : String(value);

  const showEntity = uiSchema["ui:options"]?.["showEntity"];

  return (
    <div className="list tag-list" style={{ marginTop: 10 }}>
      <h5>Suggested tags</h5>
      <List itemLayout="horizontal">
        <List.Item>
          <List.Item.Meta
            title={
              <ul>
                {enumOptions.map((tag) => (
                  <li key={tag.value}>{tag.value}</li>
                ))}
              </ul>
            }
          />
        </List.Item>
      </List>
    </div>
  );
};

SelectWidget.defaultProps = {
  formContext: {},
};

export default SelectWidget;
