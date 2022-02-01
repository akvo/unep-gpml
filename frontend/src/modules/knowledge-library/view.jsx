import React, { useState, useLayoutEffect, useEffect } from "react";
import { Row, Col, Button, Input, Space, Tag, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import ConfigIcon from "../../images/knowledge-library/config-icon.svg";
import GlobeOutlined from "../../images/knowledge-library/globe-outline.svg";
import TooltipOutlined from "../../images/knowledge-library/tooltip-outlined.svg";
import DownArrow from "../../images/knowledge-library/chevron-down.svg";

import "./styles.scss";
import { UIStore } from "../../store";
import LeftSidebar from "../left-sidebar/LeftSidebar";
import ResourceList from "./ResourceList";
import FilterDrawer from "./FilterDrawer";
import { useQuery } from "./common";
import { useLocation, withRouter } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import api from "../../utils/api";
import { redirectError } from "../error/error-util";
import isEmpty from "lodash/isEmpty";
import { topicNames } from "../../utils/misc";
import flatten from "lodash/flatten";
import values from "lodash/values";
import MapLanding from "./map-landing";
import TopicView from "./TopicView";

const { Option } = Select;
// Global variabel
let tmid;

const KnowledgeLibrary = ({
  history,
  filters,
  setFilters,
  filterMenu,
  setWarningModalVisible,
  setStakeholderSignupModalVisible,
}) => {
  const query = useQuery();
  const [filterVisible, setFilterVisible] = useState(false);
  const [listVisible, setListVisible] = useState(true);
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

  const {
    profile,
    countries,
    tags,
    transnationalOptions,
    sectorOptions,
    geoCoverageTypeOptions,
    languages,
  } = UIStore.useState((s) => ({
    profile: s.profile,
    countries: s.countries,
    tags: s.tags,
    transnationalOptions: s.transnationalOptions,
    sectorOptions: s.sectorOptions,
    geoCoverageTypeOptions: s.geoCoverageTypeOptions,
    languages: s.languages,
  }));

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCountries, setFilterCountries] = useState([]);
  const location = useLocation();
  const [relations, setRelations] = useState([]);
  const { isAuthenticated, loginWithPopup, isLoading } = useAuth0();
  const [warningVisible, setWarningVisible] = useState(false);
  const pageSize = 8;
  const [toggleButton, setToggleButton] = useState("list");
  const { innerWidth } = window;
  const [countData, setCountData] = useState([]);
  const [multiCountryCountries, setMultiCountryCountries] = useState([]);

  // Matches the height of the map or topics to the list height
  const listHeight = document.querySelector(".resource-list-container")
    ?.clientHeight;

  const [contentHeight, setContentHeight] = useState(listHeight);

  function useWindowDimensions() {
    const hasWindow = typeof window !== "undefined";
    function getWindowDimensions() {
      const width = hasWindow ? window.innerWidth : null;
      const height = hasWindow ? window.innerHeight : null;
      return {
        width,
        height,
      };
    }

    const [windowDimensions, setWindowDimensions] = useState(
      getWindowDimensions()
    );

    useEffect(() => {
      if (hasWindow) {
        function handleResize() {
          setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasWindow]);

    return windowDimensions;
  }

  useEffect(() => {
    setTimeout(() => {
      setContentHeight(listHeight);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listHeight, useWindowDimensions().width, results.length]);

  const getResults = () => {
    // NOTE: The url needs to be window.location.search because of how
    // of how `history` and `location` are interacting!
    const searchParms = new URLSearchParams(window.location.search);
    searchParms.set("limit", pageSize);
    const url = `/browse?${String(searchParms)}`;
    api
      .get(url)
      .then((resp) => {
        setResults(resp?.data?.results);
        setCountData(resp?.data?.counts);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        redirectError(err, history);
      });
  };

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
      setTimeout(getResults, 0);
    }

    if (isLoading === false && filters) {
      const newParams = new URLSearchParams({
        ...filters,
        topic: query.topic,
        tag: query.tag,
      });
      history.push(`/knowledge-library?${newParams.toString()}`);
      clearTimeout(tmid);
      tmid = setTimeout(getResults, 1000);
    }
    // NOTE: Since we are using `history` and `location`, the
    // dependency needs to be []. Ignore the linter warning, because
    // adding a dependency here on location makes the FE send multiple
    // requests to the backend.
  }, [isLoading]); // eslint-disable-line

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
  }, [profile]);

  useEffect(() => {
    if (!isEmpty(filterMenu)) {
      updateQuery("topic", filterMenu);
    }

    // NOTE: this are triggered when user click a topic from navigation menu
  }, [filterMenu]); // eslint-disable-line

  const updateQuery = (param, value) => {
    const topScroll = window.innerWidth < 640 ? 996 : 207;
    window.scrollTo({
      top: window.pageYOffset < topScroll ? window.pageYOffset : topScroll,
    });
    setLoading(true);
    const newQuery = { ...query };

    newQuery[param] = value;
    if (param !== "offset") {
      newQuery["offset"] = 0;
    }
    setFilters(newQuery);
    const newParams = new URLSearchParams(newQuery);
    history.push(`/knowledge-library?${newParams.toString()}`);
    clearTimeout(tmid);
    tmid = setTimeout(getResults, 1000);
    if (param === "country") {
      setFilterCountries(value);
    }
  };

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
                    <Search />
                    <Button
                      onClick={() => setFilterVisible(!filterVisible)}
                      type="ghost"
                      shape="circle"
                      icon={
                        <img
                          src={ConfigIcon}
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

          <LeftSidebar active={1}>
            <Row className="resource-main-container">
              {/* Resource Main Content */}
              {listVisible && (
                <Col
                  lg={10}
                  md={9}
                  sm={12}
                  xs={24}
                  className="resource-list-container"
                >
                  {/* Resource List */}
                  <ResourceList
                    filters={filters}
                    setListVisible={setListVisible}
                    countData={countData}
                    updateQuery={updateQuery}
                    loading={loading}
                    results={results}
                    pageSize={pageSize}
                    hideListButtonVisible={view === "map"}
                  />
                </Col>
              )}
              {/* Map/Topic View */}
              <Col
                lg={listVisible ? 14 : 24}
                md={listVisible ? 15 : 24}
                sm={listVisible ? 12 : 24}
                xs={24}
                align="center"
                className="render-map-container"
                style={{
                  background: view === "topic" ? "#255B87" : "#fff",
                  height: `${contentHeight}px`,
                }}
              >
                {view === "map" ? (
                  <MapLanding
                    {...{
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
                      listVisible,
                      contentHeight,
                    }}
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

const Search = withRouter(({ history }) => {
  const [search, setSearch] = useState("");
  const handleSearch = (src) => {
    if (src) {
      history.push(`/browse/?q=${src.trim()}`);
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
