/* eslint-disable no-else-return */
import React, { useState, useEffect, useMemo } from "react";
import { utils } from "@rjsf/core";
import { Select, Divider, Input, List } from "antd";
import debounce from "lodash.debounce";

import api from "../api";

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

const getSearchResult = async (q) => {
  const searchParms = new URLSearchParams(window.location.search);
  searchParms.set("limit", 10);
  searchParms.set("q", q);
  const url = `/list?${String(searchParms)}`;
  try {
    let result = await api.get(url);
    return result.data;
  } catch (err) {
    return err;
  }
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
  const [data, setData] = useState([]);
  const handleSearch = async (value) => {
    if (value.length > 3) {
      let res = await getSearchResult(value);
      setData(res);
    }
  };

  const debouncedResults = useMemo(() => debounce(handleSearch, 300), []);

  useEffect(() => {
    return () => {
      debouncedResults.cancel();
    };
  });

  const getPopupContainer = (node) => node.parentNode;
  const handleBlur = () => onBlur(id, processValue(schema, value));
  const handleFocus = () => onFocus(id, processValue(schema, value));

  return (
    <>
      <Select
        allowClear={uiSchema?.["ui:allowClear"] ? true : false}
        showSearch={uiSchema?.["ui:showSearch"] ? true : false}
        filterOption={(input, option) =>
          option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
          option.value === "-1"
        }
        autoFocus={autofocus}
        disabled={disabled || (readonlyAsDisabled && readonly)}
        id={id}
        mode={uiSchema?.["ui:mode"] !== undefined ? uiSchema["ui:mode"] : ""}
        name={id}
        onChange={!readonly ? handleChange : undefined}
        onSearch={handleSearch}
        placeholder={placeholder}
        style={SELECT_STYLE}
        virtual={false}
        dropdownRender={(menu) => <div>{menu}</div>}
        getPopupContainer={getPopupContainer}
        value={value}
        notFoundContent={null}
      >
        {data &&
          data.map(({ id: optionValue, title: optionLabel }, i) => (
            <Select.Option
              key={String(optionValue) + i.toString(36)}
              value={optionValue && optionValue}
            >
              {optionLabel}
            </Select.Option>
          ))}
      </Select>
    </>
  );
};

SelectWidget.defaultProps = {
  formContext: {},
};

export default SelectWidget;
