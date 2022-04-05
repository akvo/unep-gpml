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

import { ReactComponent as IconLibrary } from "../../images/capacity-building/ic-knowledge-library.svg";
import { ReactComponent as IconLearning } from "../../images/capacity-building/ic-capacity-building.svg";
import { ReactComponent as IconExchange } from "../../images/capacity-building/ic-exchange.svg";
import { ReactComponent as IconCaseStudies } from "../../images/capacity-building/ic-case-studies.svg";
import { ReactComponent as SortIcon } from "../../images/knowledge-library/sort-icon.svg";
import { titleCase } from "../../utils/string";
import { multicountryGroups } from "./multicountry";

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
  isLoading,
  setLoading,

  //Functions
  getResults,
  updateQuery,
  setFilters,
  setRelations,
  setFilterCountries,
  setMultiCountryCountries,
  setWarningModalVisible,
  setStakeholderSignupModalVisible,
}) => {
  const [filterVisible, setFilterVisible] = useState(false);
  const [listVisible, setListVisible] = useState(true);
  const [isAscending, setIsAscending] = useState(null);
  const [allResults, setAllResults] = useState([]);
  const [view, setView] = useState("map");

  const sidebar = [
    {
      id: 1,
      title: "LIBRARY",
      url: "/knowledge-library",
      icon: <IconLibrary />,
    },
    {
      id: 2,
      title: "LEARNING",
      url: "/capacity-building",
      icon: <IconLearning />,
    },
    {
      id: 4,
      title: "Case studies",
      url: "/case-studies",
      icon: <IconCaseStudies />,
    },
  ];

  const selectionValue = (
    <div className="selection-value">
      <button className="select-button">
        <img src={DownArrow} className="selection-arrow" alt="down-arrow" />
      </button>
      <span className="label text-white">{`${view} view`}</span>
      <img src={GlobeOutlined} alt="globe-icon" />
    </div>
  );

  const {
    tags,
    profile,
    countries,
    organisations,
    transnationalOptions,
    mainContentType,
    representativeGroup,
  } = UIStore.useState((s) => ({
    tags: s.tags,
    profile: s.profile,
    countries: s.countries,
    organisations: s.organisations,
    transnationalOptions: s.transnationalOptions,
    sectorOptions: s.sectorOptions,
    geoCoverageTypeOptions: s.geoCoverageTypeOptions,
    mainContentType: s.mainContentType,
    representativeGroup: s.representativeGroup,
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

  useEffect(() => {
    // setFilterCountries if user click from map to browse view
    query?.country &&
      query?.country.length > 0 &&
      setFilterCountries(query.country);

    // Manage filters display
    !filters && setFilters(query);
    if (filters) {
      setFilters({ ...filters, topic: query.topic, tag: query.tag });
      setFilterCountries(filters.country);
    }

    setLoading(true);
    if (isLoading === false && !filters) {
      setTimeout(getResults(query), 0);
    }

    if (isLoading === false && filters) {
      const newParams = new URLSearchParams({
        ...filters,
        topic: query.topic,
        tag: query.tag,
      });
      if (history.location.pathname === "/knowledge-library") {
        history.push(`/knowledge-library?${newParams.toString()}`);
      }
      clearTimeout(tmid);
      tmid = setTimeout(getResults(query), 1000);
    }

    if (
      multiCountryCountries.length === 0 &&
      query?.transnational?.length > 0
    ) {
      updateQuery("transnational", []);
    }

    if (query?.favorites?.length > 0) {
      updateQuery("favorites", false);
    }

    // NOTE: Since we are using `history` and `location`, the
    // dependency needs to be []. Ignore the linter warning, because
    // adding a dependency here on location makes the FE send multiple
    // requests to the backend.
  }, [isLoading]); // eslint-disable-line

  // Here is the function to render filter tag
  const renderFilterTag = () => {
    const renderName = (key, value) => {
      if (key === "topic") {
        return topicNames(value);
      }
      if (key === "tag") {
        const findTag = flatten(values(tags)).find((x) => x.id == value);

        return findTag ? titleCase(findTag?.tag) : titleCase(value);
      }
      if (key === "country") {
        const findCountry = countries.find((x) => x.id == value);
        return findCountry?.name;
      }
      if (key === "transnational") {
        const transnationalGroup = multicountryGroups
          .map((multicountryGroup) => multicountryGroup.item)
          .flat();

        const findTransnational = transnationalGroup.find((x) => x.id == value);
        return findTransnational?.name;
      }

      if (key === "representativeGroup") {
        const representativeGroups = representativeGroup.find(
          (x) => x?.code?.toLowerCase() == value?.toLowerCase()
        );
        return value.toLowerCase() === "other"
          ? "Other"
          : representativeGroups?.name;
      }
      if (key === "startDate") {
        return `Start date ${value}`;
      }
      if (key === "endDate") {
        return `End date ${value}`;
      }
      if (key === "subContentType") {
        const findSubContentType = mainContentType.find((subContent) =>
          subContent.childs.find((child) => child?.title?.includes(value))
        );

        return `${value} ${findSubContentType?.name}`;
      }
      if (key === "entity") {
        const findOrganisation = organisations.find(
          (organisation) => organisation.id == value
        );
        return findOrganisation?.name;
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

  const sortResults = () => {
    if (!isAscending) {
      const sortAscending = allResults.sort((result1, result2) => {
        if (result1?.title) {
          return result1?.title
            ?.trim()
            .localeCompare(result2?.title?.trim(), "en", {
              numeric: true,
            });
        } else {
          return result1?.name
            ?.trim()
            .localeCompare(result2?.name?.trim(), "en", {
              numeric: true,
            });
        }
      });
      setAllResults(sortAscending);
    } else {
      const sortDescending = allResults.sort((result1, result2) => {
        if (result2?.title) {
          return result2?.title
            ?.trim()
            .localeCompare(result1?.title?.trim(), "en", {
              numeric: true,
            });
        } else {
          return result2?.name
            ?.trim()
            .localeCompare(result1?.name?.trim(), "en", {
              numeric: true,
            });
        }
      });
      setAllResults(sortDescending);
    }
    setIsAscending(!isAscending);
  };

  useEffect(() => {
    setAllResults(
      [...results].sort((a, b) => Date.parse(b.created) - Date.parse(a.created))
    );
  }, [results]);

  const filterTagValue = renderFilterTag()
    .flat()
    .filter((item) => item);

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
                    <Button className="sort-btn" onClick={sortResults}>
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
              {...{
                query,
                countData,
                filters,
                filterVisible,
                setFilterVisible,
                multiCountryCountries,
                setMultiCountryCountries,
                filterTagValue,
              }}
              updateQuery={(flag, val) => updateQuery(flag, val)}
            />
          )}
          <LeftSidebar active={1} sidebar={sidebar}>
            <Row
              className="resource-main-container"
              style={{ display: view === "map" ? "block" : "flex" }}
            >
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
                          position: "relative",
                        }
                  }
                  className="resource-list-container"
                >
                  {/* Resource List */}
                  <ResourceList
                    {...{
                      view,
                      filters,
                      results,
                      allResults,
                      countData,
                      loading,
                      pageSize,
                      listVisible,
                      updateQuery,
                      setListVisible,
                      isAscending,
                    }}
                    hideListButtonVisible={view === "map"}
                  />
                </Col>
              )}

              {view === "map" ? (
                <Col
                  lg={14}
                  md={15}
                  sm={12}
                  xs={24}
                  align="center"
                  className="render-map-container map-main-wrapper"
                  style={{
                    background: view === "topic" ? "#255B87" : "#fff",
                    flex: view === "topic" && "auto",
                  }}
                >
                  <MapLanding
                    {...{
                      query,
                      countData,
                      filters,
                      setFilters,
                      setWarningModalVisible,
                      setStakeholderSignupModalVisible,
                      loginWithPopup,
                      isAuthenticated,
                      setToggleButton,
                      updateQuery,
                      multiCountryCountries,
                      setMultiCountryCountries,
                      setListVisible,
                    }}
                    isFilteredCountry={filterCountries}
                    isDisplayedList={listVisible}
                  />
                </Col>
              ) : (
                <Col
                  lg={14}
                  md={15}
                  sm={12}
                  xs={24}
                  align="center"
                  className="render-map-container "
                  style={{
                    background: view === "topic" ? "#255B87" : "#fff",
                    flex: view === "topic" && "auto",
                    maxWidth: view === "topic" ? "calc(100% - 300px)" : "",
                  }}
                >
                  <TopicView {...{ updateQuery, query }} />
                </Col>
              )}
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
    setSearch("");
  };

  return (
    <div className="src">
      <Input
        className="input-src"
        placeholder="Search resources"
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
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
});

export default KnowledgeLibrary;
