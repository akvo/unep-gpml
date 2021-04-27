import React from "react";
import classNames from "classnames";
import { isObject, isNumber, intersection } from "lodash";

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
    // ## Remove value from formData
    if (
      formData?.[element.name] &&
      schema.properties?.[element.name]?.dependencies
    ) {
      const { dependencies } = schema.properties?.[element.name];
      let results = dependencies.filter((item) => {
        if (!intersection(formData?.[element.name], item.value).length > 0)
          return item;
      });
      results = results.map((item) => item.questions);
      results = results.flat(1);
      results.forEach((key) => {
        formData?.[key] && delete formData?.[key];
      });
    }

    const deppend = findSchemaDepend(element);
    if (deppend) {
      let answer = formData[deppend.id];
      answer = typeof answer === "string" ? answer.toLowerCase() : answer;
      let dependValue = deppend.value;
      if (Array.isArray(answer)) {
        dependValue = intersection(dependValue, answer).length !== 0;
      }
      if (!Array.isArray(answer)) {
        dependValue = Array.isArray(dependValue)
          ? dependValue.includes(answer)
          : dependValue === answer;
      }
      if (dependValue) {
        // ## TODO:: Need to check if depend id also depend to other question, then delete it from formData
        let parentDepend = schema?.properties?.[deppend.id]?.depend;
        if (parentDepend) {
          let parentAnswer = formData[parentDepend.id];
          parentAnswer =
            typeof parentAnswer === "string"
              ? parentAnswer.toLowerCase()
              : parentAnswer;
          let parentDependValue = parentDepend.value;
          if (Array.isArray(parentAnswer)) {
            parentDependValue =
              intersection(parentDependValue, parentAnswer).length !== 0;
          }
          if (!Array.isArray(parentAnswer)) {
            parentDependValue = Array.isArray(parentDependValue)
              ? parentDependValue.includes(parentAnswer)
              : parentDependValue === parentAnswer;
          }
          if (!parentDependValue) {
            // ## Remove value from formData
            let childKey =
              schema?.properties &&
              Object.keys(schema.properties).filter((key) => {
                // let value =
                //   schema.properties?.[key] &&
                //   schema.properties?.[key]?.depend?.value;
                // if (intersection(value, deppend.value).length > 0) return key;
                return schema.properties?.[key]?.depend?.id === deppend.id;
              });
            childKey.forEach((key) => {
              formData?.[key] && delete formData?.[key];
            });
            formData?.[deppend.id] && delete formData?.[deppend.id];
            return { display: "none" };
          }
        }
        // END OF parent depend check
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
              style={{ color: "#00AAF1", fontSize: "18px", marginTop: "10px" }}
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
