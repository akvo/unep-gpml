/* eslint-disable no-else-return */
import { UIStore } from "../../store";
const { mainContentType } = UIStore.currentState;
import React from "react";
import { Col, Radio, Popover } from "antd";
import InfoBlue from "../../images/i-blue.png";

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
      className="ant-row"
    >
      {enumOptions.map(({ value: optionValue, label: optionLabel }, i) => {
        const img = require(`../../images/${optionValue}.png`).default;
        const desc = mainContentType.find(
          (element) => element.code === optionValue
        ).desc;
        return (
          <Col className="gutter-row" xs={12} lg={6}>
            <Radio.Button
              className={`custom-radio ${
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
              <div className="content-circle-wrapper">
                <div className="content-circle">
                  <img src={img} alt="Initiative Image" />
                </div>
                <div className="info-icon-container">
                  <h2>{optionLabel}</h2>
                  <Popover content={desc}>
                    <div className="info-icon-wrapper">
                      <img src={InfoBlue} />
                    </div>
                  </Popover>
                </div>
              </div>
            </Radio.Button>
          </Col>
        );
      })}
    </Radio.Group>
  );
};

export default RadioWidget;
