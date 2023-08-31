import React, { useState } from "react";
import { Row, Col, Button, Input, Space, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import styles from "./header.module.scss";
import { useHistory } from "react-router-dom";
import { KNOWLEDGE_LIBRARY } from "../map/map";
import { eventTrack } from "../../utils/misc";
import DownArrow from "../../images/knowledge-library/chevron-down.svg";
import { useRouter } from "next/router";

const KnowledgeLibrarySearch = ({
  router,
  updateQuery,
  isShownForm,
  setIsShownForm,
}) => {
  const [search, setSearch] = useState("");
  const handleSearch = (src) => {
    eventTrack("Communities", "Search", "Button");
    if (src) {
      router.push(`?q=${src.trim()}`);
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
};

const StakeholderOverviewSearch = ({
  router,
  updateQuery,
  setView,
  isShownForm,
  setIsShownForm,
}) => {
  const [search, setSearch] = useState("");
  const handleSearch = (src) => {
    eventTrack("Knowledge library", "Search", "Button");
    if (src) {
      // router.push(`?q=${src.trim()}`);
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, q: src.trim() },
        },
        undefined,
        { shallow: true }
      );

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
                router.push(`?q=${e.target.value.trim()}`);
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
            // if (e.target.value.length >= 3) {
            //   router.push(`?q=${e.target.value.trim()}`);
            //   updateQuery("q", e.target.value.trim());
            // }
            // if (e.target.value.length === 0) {
            //   updateQuery("q", "");
            // }
          }}
        />
      </div>
    </>
  );
};

const Header = ({
  setView,
  filterVisible,
  setFilterVisible,
  filterTagValue,
  renderFilterTag,
  updateQuery,
  view,
}) => {
  const router = useRouter();
  const path = router.pathname;

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
          <img
            src="/knowledge-library/globe-outline.svg"
            alt="globe-icon"
            className="filter-img"
          />
        ) : (
          <img
            src="/knowledge-library/topic-view-icon.svg"
            alt="topic-icon"
            className="filter-img"
          />
        )}
      </div>
    </>
  );

  return (
    <Col span={24} className={`${styles.uiHeader} ui-header`}>
      <div className={`${styles.uiContainer} ui-container`}>
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
                    {...{ updateQuery, isShownForm, setIsShownForm, router }}
                  />
                ) : (
                  <StakeholderOverviewSearch
                    {...{ updateQuery, isShownForm, setIsShownForm, router }}
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
                    src="/knowledge-library/filter-icon.svg"
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
              dropdownClassName={styles.overlayDropdown}
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
                      src="/knowledge-library/globe-outline.svg"
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
                      src="/knowledge-library/topic-view-icon.svg"
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
