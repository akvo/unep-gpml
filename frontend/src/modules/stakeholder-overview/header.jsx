import React, { useState } from "react";
import { Row, Col, Space, Button, Select, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { withRouter } from "react-router-dom";

import FilterIcon from "../../images/knowledge-library/filter-icon.svg";
import GlobeOutlined from "../../images/knowledge-library/globe-outline.svg";
import TooltipOutlined from "../../images/knowledge-library/tooltip-outlined.svg";
import DownArrow from "../../images/knowledge-library/chevron-down.svg";
import { ReactComponent as SortIcon } from "../../images/knowledge-library/sort-icon.svg";

const Header = ({
  isAscending,
  filterVisible,
  setFilterVisible,
  renderFilterTag,
  sortPeople,
  updateQuery,
}) => {
  const [view, setView] = useState("map");

  const selectionValue = (
    <div className="selection-value">
      <button className="select-button">
        <img src={DownArrow} className="selection-arrow" alt="down-arrow" />
      </button>
      <span className="label text-white">{`${view} view`}</span>
      {view.toLowerCase().includes("map") ? (
        <img src={GlobeOutlined} alt="globe-icon" />
      ) : (
        <img src={TooltipOutlined} alt="tooltip-icon" />
      )}
    </div>
  );

  return (
    <Col span={24} className="ui-header">
      <div className="ui-container">
        <Row
          type="flex"
          justify="space-between"
          align="middle"
          gutter={[10, 10]}
          className="header-filter-option"
        >
          <Col lg={22} md={20} sm={18}>
            <Row type="flex" justify="space-between" align="middle">
              <Col lg={5} md={7} sm={9} className="search-box">
                <Space>
                  <Search updateQuery={updateQuery} />
                  <Button
                    onClick={() => setFilterVisible(!filterVisible)}
                    type="ghost"
                    shape="circle"
                    icon={
                      <img
                        src={FilterIcon}
                        className="filter-icon"
                        alt="config-icon"
                      />
                    }
                  />
                </Space>
              </Col>
              <Col lg={19} md={17} sm={15} className="filter-tag">
                <Space direction="horizontal">{renderFilterTag()}</Space>
              </Col>
            </Row>
          </Col>
          {/* Map/Topic view dropdown */}
          {/* <Col lg={2} md={4} sm={6} className="select-wrapper">
            <Select
              className="view-selection"
              value={selectionValue}
              onChange={(val) => setView(val)}
            >
              <Select.Option value="list">Map View</Select.Option>
              <Select.Option value="topic">Topic View </Select.Option>
            </Select>
          </Col> */}
          <Button className="sort-btn" onClick={sortPeople}>
            <SortIcon />{" "}
            <span>
              Sort By:
              <br />{" "}
              {isAscending || isAscending === null ? (
                <b>A&gt;Z</b>
              ) : (
                <b>Z&gt;A</b>
              )}
            </span>
          </Button>
        </Row>
      </div>
    </Col>
  );
};

const Search = withRouter(({ history, updateQuery }) => {
  const [search, setSearch] = useState("");
  const handleSearch = (src) => {
    if (src) {
      history.push(`?q=${src.trim()}`);
      updateQuery("q", src.trim());
    } else {
      updateQuery("q", "");
    }
  };

  return (
    <div className="src">
      <Input
        className="input-src"
        placeholder="Search the community"
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
});

export default Header;
