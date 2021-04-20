import React from "react";

import Button from "antd/lib/button";
import Col from "antd/lib/col";
import Row from "antd/lib/row";
import ArrowDownOutlined from "@ant-design/icons/ArrowDownOutlined";
import ArrowUpOutlined from "@ant-design/icons/ArrowUpOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";

const BTN_GRP_STYLE = {
  width: "100%",
};

const BTN_STYLE = {
  width: "calc(100% / 3)",
};

const ArrayFieldTemplateItem = ({
  children,
  disabled,
  formContext,
  hasMoveDown,
  hasMoveUp,
  hasRemove,
  hasToolbar,
  index,
  onDropIndexClick,
  onReorderClick,
  readonly,
  showToolbar,
}) => {
  const { rowGutter = 24, toolbarAlign = "top" } = formContext;

  // custom styling
  const toolbarFlex = hasMoveDown || hasMoveUp ? "192px" : "80px";
  const overideRemoveBtnStyle =
    hasMoveDown || hasMoveUp ? BTN_STYLE : { width: "100%" };

  return (
    <Row align={toolbarAlign} key={`array-item-${index}`} gutter={rowGutter}>
      <Col flex="1">{children}</Col>

      {hasToolbar && showToolbar && (
        <Col flex={toolbarFlex}>
          <Button.Group style={BTN_GRP_STYLE}>
            {(hasMoveUp || hasMoveDown) && (
              <Button
                disabled={disabled || readonly || !hasMoveUp}
                icon={<ArrowUpOutlined />}
                onClick={onReorderClick(index, index - 1)}
                style={BTN_STYLE}
                type="default"
              />
            )}

            {(hasMoveUp || hasMoveDown) && (
              <Button
                disabled={disabled || readonly || !hasMoveDown}
                icon={<ArrowDownOutlined />}
                onClick={onReorderClick(index, index + 1)}
                style={BTN_STYLE}
                type="default"
              />
            )}

            {hasRemove && (
              <Button
                danger
                disabled={disabled || readonly}
                icon={<DeleteOutlined />}
                onClick={onDropIndexClick(index)}
                style={overideRemoveBtnStyle}
                type="danger"
              />
            )}
          </Button.Group>
        </Col>
      )}
    </Row>
  );
};

ArrayFieldTemplateItem.defaultProps = {
  formContext: {},
};

export default ArrayFieldTemplateItem;
