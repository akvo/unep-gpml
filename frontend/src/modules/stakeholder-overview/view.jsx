import React, { useEffect, useState } from "react";
import { Row, Col, Pagination, Tag } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useAuth0 } from "@auth0/auth0-react";

import "./styles.scss";

import { UIStore } from "../../store";
import { useQuery } from "./common";
import humps from "humps";
import api from "../../utils/api";
import { redirectError } from "../error/error-util";
import { entityName } from "../../utils/misc";
import isEmpty from "lodash/isEmpty";
import UnathenticatedPage from "./unathenticatedPage";

// Components
import LeftSidebar from "../left-sidebar/LeftSidebar";
import ProfileCard from "./card";
import Header from "./header";
import FilterDrawer from "./filterDrawer";
import MapView from "./mapView";

// Icons
import IconEvent from "../../images/events/event-icon.svg";
import IconForum from "../../images/events/forum-icon.svg";
import IconCommunity from "../../images/events/community-icon.svg";

let tmid;

const StakeholderOverview = ({ history, loginWithPopup }) => {
  const {
    profile,
    countries,
    representativeGroup,
    geoCoverageTypeOptions,
    stakeholders,
    organisations,
    seeking,
    offering,
  } = UIStore.useState((s) => ({
    profile: s.profile,
    countries: s.countries,
    representativeGroup: s.sectorOptions,
    geoCoverageTypeOptions: s.geoCoverageTypeOptions,
    stakeholders: s.stakeholders,
    organisations: s.organisations,
    seeking: s.tags.seeking,
    offering: s.tags.offering,
    stakeholders: s.stakeholders?.stakeholders,
  }));
  const [filterCountries, setFilterCountries] = useState([]);

  const { isAuthenticated, isLoading } = useAuth0();
  const isApprovedUser = profile?.reviewStatus === "APPROVED";
  const hasProfile = profile?.reviewStatus;

  const isValidUser = isAuthenticated && isApprovedUser && hasProfile;

  const [filterVisible, setFilterVisible] = useState(false);
  const query = useQuery();
  const [view, setView] = useState("card");
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [suggestedProfiles, setSuggestedProfiles] = useState([]);
  const [organisationCount, setOrganisationCount] = useState(0);
  const [GPMLMemberCount, setGPMLMemberCount] = useState(0);

  const [isAscending, setIsAscending] = useState(null);
  const [filters, setFilters] = useState(null);
  const pageSize = 8;
  const { innerWidth } = window;
  const [resultCount, setResultCount] = useState(0);
  const { entityRoleOptions } = UIStore.useState((s) => ({
    entityRoleOptions: s.entityRoleOptions,
    countries: s.countries,
    tags: s.tags,
    geoCoverageTypeOptions: s.geoCoverageTypeOptions,
    languages: s.languages,
  }));

  if (suggestedProfiles.length > 4) {
    suggestedProfiles.length = 4;
  }

  const sidebar = [
    { id: 1, title: "Events", url: "/events", icon: IconEvent },
    {
      id: 2,
      title: "Community",
      url: "/stakeholder-overview",
      icon: IconCommunity,
    },
    { id: 3, title: "Forums", url: null, icon: IconForum },
  ];

  const sortPeople = () => {
    const sortSuggestedProfiles = suggestedProfiles.sort((a, b) => {
      if (!isAscending) {
        if (a?.firstName) {
          return a?.firstName?.trim().localeCompare(b?.firstName?.trim());
        } else {
          return a?.name?.trim().localeCompare(b?.name?.trim());
        }
      } else {
        if (b?.firstName) {
          return b?.firstName?.trim().localeCompare(a?.firstName?.trim());
        } else {
          return b?.name?.trim().localeCompare(a?.name?.trim());
        }
      }
    });

    setSuggestedProfiles(sortSuggestedProfiles);

    const sortByName = results.sort((a, b) => {
      if (!isAscending) {
        if (a?.firstName) {
          return a?.firstName?.trim().localeCompare(b?.firstName?.trim());
        } else {
          return a?.name?.trim().localeCompare(b?.name?.trim());
        }
      } else {
        if (b?.firstName) {
          return b?.firstName?.trim().localeCompare(a?.firstName?.trim());
        } else {
          return b?.name?.trim().localeCompare(a?.name?.trim());
        }
      }
    });
    setResults(sortByName);
    setIsAscending(!isAscending);
  };

  const getSuggestedProfiles = () => {
    const url = `/profile/suggested?limit=4`;
    api
      .get(url)
      .then((resp) => {
        const sortSuggestedProfile = resp?.data?.suggestedProfiles.sort(
          (a, b) => Date.parse(b?.created) - Date.parse(a?.created)
        );

        setSuggestedProfiles(sortSuggestedProfile);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const getResults = (query) => {
    const topic = ["stakeholder", "organisation"];

    const searchParms = new URLSearchParams(window.location.search);
    searchParms.set("limit", pageSize);
    if (query.topic.length === 0) {
      searchParms.set("topic", topic);
    }
    const url = `/browse?${String(searchParms)}`;
    api
      .get(url)
      .then((resp) => {
        const result = resp?.data?.results;

        const organisationType = resp?.data?.counts?.find(
          (count) => count?.topic === "organisation"
        );

        const stakeholderType = resp?.data?.counts?.find(
          (count) => count?.topic === "stakeholder"
        );

        const GPMLMemberCounts = resp?.data?.counts?.find(
          (count) => count?.topic === "gpml_member_entities"
        );
        setGPMLMemberCount(GPMLMemberCounts.count);

        setResults(
          [...result]
            .sort((a, b) => Date.parse(b?.created) - Date.parse(a?.created))
            .sort((a, b) => b?.type.localeCompare(a?.type))
        );

        if (
          query?.topic.length === 1 &&
          query?.topic.includes("organisation")
        ) {
          setResultCount(organisationType?.count || 0);
        } else if (
          query?.topic.length === 1 &&
          query?.topic.includes("stakeholder")
        ) {
          setResultCount(stakeholderType?.count);
        } else {
          setResultCount(
            organisationType?.count + stakeholderType?.count ||
              organisationType?.count ||
              0 + stakeholderType?.count ||
              0
          );
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        redirectError(err, history);
      });
  };

  const getOrganisation = () => {
    const searchParms = new URLSearchParams(window.location.search);
    searchParms.set("topic", "organisation");
    const url = `/browse?${String(searchParms)}`;
    api.get(url).then((resp) => {
      const organisationType = resp?.data?.counts?.find(
        (count) => count?.topic === "organisation"
      );
      setOrganisationCount(organisationType?.count);
    });
  };

  const itemCount = loading
    ? 0
    : filters?.offset !== undefined
    ? resultCount
    : pageSize;

  useEffect(() => {
    if (isLoading === false && !filters) {
      setTimeout(getResults(query), 0);
    }

    if (isLoading === false && filters) {
      clearTimeout(tmid);
      tmid = setTimeout(getResults(query), 1000);
    }
  }, [isLoading, isValidUser]); // eslint-disable-line

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

    setTimeout(() => {
      getSuggestedProfiles();
      getOrganisation();
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValidUser]);

  const updateQuery = (param, value, paramValueArr) => {
    const topScroll = window.innerWidth < 640 ? 996 : 207;
    window.scrollTo({
      top: window.pageYOffset < topScroll ? window.pageYOffset : topScroll,
    });
    setLoading(true);
    const newQuery = { ...query };
    if (paramValueArr) {
      paramValueArr.forEach((pv) => {
        const { param, value } = pv;
        newQuery[param] = value;
        if (param !== "offset") {
          newQuery["offset"] = 0;
        }
      });
    } else {
      newQuery[param] = value;
      if (param !== "offset") {
        newQuery["offset"] = 0;
      }
    }
    setFilters(newQuery);
    const newParams = new URLSearchParams(newQuery);
    history.push(`/stakeholder-overview?${newParams.toString()}`);
    clearTimeout(tmid);
    tmid = setTimeout(getResults(newQuery), 1000);
    if (param === "country") {
      setFilterCountries(value);
    }
  };

  // Here is the function to render filter tag
  const renderFilterTag = () => {
    const renderName = (key, value) => {
      if (key === "affiliation") {
        const findOrganisation = organisations.find(
          (organisation) => organisation?.id == value
        );
        return findOrganisation?.name;
      }
      if (key === "is_member") {
        const findEntity = entityRoleOptions.find((x) => x == value);
        const name = humps.decamelize(findEntity);
        return entityName(name);
      }

      if (key === "topic") {
        return value === "stakeholder" ? "Individual" : "Entity";
      }

      if (key === "country") {
        const findCountry = countries.find((x) => x.id == value);
        return findCountry?.name;
      }

      if (key === "geoCoverage") {
        const findGeoCoverage = geoCoverageTypeOptions?.find((x) => ({
          value: x,
          label: x,
        }));
        return findGeoCoverage;
      }

      if (key === "representativeGroup") {
        const representativeGroups = representativeGroup.find(
          (x) => x == value
        );
        return representativeGroups;
      }

      if (key === "seeking") {
        const findSeeking = seeking.find((seek) => seek?.id == value);
        return findSeeking?.tag;
      }
      if (key === "offering") {
        const findOffering = offering.find((offer) => offer?.id == value);
        return findOffering?.tag;
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

  const isLoaded = () =>
    Boolean(!isEmpty(stakeholders) && !isEmpty(organisations));

  return (
    <div id="stakeholder-overview" className="stakeholder-overview">
      {!isValidUser && <UnathenticatedPage loginWithPopup={loginWithPopup} />}
      <div className={isValidUser ? "" : "blur"}>
        {isValidUser && (
          <Header
            view={view}
            setView={setView}
            filterVisible={filterVisible}
            setFilterVisible={setFilterVisible}
            isAscending={isAscending}
            renderFilterTag={renderFilterTag}
            sortPeople={sortPeople}
            updateQuery={updateQuery}
          />
        )}
        <Row type="flex" className="body-wrapper">
          {/* Filter Drawer */}
          <FilterDrawer
            query={query}
            updateQuery={updateQuery}
            entities={entityRoleOptions}
            filterVisible={filterVisible}
            setFilterVisible={setFilterVisible}
            organisationCount={organisationCount}
            GPMLMemberCount={GPMLMemberCount}
          />

          <LeftSidebar isValidUser={isValidUser} active={2} sidebar={sidebar}>
            <Col lg={24} xs={24} order={2}>
              {view === "card" ? (
                <>
                  {/* Suggested profiles */}
                  {isValidUser && !isEmpty(suggestedProfiles) && (
                    <Col className="card-container green">
                      <h3 id="title" className="title text-white ui container">
                        Suggested profiles
                      </h3>

                      {isEmpty(suggestedProfiles) ? (
                        <h2 className="loading" id="stakeholder-loading">
                          <LoadingOutlined spin /> Loading
                        </h2>
                      ) : !isEmpty(suggestedProfiles) ? (
                        <div className="card-wrapper ui container">
                          {suggestedProfiles.length > 0 &&
                            suggestedProfiles
                              .slice(0, 4)
                              .map((profile) => (
                                <ProfileCard
                                  key={profile?.id}
                                  profile={profile}
                                  isValidUser={isValidUser}
                                  profileType="suggested-profiles"
                                />
                              ))}
                        </div>
                      ) : (
                        <h2 className="loading">There is no data to display</h2>
                      )}
                    </Col>
                  )}
                  {/* All profiles */}
                  <Col className="all-profiles">
                    {!isLoaded() || loading ? (
                      <h2 className="loading" id="stakeholder-loading">
                        <LoadingOutlined spin /> Loading
                      </h2>
                    ) : isLoaded() && !loading && !isEmpty(results) ? (
                      <>
                        <div className="result-number">
                          {resultCount > pageSize + Number(filters?.offset)
                            ? pageSize + Number(filters?.offset)
                            : itemCount}{" "}
                          of {resultCount || 0} result
                          {resultCount > 1 ? "s" : ""}
                        </div>
                        <div className="card-wrapper ui container">
                          {results.map((profile) => (
                            <ProfileCard
                              key={profile?.id}
                              profile={profile}
                              isValidUser={isValidUser}
                              profileType="all-profiles"
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <h2 className="loading">There is no data to display</h2>
                    )}
                    {/* Pagination */}
                    <div className="page">
                      {!isEmpty(results) && isValidUser && (
                        <Pagination
                          defaultCurrent={1}
                          current={(filters?.offset || 0) / pageSize + 1}
                          pageSize={pageSize}
                          total={resultCount}
                          showSizeChanger={false}
                          onChange={(n, size) =>
                            updateQuery("offset", (n - 1) * size)
                          }
                        />
                      )}
                    </div>
                  </Col>
                </>
              ) : (
                <MapView
                  updateQuery={updateQuery}
                  isFilteredCountry={filterCountries}
                />
              )}
            </Col>
          </LeftSidebar>
        </Row>
      </div>
    </div>
  );
};

export default StakeholderOverview;
