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
  view,
  setView,
  isAscending,
  filterVisible,
  setFilterVisible,
  renderFilterTag,
  sortPeople,
  updateQuery,
}) => {
  const selectionValue = (
    <div className="selection-value">
      <button className="select-button">
        <img src={DownArrow} className="selection-arrow" alt="down-arrow" />
      </button>
      <span className="label text-white">{`${view} view`}</span>
      <img src={GlobeOutlined} alt="globe-icon" />
    </div>
  );

  const filterTagValue = renderFilterTag()
    .flat()
    .filter((item) => item);

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
                  <Search updateQuery={updateQuery} setView={setView} />
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

                  <Button className="sort-btn" onClick={sortPeople}>
                    <SortIcon
                      style={{
                        transform:
                          isAscending || isAscending === null
                            ? "initial"
                            : "rotate(180deg)",
                      }}
                    />
                  </Button>
                </Space>
              </Col>
              {filterTagValue.length > 0 && (
                <Col lg={19} md={17} sm={15} className="filter-tag">
                  <Space direction="horizontal">{renderFilterTag()}</Space>
                </Col>
              )}
            </Row>
          </Col>
          {/* Map/Topic view dropdown */}
          <Col lg={2} md={4} sm={6} className="select-wrapper">
            <Select
              dropdownClassName="overlay-zoom"
              className="view-selection"
              value={selectionValue}
              onChange={(val) => setView(val)}
            >
              <Select.Option value="map">Map View</Select.Option>
              <Select.Option value="card">Card View </Select.Option>
            </Select>
          </Col>
        </Row>
      </div>
    </Col>
  );
};

const Search = withRouter(({ history, updateQuery, setView }) => {
  const [search, setSearch] = useState("");
  const handleSearch = (src) => {
    if (src) {
      history.push(`?q=${src.trim()}`);
      updateQuery("q", src.trim());
    } else {
      updateQuery("q", "");
    }
    setSearch("");
  };

  return (
    <div className="src">
      <Input
        className="input-src"
        placeholder="Search the community"
        value={search}
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
        onChange={(e) => {
          setSearch(e.target.value);
          if (e.target.value.length >= 3) {
            history.push(`?q=${e.target.value.trim()}`);
            updateQuery("q", e.target.value.trim());
          }
          if (e.target.value.length === 0) {
            updateQuery("q", "");
          }
        }}
      />
    </div>
  );
});

export default Header;
