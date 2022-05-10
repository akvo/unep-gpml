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
import LeftSidebar from "../../components/left-sidebar/LeftSidebar";
import ProfileCard from "./card";
import Header from "../knowledge-library/header";
import FilterDrawer from "./filterDrawer";
import MapView from "./mapView";

// Icons
import topicViewIcon from "../../images/knowledge-library/topic-view-icon.svg";
import { ReactComponent as IconEvent } from "../../images/events/event-icon.svg";
import { ReactComponent as IconForum } from "../../images/events/forum-icon.svg";
import { ReactComponent as IconCommunity } from "../../images/events/community-icon.svg";
import { ReactComponent as IconPartner } from "../../images/stakeholder-overview/partner-icon.svg";
import StakeholderList from "./stakeholderList";
import { multicountryGroups } from "../knowledge-library/multicountry";
import { titleCase } from "../../utils/string";
import GlobeOutlined from "../../images/knowledge-library/globe-outline.svg";
import TooltipOutlined from "../../images/knowledge-library/tooltip-outlined.svg";
import DownArrow from "../../images/knowledge-library/chevron-down.svg";

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
    representativeGroup: s.representativeGroup,
    geoCoverageTypeOptions: s.geoCoverageTypeOptions,
    stakeholders: s.stakeholders,
    organisations: s.organisations,
    seeking: s.tags.seeking,
    offering: s.tags.offering,
    stakeholders: s.stakeholders?.stakeholders,
  }));

  const viewportWidth = document.documentElement.clientWidth;

  const [filterCountries, setFilterCountries] = useState([]);
  const [multiCountryCountries, setMultiCountryCountries] = useState([]);
  const { isAuthenticated, isLoading } = useAuth0();
  const isApprovedUser = profile?.reviewStatus === "APPROVED";
  const hasProfile = profile?.reviewStatus;
  const isValidUser = isAuthenticated && isApprovedUser && hasProfile;
  const [filterVisible, setFilterVisible] = useState(false);
  const [scroll, setScroll] = useState(true);
  const query = useQuery();
  const [view, setView] = useState("card");
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [suggestedProfiles, setSuggestedProfiles] = useState([]);
  const [nonMemberOrganisation, setNonMemberOrganisation] = useState(0);
  const [stakeholderCount, setStakeholderCount] = useState({
    individual: 0,
    entity: 0,
    GPMLMemberCount: 0,
    nonMemberOrganisation: 0,
    existingStakeholder: [],
  });

  const [landingQuery, setLandingQuery] = useState("");
  const [isAscending, setIsAscending] = useState(null);
  const [filters, setFilters] = useState(null);
  const pageSize = 16;
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

  const resultCounts =
    results.length + ((filters?.page && pageSize * filters?.page) || 0);

  const sidebar = [
    { id: 1, title: "Events", url: "/events", icon: <IconEvent /> },
    {
      id: 2,
      title: "Community",
      url: "/stakeholder-overview",
      icon: <IconCommunity />,
    },

    { id: 3, title: "Forums", url: null, icon: <IconForum /> },
    { id: 4, title: "Partners", url: "/partners", icon: <IconPartner /> },
  ];

  const selectionValue = (
    <div className="selection-value">
      <button className="select-button">
        <img src={DownArrow} className="selection-arrow" alt="down-arrow" />
      </button>
      <span className="label text-white">{`${view} view`}</span>
      {view === "map" ? (
        <img src={GlobeOutlined} alt="globe-icon" className="filter-img" />
      ) : (
        <img src={topicViewIcon} alt="globe-icon" className="filter-img" />
      )}
    </div>
  );

  const sortResults = (ascending) => {
    const sortSuggestedProfiles = suggestedProfiles.sort((a, b) => {
      if (ascending) {
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

    if (!ascending) {
      updateQuery("descending", "true");
    } else {
      updateQuery("descending", "false");
    }
    setIsAscending(ascending);
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
    const searchParms = new URLSearchParams(window.location.search);
    searchParms.set("limit", pageSize);

    api
      .get(`/non-member-organisation`)
      .then((resp) => setNonMemberOrganisation(resp?.data.length));

    const url = `/community?${String(searchParms)}`;
    api
      .get(url)
      .then((resp) => {
        const result = resp?.data?.results;

        const organisationType = resp?.data?.counts?.find(
          (count) => count?.networkType === "organisation"
        );

        const stakeholderType = resp?.data?.counts?.find(
          (count) => count?.networkType === "stakeholder"
        );

        const GPMLMemberCounts = resp?.data?.counts?.find(
          (count) => count?.networkType === "gpml_member_entities"
        );
        const existingStakeholder = resp?.data?.counts.filter(
          (item) =>
            item?.networkType === "organisation" ||
            item?.networkType === "stakeholder"
        );
        setStakeholderCount({
          individual: stakeholderType?.count || 0,
          entity: organisationType?.count || 0,
          GPMLMemberCount: GPMLMemberCounts?.count || 0,
          nonMemberOrganisation: nonMemberOrganisation || 0,
          existingStakeholder: existingStakeholder,
        });

        setResults(
          [...result]
            .sort((a, b) => Date.parse(b?.created) - Date.parse(a?.created))
            .sort((a, b) => b?.type.localeCompare(a?.type))
        );

        if (
          query?.networkType.length === 1 &&
          query?.networkType.includes("organisation")
        ) {
          setResultCount(organisationType?.count || 0);
        } else if (
          query?.networkType.length === 1 &&
          query?.networkType.includes("stakeholder")
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
        setLandingQuery(String(searchParms));
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const itemCount = loading
    ? 0
    : filters?.page !== undefined
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
      setFilterCountries(query?.country);

    // Manage filters display
    !filters && setFilters(query);
    if (filters) {
      setFilters({ ...filters, topic: query.topic, tag: query.tag });
      setFilterCountries(filters?.country);
    }

    setTimeout(() => {
      getSuggestedProfiles();
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValidUser]);

  useEffect(() => {
    const handleScroll = () => {
      const position = window.pageYOffset;
      if (!isValidUser && position > 50) {
        setScroll(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

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
        if (param !== "page") {
          newQuery["page"] = 0;
        }
      });
    } else {
      newQuery[param] = value;
      if (param !== "page") {
        newQuery["page"] = 0;
      }
    }

    newQuery["tag"] = [newQuery["offering"], newQuery["seeking"]].flat();

    setFilters(newQuery);
    const newParams = new URLSearchParams(newQuery);
    history.push(`/stakeholder-overview?${newParams.toString()}`);
    setLandingQuery(newParams.toString());
    clearTimeout(tmid);
    tmid = setTimeout(getResults(newQuery), 1000);
    if (param === "country") {
      setFilterCountries(value);
    }
  };

  useEffect(() => {
    if (isAscending !== false && isAscending === true) {
      updateQuery("orderBy", "name");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAscending]);

  // Here is the function to render filter tag
  const renderFilterTag = () => {
    const renderName = (key, value) => {
      if (key === "affiliation") {
        const selectedOrganisation = organisations.find(
          (organisation) => organisation?.id == value
        );
        return selectedOrganisation?.name;
      }
      if (key === "isMember") {
        const name = humps.decamelize("Owner");
        return entityName(name);
      }

      if (key === "networkType") {
        return value === "stakeholder" ? "Individual" : "Entity";
      }

      if (key === "country") {
        const selectedCountry = countries.find((x) => x.id == value);
        return selectedCountry?.name;
      }

      if (key === "geoCoverageType") {
        const selectedGeoCoverage = geoCoverageTypeOptions?.find(
          (x) => x.toLowerCase() === value.toLowerCase()
        );

        return selectedGeoCoverage;
      }

      if (key === "representativeGroup") {
        const selectedRepresentativeGroups = representativeGroup?.find(
          (x) => x?.code?.toLowerCase() == value?.toLowerCase()
        );
        return value.toLowerCase() === "other"
          ? "Other"
          : selectedRepresentativeGroups?.name;
      }
      if (key === "transnational") {
        const transnationalGroup = multicountryGroups
          ?.map((multicountryGroup) => multicountryGroup.item)
          .flat();

        const selectedTransnational = transnationalGroup?.find(
          (x) => x.id == value
        );
        return selectedTransnational?.name;
      }
      if (key === "seeking") {
        const selectedSeeking = seeking?.find((seek) => seek?.tag == value);
        return selectedSeeking?.tag;
      }
      if (key === "offering") {
        const selectedOffering = offering?.find((offer) => offer?.tag == value);
        return selectedOffering?.tag;
      }
      if (key === "entity") {
        const selectedOrganisation = organisations?.find(
          (organisation) => organisation.id == value
        );
        return selectedOrganisation?.name;
      }
    };
    return Object.keys(query).map((key, index) => {
      // don't render if key is limit and offset
      if (
        key === "limit" ||
        key === "page" ||
        key === "q" ||
        key === "favorites" ||
        key === "descending" ||
        key === "orderBy"
      ) {
        return;
      }

      return key !== "tag" && query?.[key]
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

  const filterTagValue = renderFilterTag()
    .flat()
    .filter((item) => item);

  return (
    <div id="stakeholder-overview" className="stakeholder-overview">
      {!isValidUser && !scroll && (
        <UnathenticatedPage loginWithPopup={loginWithPopup} />
      )}
      <div className={!isValidUser && !scroll ? "blur" : ""}>
        {isValidUser && (
          <Header
            {...{
              setView,
              sortResults,
              filterVisible,
              setFilterVisible,
              isAscending,
              renderFilterTag,
              updateQuery,
              selectionValue,
              filterTagValue,
            }}
          />
        )}
        {/* Content */}
        <Col span={24}>
          <div className="ui-container">
            <FilterDrawer
              {...{
                query,
                view,
                updateQuery,
                filterVisible,
                setFilterVisible,
                stakeholderCount,
                setFilterCountries,
                multiCountryCountries,
                setMultiCountryCountries,
                renderFilterTag,
              }}
              entities={entityRoleOptions}
            />

            <LeftSidebar isValidUser={isValidUser} active={2} sidebar={sidebar}>
              <Col lg={24} xs={24} order={2}>
                {view === "card" ? (
                  <div>
                    {/* Suggested profiles */}
                    {isValidUser && !isEmpty(suggestedProfiles) && (
                      <Col className="card-container green">
                        <h3
                          id="title"
                          className="title text-white ui container"
                        >
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
                          <h2 className="loading">
                            There is no data to display
                          </h2>
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
                            {resultCount > pageSize + Number(filters?.page)
                              ? resultCounts
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
                            current={
                              1 +
                              (query?.page.length !== 0
                                ? Number(query?.page[0])
                                : 0)
                            }
                            pageSize={pageSize}
                            total={resultCount}
                            showSizeChanger={false}
                            onChange={(n) => {
                              updateQuery("page", n - 1);
                            }}
                          />
                        )}
                      </div>
                    </Col>
                  </div>
                ) : (
                  <div className="stakeholder-map-wrapper">
                    <MapView
                      updateQuery={updateQuery}
                      landingQuery={landingQuery}
                      isFilteredCountry={filterCountries}
                      multiCountryCountries={multiCountryCountries}
                      stakeholderCount={stakeholderCount}
                    />
                    <StakeholderList
                      {...{
                        view,
                        results,
                        sortResults,
                        pageSize,
                        filters,
                        itemCount,
                        loading,
                        updateQuery,
                        isLoaded,
                        resultCount,
                        resultCounts,
                        query,
                      }}
                    />
                  </div>
                )}
              </Col>
            </LeftSidebar>
          </div>
        </Col>
      </div>
    </div>
  );
};

export default StakeholderOverview;
