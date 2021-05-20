import React from "react";
import dayjs from "dayjs";
import moment from "moment";

import DatePicker from "antd/lib/date-picker";

const DATE_PICKER_STYLE = {
  width: "100%",
};

const DateWidget = ({
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
  formData,
}) => {
  const { readonlyAsDisabled = true } = formContext;

  const handleChange = (nextValue) =>
    onChange(nextValue && nextValue.format("YYYY-MM-DD"));

  const handleBlur = () => onBlur(id, value);

  const handleFocus = () => onFocus(id, value);

  const getPopupContainer = (node) => node.parentNode;

  function disableDate(current) {
    let end = "day";
    if (options?.mode && options?.mode === "year") end = "year";
    if (options?.disableDate === "future")
      return current && current > moment().endOf(end);
    if (options?.disableDate === "past")
      return current && current < moment().subtract(1, "days").endOf("day");
  }

  return (
    <DatePicker
      picker={!options?.mode ? undefined : options.mode}
      disabledDate={
        typeof options?.disableDate === "undefined" ? undefined : disableDate
      }
      disabled={disabled || (readonlyAsDisabled && readonly)}
      getPopupContainer={getPopupContainer}
      id={id}
      name={id}
      onBlur={!readonly ? handleBlur : undefined}
      onChange={!readonly ? handleChange : undefined}
      onFocus={!readonly ? handleFocus : undefined}
      placeholder={placeholder}
      showTime={false}
      style={DATE_PICKER_STYLE}
      value={value && dayjs(value)}
    />
  );
};

export default DateWidget;
