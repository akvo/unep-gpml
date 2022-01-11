import React, { useState } from "react";
import {
  Row,
  Col,
  Button,
  Input,
  Space,
  Tag,
  Select,
  Drawer,
  PageHeader,
  Card,
  Avatar,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  UserOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

import "./style.scss";
import LeftSidebar from "../left-sidebar/LeftSidebar";

const { Option } = Select;

const KnowledgeLibrary = () => {
  const [filterVisible, setFilterVisible] = useState(false);

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
            <Row>
              {/* Resource List & Filter drawer */}
              <Col span={8} className="site-drawer-render-in-current-wrapper">
                {/* Filter Drawer */}
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
                {/* Resource List */}
                <Row>
                  <Col span={24}>
                    <PageHeader
                      className="resource-list-header"
                      ghost={false}
                      onBack={() => console.log("back")}
                      title="Hide List"
                      subTitle="Showing 10 of 92 results"
                      extra={<Button>Sort By: A &gt; Z</Button>}
                    />
                  </Col>
                  <Col span={24} className="resource-list">
                    <Card className="resource-item">
                      <div className="topic">Technical Resource</div>
                      <div className="item-body">
                        <div className="title">
                          Legal limits on single-use plastics and microplastics{" "}
                        </div>
                        <div className="description">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Donec tempor ante ac leo cursus...
                        </div>
                      </div>
                      <div className="item-footer">
                        <Space size={5}>
                          <Avatar.Group
                            maxCount={3}
                            maxStyle={{
                              color: "#f56a00",
                              backgroundColor: "#fde3cf",
                            }}
                          >
                            {["a", "b"].map((b, i) => (
                              <Tooltip
                                key={`avatar-${i}`}
                                title={b}
                                placement="top"
                              >
                                <Avatar
                                  style={{ backgroundColor: "#FFB800" }}
                                  icon={<UserOutlined />}
                                />
                              </Tooltip>
                            ))}
                          </Avatar.Group>{" "}
                          <span className="avatar-number">+42</span>
                        </Space>
                        <span className="read-more">
                          <Link to="#">
                            Read more <ArrowRightOutlined />
                          </Link>
                        </span>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </Col>
              {/* Map/Topic View */}
              <Col span={16} align="center">
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
