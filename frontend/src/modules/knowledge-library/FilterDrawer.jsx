import React, { useState } from "react";
import { Row, Col, Space, Drawer, Checkbox, Tag, Card } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";

import { filterState } from "./common";
import { topicTypes, topicNames } from "../../utils/misc";
import humps from "humps";
import isEmpty from "lodash/isEmpty";

const FilterDrawer = ({
  filterVisible,
  setFilterVisible,
  countData,
  value,
  onChange,
}) => {
  const { resourceType } = filterState.useState((s) => ({
    resourceType: s.resourceType,
  }));

  const handleChangeResourceType = (flag, type) => {
    const val = value[flag];
    if (topicTypes?.length === val.length) {
      onChange(flag, [type]);
    } else {
      onChange(flag, [...val, type]);
    }
    filterState.update((e) => {
      e.resourceType = [...e.resourceType, type];
    });
  };

  const handleClearResourceType = () => {
    const val = topicTypes?.map((x) => humps.decamelize(x));
    onChange("topic", val);
    filterState.update((e) => {
      e.resourceType = [];
    });
  };

  return (
    <div className="site-drawer-render-in-current-wrapper">
      <Drawer
        title="Choose your filters below"
        placement="left"
        visible={filterVisible}
        getContainer={false}
        onClose={() => setFilterVisible(false)}
        closeIcon={<CloseCircleOutlined className="drawer-close-icon" />}
        style={{ position: "absolute" }}
        width={500}
        height="100%"
      >
        {/* Filter content */}
        <Row type="flex">
          {/* Resource type */}
          <Col span={24}>
            <Space align="middle">
              <div className="filter-title">Resource type</div>
              {isEmpty(resourceType) ? (
                <Tag>All (default)</Tag>
              ) : (
                <Tag closable={true} onClose={() => handleClearResourceType()}>
                  Clear selection
                </Tag>
              )}
            </Space>
            <Row type="flex" gutter={[12, 12]}>
              {topicTypes.map((type) => {
                const topic = humps.decamelize(type);
                const count =
                  countData?.find((it) => it.topic === topic)?.count || 0;
                return (
                  <Col span={6} key={type}>
                    <Card
                      onClick={() => handleChangeResourceType("topic", topic)}
                    >
                      <Space direction="vertical" align="center">
                        {topicNames(type)} {count}
                      </Space>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Col>
          {/* My Bookmarks */}
          <Col span={24}>
            <Space align="middle">
              <Checkbox onChange={() => console.log("checkbox")}>
                <span className="filter-title">My Bookmarks</span>
              </Checkbox>
            </Space>
          </Col>
          {/* Location */}
          <Col span={24}>
            <Space align="middle">
              <div className="filter-title">Location</div>
            </Space>
          </Col>
        </Row>
      </Drawer>
    </div>
  );
};

export default FilterDrawer;
