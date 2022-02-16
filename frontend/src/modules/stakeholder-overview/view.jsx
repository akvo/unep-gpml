import React, { useEffect, useState } from "react";
import { Row, Col, Pagination, Tag } from "antd";
import { LoadingOutlined, WarningOutlined } from "@ant-design/icons";
import { useAuth0 } from "@auth0/auth0-react";
import "./styles.scss";
import LeftSidebar from "./leftSidebar";
import ProfileCard from "./card";
import Header from "./header";
import FilterDrawer from "./filterDrawer";
import { useQuery } from "./common";
import { UIStore } from "../../store";
import humps from "humps";

import api from "../../utils/api";
import { redirectError } from "../error/error-util";
import { entityName } from "../../utils/misc";
import isEmpty from "lodash/isEmpty";
import UnathenticatedPage from "./unathenticatedPage";

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
  const { isAuthenticated, isLoading } = useAuth0();
  const isApprovedUser = profile?.reviewStatus === "APPROVED";
  const hasProfile = profile?.reviewStatus;

  const isValidUser = isAuthenticated && isApprovedUser && hasProfile;

  const [filterVisible, setFilterVisible] = useState(false);
  const query = useQuery();

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [suggestedProfiles, setSuggestedProfiles] = useState([]);

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

  const sortPeople = () => {
    const sortSuggestedProfiles = suggestedProfiles.sort((a, b) => {
      if (!isAscending) {
        if (a.firstName) {
          return a.firstName.localeCompare(b.firstName);
        } else {
          return a.name.localeCompare(b.name);
        }
      } else {
        if (b.firstName) {
          return b.firstName.localeCompare(a.firstName);
        } else {
          return b.name.localeCompare(a.name);
        }
      }
    });
    setSuggestedProfiles(sortSuggestedProfiles);
    const sortByName = results.sort((a, b) => {
      if (!isAscending) {
        if (a.firstName) {
          return a.firstName.localeCompare(b.firstName);
        } else {
          return a.name.localeCompare(b.name);
        }
      } else {
        if (b.firstName) {
          return b.firstName.localeCompare(a.firstName);
        } else {
          return b.name.localeCompare(a.name);
        }
      }
    });
    setResults(sortByName);
    setIsAscending(!isAscending);
  };

  const getSuggestedProfiles = () => {
    const url = `/profile/suggested`;
    api
      .get(url)
      .then((resp) => {
        const sortSuggestedProfile = [...resp?.data?.suggestedProfiles]
          .sort((a, b) => Date.parse(b.created) - Date.parse(a.created))
          .sort((a, b) => {
            if (a.type === "stakeholder" && b.type === "organisation") {
              return -1;
            } else if (b.type === "stakeholder" && a.type === "organisation") {
              return 1;
            } else {
              return 0;
            }
          });
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
        setResults(
          [...result]
            .sort((a, b) => Date.parse(b.created) - Date.parse(a.created))
            .sort((a, b) => {
              if (a.type === "stakeholder" && b.type === "organisation") {
                return -1;
              } else if (
                b.type === "stakeholder" &&
                a.type === "organisation"
              ) {
                return 1;
              } else {
                return 0;
              }
            })
        );
        if (
          query?.topic.length === 1 &&
          query?.topic.includes("organisation")
        ) {
          setResultCount(organisationType?.count);
        } else if (
          query?.topic.length === 1 &&
          query?.topic.includes("stakeholder")
        ) {
          setResultCount(stakeholderType?.count);
        } else if (query?.topic.length === 0) {
          setResultCount(organisationType?.count + stakeholderType?.count);
        } else {
          setResultCount(organisationType?.count + stakeholderType?.count);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        redirectError(err, history);
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
    getSuggestedProfiles();
  }, [isValidUser]);

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
    history.push(`/stakeholder-overview?${newParams.toString()}`);
    clearTimeout(tmid);
    tmid = setTimeout(getResults(newQuery), 1000);
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
    <div id="stakeholder-overview">
      {!isValidUser && <UnathenticatedPage loginWithPopup={loginWithPopup} />}
      <div className={isValidUser ? "" : "blur"}>
        {isValidUser && (
          <Header
            filterVisible={filterVisible}
            isAscending={isAscending}
            setFilterVisible={setFilterVisible}
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
          />

          <LeftSidebar isValidUser={isValidUser} />
          <Col lg={22} xs={24} order={2}>
            {isValidUser && (
              <Col className="card-container green">
                <h3 className="title text-white ui container">
                  Suggested profiles
                </h3>

                {isEmpty(suggestedProfiles) ? (
                  <h2 className="loading" id="stakeholder-loading">
                    <LoadingOutlined spin /> Loading
                  </h2>
                ) : !isEmpty(suggestedProfiles) ? (
                  <div className="card-wrapper ui container">
                    {suggestedProfiles.map((profile) => (
                      <ProfileCard
                        key={profile?.id}
                        profile={profile}
                        isValidUser={isValidUser}
                      />
                    ))}
                  </div>
                ) : (
                  <h2 className="loading">There is no data to display</h2>
                )}
              </Col>
            )}
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
                    of {resultCount || 0} result{resultCount > 1 ? "s" : ""}
                  </div>
                  <div className="card-wrapper ui container">
                    {results.map((profile) => (
                      <ProfileCard
                        key={profile?.id}
                        profile={profile}
                        isValidUser={isValidUser}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <h2 className="loading">There is no data to display</h2>
              )}

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
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default StakeholderOverview;
