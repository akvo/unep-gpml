import React from "react";
import dayjs from "dayjs";
import moment from "moment";

import DatePicker from "antd/lib/date-picker";

const DATE_PICKER_STYLE = {
  width: "100%",
};

function disabledDate(current) {
  // Can not select days after today and today
  return current && current > moment().endOf("day");
}

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

  return (
    <DatePicker
      picker={!options?.mode ? undefined : options.mode}
      disabledDate={
        typeof options?.allowFuture === "undefined" || options.allowFuture
          ? undefined
          : disabledDate
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
