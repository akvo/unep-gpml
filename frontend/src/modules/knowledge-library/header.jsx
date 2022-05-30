import React, { useState } from "react";
import { Row, Col, Button, Input, Space, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import "./header.scss";
import FilterIcon from "../../images/knowledge-library/filter-icon.svg";
import { ReactComponent as SortIcon } from "../../images/knowledge-library/sort-icon.svg";
import { withRouter, useHistory } from "react-router-dom";
import { KNOWLEDGE_LIBRARY } from "../map/map";

const KnowledgeLibrarySearch = withRouter(
  ({ history, updateQuery, isShownForm, setIsShownForm }) => {
    const [search, setSearch] = useState("");
    const handleSearch = (src) => {
      if (src) {
        history.push(`?q=${src.trim()}`);
        updateQuery("q", src.trim());
      } else {
        updateQuery("q", "");
      }
      setSearch("");
      setIsShownForm(false);
    };

    return (
      <>
        <div className="src mobile-src">
          <Input
            className="input-src"
            placeholder="Search resources"
            value={search}
            suffix={<SearchOutlined />}
            onPressEnter={(e) => handleSearch(e.target.value)}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="src desktop-src">
          <Input
            className="input-src"
            placeholder="Search resources"
            value={search}
            suffix={<SearchOutlined />}
            onPressEnter={(e) => handleSearch(e.target.value)}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </>
    );
  }
);

const StakeholderOverviewSearch = withRouter(
  ({ history, updateQuery, setView, isShownForm, setIsShownForm }) => {
    const [search, setSearch] = useState("");
    const handleSearch = (src) => {
      if (src) {
        history.push(`?q=${src.trim()}`);
        updateQuery("q", src.trim());
      } else {
        updateQuery("q", "");
      }
      setSearch("");
      setIsShownForm(false);
    };

    return (
      <>
        <div className="src mobile-src">
          {!isShownForm && (
            <Button
              onClick={() => setIsShownForm(!isShownForm)}
              type="primary"
              shape="circle"
              size="small"
              icon={<SearchOutlined />}
            />
          )}
          {isShownForm && (
            <Input
              className="input-src"
              placeholder="Search the community"
              value={search}
              suffix={<SearchOutlined />}
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
          )}
        </div>
        <div className="src desktop-src">
          <Input
            className="input-src"
            placeholder="Search the community"
            value={search}
            suffix={<SearchOutlined />}
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
      </>
    );
  }
);

const Header = ({
  setView,
  filterVisible,
  setFilterVisible,
  selectionValue,
  filterTagValue,
  renderFilterTag,
  updateQuery,
}) => {
  const history = useHistory();
  const path = history?.location?.pathname;
  const [isShownForm, setIsShownForm] = useState(false);
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
          {/* Search input & filtered by list */}
          <Col lg={22} md={20} sm={18}>
            <Row type="flex" justify="space-between" align="middle">
              <div className="search-box search-box-mobile">
                {/* <Search updateQuery={updateQuery} /> */}
                {path === KNOWLEDGE_LIBRARY ? (
                  <KnowledgeLibrarySearch
                    {...{ updateQuery, isShownForm, setIsShownForm }}
                  />
                ) : (
                  <StakeholderOverviewSearch
                    {...{ updateQuery, isShownForm, setIsShownForm }}
                  />
                )}
                <Button
                  onClick={() => setFilterVisible(!filterVisible)}
                  className="filter-icon-button"
                  type="link"
                >
                  {filterTagValue.length > 0 && (
                    <div className="filter-status">{filterTagValue.length}</div>
                  )}
                  <img
                    src={FilterIcon}
                    className="filter-icon"
                    alt="config-icon"
                  />
                  Filter
                </Button>
              </div>
              {/* {filterTagValue.length > 0 && (
                <Col lg={19} md={17} sm={15} className="filter-tag">
                  <Space direction="horizontal">{renderFilterTag()}</Space>
                </Col>
              )} */}
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
              {path === KNOWLEDGE_LIBRARY ? (
                <Select.Option value="topic">Topic View </Select.Option>
              ) : (
                <Select.Option value="card">Card View </Select.Option>
              )}
            </Select>
          </Col>
        </Row>
      </div>
    </Col>
  );
};

export default Header;
