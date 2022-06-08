/* eslint-disable no-else-return */
import React, { useState, useEffect, useRef } from "react";
import { Select, Spin } from "antd";
import debounce from "lodash.debounce";

import api from "../api";

const SELECT_STYLE = {
  width: "100%",
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

const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
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
  const [fetching, setFetching] = useState(false);
  const handleChange = (nextValue, option) => {
    onChange({
      id: nextValue,
      type: option,
    });
  };
  const [data, setData] = useState([]);
  const [searchStr, setSearchStr] = useState([]);
  const fetchRef = React.useRef(0);

  const prevValue = usePrevious(enumOptions);

  useEffect(() => {
    if (JSON.stringify(prevValue) !== JSON.stringify(enumOptions)) {
      setData(enumOptions.map((elm) => ({ id: elm.value, title: elm.label })));
    }
  }, [enumOptions, prevValue]);

  const handleSearch = React.useMemo(() => {
    const loadOptions = async (value) => {
      setSearchStr(value);
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setData([]);
      setFetching(true);
      let res = await getSearchResult(value);
      if (fetchId !== fetchRef.current) {
        return;
      }
      setData((oldArray) => [...res, ...oldArray]);
      setFetching(false);
    };

    return debounce(loadOptions, 300);
  }, []);

  const getPopupContainer = (node) => node.parentNode;

  return (
    <>
      <Select
        allowClear={uiSchema?.["ui:allowClear"] ? true : false}
        showSearch={uiSchema?.["ui:showSearch"] ? true : false}
        filterOption={false}
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
        value={value?.id ? value?.id : value}
        loading={fetching}
        notFoundContent={
          fetching ? (
            <Spin size="small" />
          ) : searchStr.length === 0 ? null : (
            <div>No Results Found</div>
          )
        }
      >
        {data &&
          data.map(
            ({ id: optionValue, title: optionLabel, type: optionType }, i) => (
              <Select.Option
                key={String(optionValue) + "-" + optionType}
                value={optionValue && optionValue}
                label={optionType}
              >
                {optionLabel}
              </Select.Option>
            )
          )}
      </Select>
    </>
  );
};

SelectWidget.defaultProps = {
  formContext: {},
};

export default SelectWidget;
