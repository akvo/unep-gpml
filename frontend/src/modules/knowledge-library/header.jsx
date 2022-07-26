import React, { useState } from "react";
import { Row, Col, Button, Input, Space, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import "./header.scss";
import FilterIcon from "../../images/knowledge-library/filter-icon.svg";
import { ReactComponent as SortIcon } from "../../images/knowledge-library/sort-icon.svg";
import { withRouter, useHistory } from "react-router-dom";
import { KNOWLEDGE_LIBRARY } from "../map/map";
import { eventTrack } from "../../utils/misc";
import GlobeOutlined from "../../images/knowledge-library/globe-outline.svg";
import TooltipOutlined from "../../images/knowledge-library/tooltip-outlined.svg";
import { ReactComponent as DownArrow } from "../../images/knowledge-library/chevron-down.svg";
import topicViewIcon from "../../images/knowledge-library/topic-view-icon.svg";
import { ReactComponent as IconExchange } from "../../images/capacity-building/ic-exchange.svg";

const KnowledgeLibrarySearch = withRouter(
  ({ history, updateQuery, isShownForm, setIsShownForm }) => {
    const [search, setSearch] = useState("");
    const handleSearch = (src) => {
      eventTrack("Communities", "Search", "Button");
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
      eventTrack("Knowledge library", "Search", "Button");
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
  filterTagValue,
  renderFilterTag,
  updateQuery,
  view,
}) => {
  const history = useHistory();
  const path = history?.location?.pathname;
  const [isShownForm, setIsShownForm] = useState(false);

  const selectionValue = (
    <>
      <div className="selection-value">
        <button className="select-button">
          <div className="selection-arrow">
            <DownArrow />
          </div>
        </button>
        <span className="label text-white">{`${view} view`}</span>
        {view === "map" ? (
          <img src={GlobeOutlined} alt="globe-icon" className="filter-img" />
        ) : (
          <img src={topicViewIcon} alt="topic-icon" className="filter-img" />
        )}
      </div>
    </>
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
                  onClick={() => {
                    setFilterVisible(!filterVisible);
                    path === KNOWLEDGE_LIBRARY
                      ? eventTrack("Knowledge library", "Filter", "Button")
                      : eventTrack("Communities", "Filter", "Button");
                  }}
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
              dropdownClassName="overlay-dropdown"
              className="view-selection"
              value={view}
              onChange={(val) => setView(val)}
            >
              <Select.Option value="map">
                {/* Map View */}

                <>
                  <div className="selection-value">
                    <button className="select-button">
                      <div className="selection-arrow">
                        <DownArrow />
                      </div>
                    </button>
                    <span className="label text-white">{`${view} view`}</span>
                    <img
                      src={GlobeOutlined}
                      alt="globe-icon"
                      className="filter-img"
                    />
                  </div>
                  <span className="dropdown-label">Map View</span>
                </>
              </Select.Option>
              <Select.Option
                value={path === KNOWLEDGE_LIBRARY ? "topic" : "grid"}
              >
                <>
                  <div className="selection-value">
                    <button className="select-button">
                      <div className="selection-arrow">
                        <DownArrow />
                      </div>
                    </button>
                    <span className="label text-white">{`${view} view`}</span>
                    <img
                      src={topicViewIcon}
                      alt="topic-icon"
                      className="filter-img"
                    />
                  </div>
                  <span className="dropdown-label">
                    {path === KNOWLEDGE_LIBRARY ? "Topic" : "Grid"} View
                  </span>
                </>
              </Select.Option>
            </Select>
          </Col>
        </Row>
      </div>
    </Col>
  );
};

export default Header;
