import React from "react";
import classNames from "classnames";
import { isObject, isNumber } from "lodash";

import { utils } from "@rjsf/core";
import Button from "antd/lib/button";
import Col from "antd/lib/col";
import Row from "antd/lib/row";
import PlusCircleOutlined from "@ant-design/icons/PlusCircleOutlined";

const { canExpand } = utils;

const DESCRIPTION_COL_STYLE = {
  paddingBottom: "8px",
};

const ObjectFieldTemplate = ({
  DescriptionField,
  description,
  disabled,
  formContext,
  formData,
  idSchema,
  onAddClick,
  prefixCls,
  properties,
  readonly,
  required,
  schema,
  title,
  uiSchema,
}) => {
  const { colSpan = 24, labelAlign = "right", rowGutter = 24 } = formContext;

  const labelClsBasic = `${prefixCls}-item-label`;
  const labelColClassName = classNames(
    labelClsBasic,
    labelAlign === "left" && `${labelClsBasic}-left`
    // labelCol.className,
  );

  const findSchema = (element) => element.content.props.schema;
  const findSchemaType = (element) => findSchema(element).type;
  const findSchemaDepend = (element) => findSchema(element).depend;
  const findUiSchema = (element) => element.content.props.uiSchema;
  const findUiSchemaField = (element) => findUiSchema(element)["ui:field"];
  const findUiSchemaWidget = (element) => findUiSchema(element)["ui:widget"];
  const findUiSchemaSpan = (element) => findUiSchema(element)["ui:span"];

  const calculateColSpan = (element) => {
    const type = findSchemaType(element);
    const field = findUiSchemaField(element);
    const widget = findUiSchemaWidget(element);
    const span = findUiSchemaSpan(element);

    const defaultColSpan =
      properties.length < 2 || // Single or no field in object.
      type === "object" ||
      type === "array" ||
      widget === "textarea"
        ? 24
        : 12;

    if (span) {
      return span;
    }
    if (isObject(colSpan)) {
      return (
        colSpan[widget] || colSpan[field] || colSpan[type] || defaultColSpan
      );
    }
    if (isNumber(colSpan)) {
      return colSpan;
    }
    return defaultColSpan;
  };

  const filterHidden = (element) =>
    element.content.props.uiSchema["ui:widget"] !== "hidden";

  const formGroup = (ui) => {
    const group = ui["ui:group"];
    if (group) {
      return `group-${group}`;
    }
    return;
  };

  // hide and show form when dependent
  const dependHidden = (element) => {
    const deppend = findSchemaDepend(element);
    if (deppend) {
      let answer = formData[deppend.id];
      answer = typeof answer === "string" ? answer.toLowerCase() : answer;
      let dependValue = deppend.value;
      dependValue = Array.isArray(dependValue)
        ? dependValue.includes(answer) // use intersect lodash
        : dependValue === answer;
      if (dependValue) {
        return { display: "block" };
      }
      return { display: "none" };
    }
    return { display: "block" };
  };

  return (
    <fieldset id={idSchema.$id} className={formGroup(uiSchema)}>
      <Row gutter={rowGutter}>
        {uiSchema["ui:title"] !== false && (uiSchema["ui:title"] || title) && (
          <Col className={labelColClassName} span={24}>
            <h1
              style={{ color: "#00AAF1", fontSize: "20px" }}
              id={`${idSchema.$id}-title`}
              required={required}
            >
              {title}
            </h1>
            <hr style={{ border: "none", borderTop: "1px solid #ddd" }} />
          </Col>
        )}
        {uiSchema["ui:description"] !== false &&
          (uiSchema["ui:description"] || description) && (
            <Col span={24} style={DESCRIPTION_COL_STYLE}>
              <DescriptionField
                description={uiSchema["ui:description"] || description}
                id={`${idSchema.$id}-description`}
              />
            </Col>
          )}
        {properties.filter(filterHidden).map((element) => (
          <Col
            key={element.name}
            xs={24}
            lg={calculateColSpan(element)}
            style={dependHidden(element)}
          >
            {element.content}
          </Col>
        ))}
      </Row>

      {canExpand(schema, uiSchema, formData) && (
        <Col span={24}>
          <Row gutter={rowGutter} justify="end">
            <Col flex="192px">
              <Button
                block
                className="object-property-expand"
                disabled={disabled || readonly}
                onClick={onAddClick(schema)}
                type="primary"
              >
                <PlusCircleOutlined /> Add Item
              </Button>
            </Col>
          </Row>
        </Col>
      )}
    </fieldset>
  );
};

export default ObjectFieldTemplate;
