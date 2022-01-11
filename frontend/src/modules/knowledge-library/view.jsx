import React, { useState } from "react";
import { Row, Col, Button, Input, Space, Tag, Select, Drawer } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";

import "./styles.scss";
import LeftSidebar from "../left-sidebar/LeftSidebar";
import ResourceList from "./ResourceList";

const { Option } = Select;

const KnowledgeLibrary = ({ history, filters, setFilters, filterMenu }) => {
  const [filterVisible, setFilterVisible] = useState(false);
  const [listVisible, setListVisible] = useState(true);

  return (
    <Row id="knowledge-library">
      {/* Header */}
      <Col span={24} className="ui-header">
        <div className="ui-container">
          <Row type="flex" justify="space-between" align="middle">
            {/* Search input & filtered by list */}
            <Col span={22}>
              <Row type="flex" justify="space-between" align="middle">
                <Col span={4}>
                  <Space>
                    <Search />
                    <Button
                      onClick={() => setFilterVisible(true)}
                      type="ghost"
                      shape="circle"
                      icon={<FilterOutlined />}
                    />
                  </Space>
                </Col>
                <Col span={20}>
                  <Space direction="horizontal">
                    <Tag closable>Initiative</Tag>
                    <Tag closable>Italy</Tag>
                  </Space>
                </Col>
              </Row>
            </Col>
            {/* Map/Topic view dropdown */}
            <Col span={2}>
              <Select defaultValue={"map"}>
                <Option value="map">Map View</Option>
                <Option value="topic">Topic View</Option>
              </Select>
            </Col>
          </Row>
        </div>
      </Col>

      {/* Content */}
      <Col span={24}>
        <div className="ui-container">
          <LeftSidebar active={1}>
            <Row className="resource-main-container">
              {/* Filter Drawer */}
              <div className="site-drawer-render-in-current-wrapper">
                <Drawer
                  title="Basic Drawer"
                  placement="left"
                  visible={filterVisible}
                  getContainer={false}
                  onClose={() => setFilterVisible(false)}
                  style={{ position: "absolute" }}
                >
                  <p>Some contents...</p>
                </Drawer>
              </div>

              {/* Resource Main Content */}
              {listVisible && (
                <Col span={8} className="resource-list-container">
                  {/* Resource List */}
                  <ResourceList
                    history={history}
                    filters={filters}
                    setFilters={setFilters}
                    filterMenu={filterMenu}
                    setListVisible={setListVisible}
                  />
                </Col>
              )}
              {/* Map/Topic View */}
              <Col span={listVisible ? 16 : 24} align="center">
                Map here...
              </Col>
            </Row>
          </LeftSidebar>
        </div>
      </Col>
    </Row>
  );
};

const Search = () => {
  const [search, setSearch] = useState("");
  const handleSearch = (src) => {
    console.log(src);
  };

  return (
    <div className="src">
      <Input
        className="input-src"
        placeholder="Search"
        suffix={
          <Button
            onClick={() => handleSearch(search)}
            type="primary"
            shape="circle"
            size="small"
            icon={<SearchOutlined />}
          />
        }
        onPressEnter={(e) => handleSearch(e.target.value)}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
};

export default KnowledgeLibrary;
