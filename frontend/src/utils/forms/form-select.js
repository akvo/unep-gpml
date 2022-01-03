/* eslint-disable no-else-return */
import React, { useState } from "react";
import { utils } from "@rjsf/core";
import { Select, Divider, Input } from "antd";
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

  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Select
        allowClear={uiSchema?.["ui:allowClear"] ? true : false}
        showSearch={uiSchema?.["ui:showSearch"] ? true : false}
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
          option.value === "-1"
        }
        autoFocus={autofocus}
        disabled={disabled || (readonlyAsDisabled && readonly)}
        getPopupContainer={getPopupContainer}
        id={id}
        mode={uiSchema?.["ui:mode"] !== undefined ? uiSchema["ui:mode"] : ""}
        name={id}
        onBlur={!readonly ? handleBlur : undefined}
        onChange={!readonly ? handleChange : undefined}
        onFocus={!readonly ? handleFocus : undefined}
        placeholder={placeholder}
        style={SELECT_STYLE}
        value={typeof value !== "undefined" ? stringify(value) : undefined}
        virtual={false}
        dropdownRender={(menu) => (
          <div>
            {menu}
            {showEntity && (
              <>
                <Divider style={{ margin: "4px 0" }} />
                <div
                  style={{ display: "flex", flexWrap: "nowrap", padding: 8 }}
                >
                  <a onClick={() => setShowModal(!showModal)}>
                    <PlusOutlined /> Add new entity
                  </a>
                </div>
              </>
            )}
          </div>
        )}
      >
        {enumOptions &&
          enumOptions.map(({ value: optionValue, label: optionLabel }, i) => (
            <Select.Option
              disabled={
                enumDisabled && enumDisabled.indexOf(optionValue) !== -1
              }
              key={String(optionValue) + i.toString(36)}
              value={String(optionValue)}
            >
              {optionLabel}
            </Select.Option>
          ))}
      </Select>
      <ModalAddEntity
        visible={showModal}
        close={() => setShowModal(!showModal)}
      />
    </>
  );
};

SelectWidget.defaultProps = {
  formContext: {},
};

export default SelectWidget;
