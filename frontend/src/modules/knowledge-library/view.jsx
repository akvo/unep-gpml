import React, { useState, useLayoutEffect, useEffect } from "react";
import { Row, Col, Button, Input, Space, Tag, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import FilterIcon from "../../images/knowledge-library/filter-icon.svg";
import GlobeOutlined from "../../images/knowledge-library/globe-outline.svg";
import TooltipOutlined from "../../images/knowledge-library/tooltip-outlined.svg";
import DownArrow from "../../images/knowledge-library/chevron-down.svg";

import "./styles.scss";
import { UIStore } from "../../store";
import LeftSidebar from "../left-sidebar/LeftSidebar";
import ResourceList from "./ResourceList";
import FilterDrawer from "./FilterDrawer";

import { withRouter } from "react-router-dom";

import api from "../../utils/api";

import isEmpty from "lodash/isEmpty";
import { topicNames } from "../../utils/misc";
import flatten from "lodash/flatten";
import values from "lodash/values";
import MapLanding from "./map-landing";
import TopicView from "./TopicView";

import IconLibrary from "../../images/capacity-building/ic-knowledge-library.svg";
import IconLearning from "../../images/capacity-building/ic-capacity-building.svg";
import IconExchange from "../../images/capacity-building/ic-exchange.svg";
import IconCaseStudies from "../../images/capacity-building/ic-case-studies.svg";

const { Option } = Select;
// Global variable
let tmid;

const KnowledgeLibrary = ({
  history,
  query,
  results,
  countData,
  pageSize,
  loading,
  filters,
  filterMenu,
  filterCountries,
  isAuthenticated,
  loginWithPopup,
  multiCountryCountries,

  //Functions
  updateQuery,
  setFilters,
  setRelations,
  setMultiCountryCountries,
  setWarningModalVisible,
  setStakeholderSignupModalVisible,
}) => {
  const [filterVisible, setFilterVisible] = useState(false);
  const [listVisible, setListVisible] = useState(true);
  const [view, setView] = useState("map");

  const sidebar = [
    {
      id: 1,
      title: "LIBRARY",
      url: "/knowledge-library",
      icon: IconLibrary,
    },
    {
      id: 2,
      title: "LEARNING",
      url: "/capacity-building",
      icon: IconLearning,
    },
    {
      id: 4,
      title: "Case studies",
      url: "/case-studies",
      icon: IconCaseStudies,
    },
  ];

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

  const {
    profile,
    countries,
    tags,
    transnationalOptions,

    representativeGroup,
  } = UIStore.useState((s) => ({
    profile: s.profile,
    countries: s.countries,
    tags: s.tags,
    transnationalOptions: s.transnationalOptions,
    sectorOptions: s.sectorOptions,
    geoCoverageTypeOptions: s.geoCoverageTypeOptions,
    languages: s.languages,
    representativeGroup: s.sectorOptions,
  }));

  const [toggleButton, setToggleButton] = useState("list");

  useEffect(() => {
    UIStore.update((e) => {
      e.disclaimer = "browse";
    });
    if (profile.reviewStatus === "APPROVED") {
      setTimeout(() => {
        api.get("/favorite").then((resp) => {
          setRelations(resp.data);
        });
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  useEffect(() => {
    if (!isEmpty(filterMenu)) {
      updateQuery("topic", filterMenu);
    }

    // NOTE: this are triggered when user click a topic from navigation menu
  }, [filterMenu]); // eslint-disable-line

  // Here is the function to render filter tag
  const renderFilterTag = () => {
    const renderName = (key, value) => {
      if (key === "topic") {
        return topicNames(value);
      }
      if (key === "tag") {
        const findTag = flatten(values(tags)).find((x) => x.id == value);

        return findTag ? findTag?.tag : value;
      }
      if (key === "country") {
        const findCountry = countries.find((x) => x.id == value);
        return findCountry?.name;
      }
      if (key === "transnational") {
        const findTransnational = transnationalOptions.find(
          (x) => x.id == value
        );
        return findTransnational?.name;
      }
      if (key === "representativeGroup") {
        const representativeGroups = representativeGroup.find(
          (x) => x == value
        );
        return representativeGroups;
      }
      if (key === "startDate") {
        return `Start date ${value}`;
      }
      if (key === "endDate") {
        return `End date ${value}`;
      }
    };
    return Object.keys(query).map((key, index) => {
      // don't render if key is limit and offset
      if (
        key === "limit" ||
        key === "offset" ||
        key === "q" ||
        key === "favorites"
      ) {
        return;
      }
      return query?.[key]
        ? query?.[key]?.map((x) => (
            <Tag
              className="result-box"
              closable
              onClick={() =>
                updateQuery(
                  key,
                  query?.[key]?.filter((v) => v !== x)
                )
              }
              onClose={() =>
                updateQuery(
                  key,
                  query?.[key]?.filter((v) => v !== x)
                )
              }
            >
              {renderName(key, x)}
            </Tag>
          ))
        : "";
    });
  };

  return (
    <Row id="knowledge-library">
      {/* Header */}
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
            <Col lg={2} md={4} sm={6} className="select-wrapper">
              <Select
                className="view-selection"
                value={selectionValue}
                onChange={(val) => setView(val)}
              >
                <Option value="map">Map View</Option>
                <Option value="topic">Topic View </Option>
              </Select>
            </Col>
          </Row>
        </div>
      </Col>

      {/* Content */}
      <Col span={24}>
        <div className="ui-container">
          {/* Filter Drawer */}
          {filterVisible && (
            <FilterDrawer
              filters={filters}
              filterVisible={filterVisible}
              setFilterVisible={setFilterVisible}
              countData={countData}
              query={query}
              updateQuery={(flag, val) => updateQuery(flag, val)}
              multiCountryCountries={multiCountryCountries}
              setMultiCountryCountries={setMultiCountryCountries}
            />
          )}
          <LeftSidebar active={1} sidebar={sidebar}>
            <Row className="resource-main-container">
              {/* Resource Main Content */}
              {listVisible && (
                <Col
                  lg={10}
                  md={9}
                  sm={12}
                  xs={24}
                  style={
                    view === "map"
                      ? {
                          backgroundColor: "rgba(237, 242, 247, 0.3)",
                        }
                      : {
                          backgroundColor: "rgba(237, 242, 247, 1)",
                          position: "unset",
                        }
                  }
                  className="resource-list-container"
                >
                  {/* Resource List */}
                  <ResourceList
                    view={view}
                    filters={filters}
                    countData={countData}
                    updateQuery={updateQuery}
                    loading={loading}
                    results={results}
                    pageSize={pageSize}
                    hideListButtonVisible={view === "map"}
                    listVisible={listVisible}
                    setListVisible={setListVisible}
                  />
                </Col>
              )}
              <Col
                lg={14}
                md={15}
                sm={12}
                xs={24}
                align="center"
                className="render-map-container map-main-wrapper"
                style={{
                  background: view === "topic" ? "#255B87" : "#fff",
                }}
              >
                {view === "map" ? (
                  <MapLanding
                    {...{
                      countData,
                      query,
                      setWarningModalVisible,
                      setStakeholderSignupModalVisible,
                      loginWithPopup,
                      isAuthenticated,
                      filters,
                      setFilters,
                      setToggleButton,
                      updateQuery,
                      multiCountryCountries,
                      setMultiCountryCountries,
                      setListVisible,
                    }}
                    isFilteredCountry={filterCountries}
                    isDisplayedList={listVisible}
                  />
                ) : (
                  <>
                    <TopicView updateQuery={updateQuery} />
                  </>
                )}
              </Col>
            </Row>
          </LeftSidebar>
        </div>
      </Col>
    </Row>
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
        placeholder="Search resources"
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

export default KnowledgeLibrary;
