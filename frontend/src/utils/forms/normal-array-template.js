import React, { useEffect } from "react";
import classNames from "classnames";

import Button from "antd/lib/button";
import Col from "antd/lib/col";
import Row from "antd/lib/row";
import { withConfigConsumer } from "antd/lib/config-provider/context";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import MinusOutlined from "@ant-design/icons/MinusOutlined";

import ArrayFieldTemplateItem from "./array-template-item";

const DESCRIPTION_COL_STYLE = {
  paddingBottom: "8px",
};

const NormalArrayFieldTemplate = ({
  canAdd,
  className,
  DescriptionField,
  disabled,
  formContext,
  // formData,
  idSchema,
  items,
  onAddClick,
  prefixCls,
  readonly,
  // registry,
  required,
  schema,
  title,
  TitleField,
  uiSchema,
}) => {
  const { labelAlign = "right", rowGutter = 24 } = formContext;

  const labelClsBasic = `${prefixCls}-item-label`;
  const labelColClassName = classNames(
    labelClsBasic,
    labelAlign === "left" && `${labelClsBasic}-left`
    // labelCol.className,
  );

  // custom options
  const showToolbar = uiSchema["ui:options"]?.["showToolbar"];
  // https://github.com/rjsf-team/react-jsonschema-form/issues/2082

  const addItemText = uiSchema["ui:options"]?.["addItemText"] || "Add Item";
  const removeItemText =
    uiSchema["ui:options"]?.["removeItemText"] || "Remove Item";
  const group = uiSchema["ui:group"];
  const formGroup = group && items.length !== 0 && `group-${group}`;

  useEffect(() => {
    // add one items by default
    if (group && items.length === 0) {
      onAddClick();
    }
  }, [group, items, onAddClick]);

  return (
    <>
      <fieldset className={`${className} ${formGroup}`} id={idSchema.$id}>
        <Row gutter={rowGutter}>
          {title && (
            <Col className={labelColClassName} span={24}>
              <TitleField
                id={`${idSchema.$id}__title`}
                key={`array-field-title-${idSchema.$id}`}
                required={required}
                title={uiSchema["ui:title"] || title}
              />
            </Col>
          )}

          {(uiSchema["ui:description"] || schema.description) && (
            <Col span={24} style={DESCRIPTION_COL_STYLE}>
              <DescriptionField
                description={uiSchema["ui:description"] || schema.description}
                id={`${idSchema.$id}__description`}
                key={`array-field-description-${idSchema.$id}`}
              />
            </Col>
          )}

          <Col className="row array-item-list" span={24}>
            {items &&
              items.map((itemProps) => (
                <ArrayFieldTemplateItem
                  {...itemProps}
                  showToolbar={showToolbar}
                  formContext={formContext}
                />
              ))}
          </Col>

          {canAdd && !group && (
            <Col span={24}>
              <Row
                gutter={rowGutter}
                justify="start"
                style={{ marginTop: "10px" }}
              >
                <Col flex="1">
                  <Button
                    block
                    className="array-item-add"
                    disabled={disabled || readonly}
                    onClick={onAddClick}
                    type="primary"
                  >
                    <PlusOutlined /> {addItemText}
                  </Button>
                </Col>
              </Row>
            </Col>
          )}
        </Row>
      </fieldset>
      {canAdd && group && (
        <Row gutter={rowGutter} justify="start" style={{ marginTop: "10px" }}>
          <Col flex="1">
            <Button
              // block
              className="array-item-add"
              disabled={disabled || readonly}
              onClick={onAddClick}
            >
              <PlusOutlined /> {addItemText}
            </Button>
            <Button
              danger
              disabled={disabled || readonly || items.length <= 1}
              onClick={
                items.length !== 0 &&
                items[items.length - 1].onDropIndexClick(items.length - 1)
              }
              type="link"
            >
              <MinusOutlined /> {removeItemText}
            </Button>
          </Col>
        </Row>
      )}
    </>
  );
};

export default withConfigConsumer({ prefixCls: "form" })(
  NormalArrayFieldTemplate
);
