import React, { useState, useLayoutEffect, useEffect } from "react";
import { Row, Col, Button, Input, Space, Tag, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import flatten from "lodash/flatten";
import values from "lodash/values";

import "./styles.scss";
import { UIStore } from "../../store";
import api from "../../utils/api";
import { titleCase } from "../../utils/string";
import isEmpty from "lodash/isEmpty";
import { topicNames } from "../../utils/misc";

import { multicountryGroups } from "./multicountry";
import MapLanding from "./map-landing";
import TopicView from "./topic-view";
import LeftSidebar from "../../components/left-sidebar/left-sidebar";
import ResourceList from "./resource-list";
import FilterDrawer from "./filter-drawer";

import GlobeOutlined from "../../images/knowledge-library/globe-outline.svg";
import TooltipOutlined from "../../images/knowledge-library/tooltip-outlined.svg";
import { ReactComponent as DownArrow } from "../../images/knowledge-library/chevron-down.svg";
import topicViewIcon from "../../images/knowledge-library/topic-view-icon.svg";
import { ReactComponent as IconLibrary } from "../../images/capacity-building/ic-knowledge-library.svg";
import { ReactComponent as IconLearning } from "../../images/capacity-building/ic-capacity-building.svg";
import { ReactComponent as IconExchange } from "../../images/capacity-building/ic-exchange.svg";
import { ReactComponent as IconCaseStudies } from "../../images/capacity-building/ic-case-studies.svg";

import Header from "./header";
import moment from "moment";
import DetailViewModal from "../detail-view-modal/view";

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
  landingQuery,

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
      title: "Library",
      url: "/knowledge/library",
      icon: <IconLibrary />,
    },
    {
      id: 2,
      title: "Learning",
      url: "/knowledge/capacity-building",
      icon: <IconLearning />,
    },
    {
      id: 4,
      title: "Case studies",
      url: "/knowledge/case-studies",
      icon: <IconCaseStudies />,
    },
  ];

  const selectionValue = (
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
        <img src={topicViewIcon} alt="globe-icon" className="filter-img" />
      )}
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
    if (
      profile.reviewStatus === "APPROVED" &&
      query?.favorites?.includes("true")
    ) {
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
      setFilterCountries(query?.country || []);

    // Manage filters display

    !filters && setFilters(query);
    if (filters) {
      setFilters({ ...filters });
      setFilterCountries(filters?.country || []);
    }

    setLoading(true);
    if (isLoading === false && !filters) {
      setTimeout(getResults(query), 0);
    }

    if (isLoading === false && filters) {
      const arrayOfQuery = Object.entries(filters)?.filter(
        (item) => item[1]?.length !== 0
      );

      const pureQuery = Object.fromEntries(arrayOfQuery);

      const newParams = new URLSearchParams(pureQuery);

      if (history.location.pathname === "/knowledge/library") {
        history.push(`/knowledge/library?${newParams.toString()}`);
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
        const selectedTag = flatten(values(tags)).find((x) => x.id == value);

        return selectedTag ? titleCase(selectedTag?.tag) : titleCase(value);
      }
      if (key === "country") {
        const selectedCountry = countries.find((x) => x.id == value);
        return selectedCountry?.name;
      }
      if (key === "transnational") {
        const transnationalGroup = multicountryGroups
          .map((multicountryGroup) => multicountryGroup.item)
          .flat();

        const selectedTransnational = transnationalGroup.find(
          (x) => x.id == value
        );
        return selectedTransnational?.name;
      }

      if (key === "representativeGroup") {
        const selectedRepresentativeGroups = representativeGroup.find(
          (x) => x?.code?.toLowerCase() == value?.toLowerCase()
        );
        return value.toLowerCase() === "other"
          ? "Other"
          : selectedRepresentativeGroups?.name;
      }
      if (key === "startDate") {
        return `Start date ${moment(value).year()}`;
      }
      if (key === "endDate") {
        return `End date ${moment(value).year()}`;
      }
      if (key === "subContentType") {
        const selectedSubContentType = mainContentType.find((subContent) =>
          subContent.childs.find((child) => child?.title?.includes(value))
        );

        return `${value} ${selectedSubContentType?.name}`;
      }
      if (key === "entity") {
        const selectedOrganisation = organisations.find(
          (organisation) => organisation.id == value
        );
        return selectedOrganisation?.name;
      }
    };
    return Object.keys(query).map((key, index) => {
      // don't render if key is one of those listed below
      if (
        key === "limit" ||
        key === "offset" ||
        key === "q" ||
        key === "favorites" ||
        key === "descending" ||
        key === "orderBy" ||
        key === "incCountsForTags"
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

  const sortResults = (ascending) => {
    if (!ascending) {
      updateQuery("descending", "true");
    } else {
      updateQuery("descending", "false");
    }
    setIsAscending(ascending);
  };

  useEffect(() => {
    setAllResults(
      [...results].sort((a, b) => Date.parse(b.created) - Date.parse(a.created))
    );
  }, [results]);

  useEffect(() => {
    if (isAscending !== false && isAscending === true) {
      updateQuery("orderBy", "title");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAscending]);

  const filterTagValue = renderFilterTag()
    .flat()
    .filter((item) => item);

  return (
    <Row id="knowledge-library">
      {/* Header */}

      {/* Content */}
      <Col span={24}>
        <div className="ui-container">
          {/* Filter Drawer */}

          <FilterDrawer
            {...{
              query,
              view,
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

          <LeftSidebar active={1} sidebar={sidebar}>
            <Header
              {...{
                updateQuery,
                filterVisible,
                setFilterVisible,
                filterTagValue,
                renderFilterTag,
                selectionValue,
                setView,
              }}
            />
            <Row
              className={
                view === "map"
                  ? "resource-main-container"
                  : `resource-main-container topic-main-container`
              }
            >
              {/* Resource Main Content */}
              {listVisible && (
                <Col
                  lg={10}
                  md={9}
                  sm={12}
                  xs={24}
                  className={
                    view === "map"
                      ? "resource-list-container"
                      : `resource-list-container topic-view-resource`
                  }
                >
                  {/* Resource List */}
                  <ResourceList
                    {...{
                      view,
                      query,
                      allResults,
                      countData,
                      loading,
                      pageSize,
                      updateQuery,
                      sortResults,
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
                      landingQuery,
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
                  className={
                    view === "topic"
                      ? `render-map-container topic-view`
                      : `render-map-container`
                  }
                >
                  <TopicView
                    {...{ updateQuery, query, results }}
                    countData={countData.filter(
                      (count) => count.topic !== "gpml_member_entities"
                    )}
                  />
                </Col>
              )}
            </Row>
          </LeftSidebar>
        </div>
      </Col>
    </Row>
  );
};

export default KnowledgeLibrary;
