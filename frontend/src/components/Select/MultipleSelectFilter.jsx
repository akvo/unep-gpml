import React from "react";
import { Col, Space, Tag, Select } from "antd";
import isEmpty from "lodash/isEmpty";
import "./styles.scss";

const MultipleSelectFilter = ({
  title,
  options,
  value,
  query,
  flag,
  updateQuery,
  span = 24,
}) => {
  return (
    <Col span={span} className="multiselection-filter">
      <Space align="middle">
        <div className="filter-title multiple-filter-title">{title}</div>
        {!isEmpty(query?.[flag]) ? (
          <Tag
            className="clear-selection"
            closable
            onClose={() => updateQuery(flag, [])}
            onClick={() => updateQuery(flag, [])}
          >
            Clear Selection
          </Tag>
        ) : (
          ""
        )}
      </Space>
      <div>
        <Select
          dropdownClassName="multiselection-dropdown"
          showSearch
          allowClear
          mode="multiple"
          placeholder="All (default)"
          options={options}
          filterOption={(input, option) =>
            option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          value={value}
          onChange={(val) => updateQuery(flag, val)}
          onDeselect={(val) =>
            updateQuery(
              flag,
              query?.[flag]?.filter((x) => x != val)
            )
          }
          virtual={false}
        />
      </div>
    </Col>
  );
};

export default MultipleSelectFilter;
