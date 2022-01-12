import React, { useState } from "react";
import { Row, Col, Space, Drawer, Checkbox, Tag, Card, Image } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import classNames from "classnames";

import { useAuth0 } from "@auth0/auth0-react";
import { filterState } from "./common";
import { topicTypes, topicNames } from "../../utils/misc";
import CountryTransnationalFilter from "./country-transnational-filter";
import humps from "humps";
import isEmpty from "lodash/isEmpty";

const FilterDrawer = ({
  filterVisible,
  setFilterVisible,
  countData,
  query,
  updateQuery,
}) => {
  const { resourceType } = filterState.useState((s) => ({
    resourceType: s.resourceType,
  }));
  const { isAuthenticated } = useAuth0();

  const handleChangeResourceType = (flag, type) => {
    const val = query[flag];
    let updateVal = [];
    if (topicTypes?.length === val.length) {
      updateVal = [type];
    } else if (val.includes(type)) {
      updateVal = val.filter((x) => x !== type);
    } else {
      updateVal = [...val, type];
    }
    updateQuery(flag, updateVal);
    filterState.update((e) => {
      e.resourceType = updateVal;
    });
  };

  const handleClearResourceType = () => {
    const val = topicTypes?.map((x) => humps.decamelize(x));
    updateQuery("topic", val);
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
        <Row type="flex" gutter={[0, 24]}>
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
                      className={classNames("resource-type-card", {
                        active: resourceType?.includes(topic),
                      })}
                    >
                      <Space direction="vertical" align="center">
                        <Image />
                        <div className="topic-text">{topicNames(type)}</div>
                        <div className="topic-count">{count}</div>
                      </Space>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Col>
          {/* My Bookmarks */}
          {isAuthenticated && (
            <Col span={24}>
              <Space align="middle">
                <Checkbox
                  className="my-favorites"
                  checked={query?.favorites?.indexOf("true") > -1}
                  onChange={({ target: { checked } }) =>
                    updateQuery("favorites", checked)
                  }
                >
                  My Bookmarks
                </Checkbox>
              </Space>
            </Col>
          )}
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
