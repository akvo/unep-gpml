import React, { useEffect } from "react";
import classNames from "classnames";
import Button from "antd/lib/button";
import Col from "antd/lib/col";
import Row from "antd/lib/row";
import { withConfigConsumer } from "antd/lib/config-provider/context";
import {
  MinusOutlined,
  PlusOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";

import ArrayFieldTemplateItem from "./array-template-item";

import { Collapse } from "antd";

const { Panel } = Collapse;

import { UIStore } from "../../store";

const DESCRIPTION_COL_STYLE = {
  paddingBottom: "8px",
};

const NormalArrayFieldTemplate = ({
  canAdd,
  className,
  DescriptionField,
  disabled,
  formContext,
  formData,
  idSchema,
  items,
  onAddClick,
  onReorderClick,
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
  const showCollapse = uiSchema["ui:options"]?.["collapsible"];
  // https://github.com/rjsf-team/react-jsonschema-form/issues/2082

  const addItemText = uiSchema["ui:options"]?.["addItemText"] || "Add Item";
  const removeItemText =
    uiSchema["ui:options"]?.["removeItemText"] || "Remove Item";
  const group = uiSchema["ui:group"];
  const formGroup = group && items.length !== 0 ? `group-${group}` : "";

  useEffect(() => {
    if (group && items.length === 0) {
      onAddClick();
    }
  }, [group, items, onAddClick]);

  return (
    <>
      <fieldset className={`${className} ${formGroup}`} id={idSchema.$id}>
        {showCollapse ? (
          <div className="collapse-wrapper">
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
            <Collapse>
              {items &&
                items.map((itemProps, index) => {
                  const label = schema?.["description"];
                  const custom = schema?.["custom"];
                  let array = [
                    ...UIStore.currentState.organisations,
                    ...UIStore.currentState.nonMemberOrganisations,
                  ];
                  return (
                    <Panel
                      header={
                        <div className="collapse-heaeder">
                          {formContext?.data.S4["S4_G5"][label] &&
                          formContext?.data.S4["S4_G5"][label].length > 0 &&
                          formContext?.data.S4["S4_G5"][label][
                            index
                          ]?.hasOwnProperty("role")
                            ? custom === "entity"
                              ? array.find(
                                  (element) =>
                                    element.id ===
                                    formContext?.data.S4["S4_G5"][label]?.[
                                      index
                                    ]?.[custom]
                                )?.name
                              : UIStore.currentState.stakeholders.stakeholders.find(
                                  (element) =>
                                    element.id ===
                                    formContext?.data.S4["S4_G5"][label]?.[
                                      index
                                    ]?.[custom]
                                )?.firstName
                            : ""}
                        </div>
                      }
                      key={index}
                      extra={
                        <>
                          {formContext?.data.S4["S4_G5"][label] &&
                            formContext?.data.S4["S4_G5"][label].length > 0 &&
                            formContext?.data.S4["S4_G5"][label][
                              index
                            ]?.hasOwnProperty("role") && (
                              <div className="collapse-subHeaeder">
                                {
                                  formContext?.data.S4["S4_G5"][label][index]
                                    .role
                                }
                              </div>
                            )}
                          <div style={{ marginLeft: "auto" }}>
                            <DeleteOutlined
                              onClick={
                                items.length !== 0 &&
                                items[items.length - 1].onDropIndexClick(index)
                              }
                            />
                            {index !== 0 && (
                              <ArrowUpOutlined
                                className="reorder-icon"
                                onClick={items[items.length - 1].onReorderClick(
                                  index,
                                  index - 1
                                )}
                              />
                            )}
                          </div>
                        </>
                      }
                    >
                      <ArrayFieldTemplateItem
                        {...itemProps}
                        showToolbar={showToolbar}
                        formContext={formContext}
                      />
                    </Panel>
                  );
                })}
            </Collapse>
          </div>
        ) : (
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
        )}
      </fieldset>
      {canAdd && group && !showCollapse && (
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
      {canAdd && group && showCollapse && (
        <Row gutter={rowGutter} justify="start" style={{ marginTop: "10px" }}>
          <Col flex="1">
            <Button
              className="array-item-add collapse-add-button"
              disabled={disabled || readonly}
              onClick={onAddClick}
            >
              <PlusOutlined /> {addItemText}
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
