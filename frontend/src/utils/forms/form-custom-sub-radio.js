/* eslint-disable no-else-return */
import { UIStore } from "../../store";
import React from "react";
import InfoBlue from "../../images/i-blue.png";
import { Col, Radio, Popover } from "antd";

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
    <div className="sub-content">
      <div className="sub-content-topics">
        <Radio.Group
          disabled={disabled || (readonlyAsDisabled && readonly)}
          id={id}
          name={id}
          onBlur={!readonly ? handleBlur : undefined}
          onChange={!readonly ? handleChange : undefined}
          onFocus={!readonly ? handleFocus : undefined}
          value={`${value}`}
          className="ant-row"
          style={{ marginLeft: -8, marginRight: -8 }}
        >
          {enumOptions.map(({ value: optionValue, label: optionLabel }, i) => {
            return (
              <Col
                className="gutter-row"
                xs={12}
                lg={6}
                style={{ paddingLeft: 8, paddingRight: 8 }}
              >
                <Radio.Button
                  className={`${
                    required && !!rawErrors
                      ? "radio-required "
                      : required && highlight && !!rawErrors === false
                      ? "radio-highlight"
                      : undefined
                  }`}
                  autoFocus={i === 0 ? autofocus : false}
                  disabled={enumDisabled && enumDisabled.indexOf(value) !== -1}
                  key={`${optionValue}`}
                  value={`${optionValue}`}
                >
                  {optionLabel}

                  <Popover content="Title">
                    <div className="info-icon-wrapper">
                      <img src={InfoBlue} />
                    </div>
                  </Popover>
                </Radio.Button>
              </Col>
            );
          })}
        </Radio.Group>
      </div>
    </div>
  );
};

export default RadioWidget;
