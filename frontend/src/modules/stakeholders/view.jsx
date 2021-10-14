import { UIStore } from "../../store";
import React, { useEffect, useState } from "react";
import { Card, Input, Select, Checkbox, Tag, Pagination } from "antd";
import { SearchOutlined, WarningOutlined } from "@ant-design/icons";
import StickyBox from "react-sticky-box";
import "../browse/styles.scss";
import {
  topicTypes,
  topicTypesIncludingOrg,
  topicTypesApprovedUser,
  topicNames,
  resourceTypeToTopicType,
} from "../../utils/misc";
import { Link, useLocation, withRouter } from "react-router-dom";
import moment from "moment";
import api from "../../utils/api";
import ModalWarningUser from "../../utils/modal-warning-user";
import { useAuth0 } from "@auth0/auth0-react";
import humps from "humps";
import isEmpty from "lodash/isEmpty";
import { LoadingOutlined } from "@ant-design/icons";
import { TrimText } from "../../utils/string";
import { Result, useQuery } from "../browse/view";

let tmid;

const Stakeholders = ({
  history,
  setStakeholderSignupModalVisible,
  filters,
  setFilters,
  filterMenu,
}) => {
  const query = useQuery();
  const { profile, countries } = UIStore.useState((s) => ({
    profile: s.profile,
    countries: s.countries,
  }));
  const [results, setResults] = useState([]);
  const [countData, setCountData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCountries, setFilterCountries] = useState([]);
  const location = useLocation();
  const [relations, setRelations] = useState([]);
  const { isAuthenticated, loginWithPopup, isLoading } = useAuth0();
  const [warningVisible, setWarningVisible] = useState(false);
  const isApprovedUser = profile?.reviewStatus === "APPROVED";
  const hasProfile = profile?.reviewStatus;
  const pageSize = 10;

  const isValidUser = isAuthenticated && isApprovedUser && hasProfile;

  const getResults = () => {
    // NOTE: The url needs to be window.location.search because of how
    // of how `history` and `location` are interacting!
    const searchParms = new URLSearchParams(window.location.search);
    searchParms.set("limit", pageSize);
    const url = `/browse?${String(searchParms)}`;
    api.get(url).then((resp) => {
      setResults(resp?.data?.results);
      setCountData(resp?.data?.counts);
      setLoading(false);
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
      setFilters({ ...filters, topic: query.topic });
      setFilterCountries(filters.country);
    }

    setLoading(true);
    if (!isEmpty(profile) && isAuthenticated) {
      if (isApprovedUser) {
        if (isLoading === false && !filters) {
          setTimeout(getResults, 0);
        }

        if (isLoading === false && filters) {
          const newParams = new URLSearchParams({
            ...filters,
            topic: query.topic,
          });
          history.push(`/stakeholders?${newParams.toString()}`);
          clearTimeout(tmid);
          tmid = setTimeout(getResults, 1000);
        }
      } else if (hasProfile) {
        setLoading(false);
        setWarningVisible(true);
      } else {
        setLoading(false);
        history.push("/signup");
      }
    } else {
      setLoading(false);
      loginWithPopup();
    }

    // NOTE: Since we are using `history` and `location`, the
    // dependency needs to be []. Ignore the linter warning, because
    // adding a dependency here on location makes the FE send multiple
    // requests to the backend.
  }, [profile]); // eslint-disable-line

  useEffect(() => {
    UIStore.update((e) => {
      e.disclaimer = "stakeholders";
    });
    if (profile.reviewStatus === "APPROVED") {
      setTimeout(() => {
        api.get("/favorite").then((resp) => {
          setRelations(resp.data);
        });
      }, 100);
    }
  }, [profile]);

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
    history.push(`/stakeholders?${newParams.toString()}`);
    clearTimeout(tmid);
    tmid = setTimeout(getResults, 1000);
    if (param === "country") {
      setFilterCountries(value);
    }
  };

  useEffect(() => {
    updateQuery(
      "topic",
      isEmpty(filterMenu)
        ? ["organisation", "stakeholder"].map((x) => humps.decamelize(x))
        : filterMenu
    );
    // NOTE: this are triggered when user click a topic from navigation menu
  }, [filterMenu]); // eslint-disable-line

  const handleRelationChange = (relation) => {
    api
      .post("/favorite", relation)
      .then((res) => {
        const relationIndex = relations.findIndex(
          (it) => it.topicId === relation.topicId
        );
        if (relationIndex !== -1) {
          setRelations([
            ...relations.slice(0, relationIndex),
            relation,
            ...relations.slice(relationIndex + 1),
          ]);
        } else {
          setRelations([...relations, relation]);
        }
      })
      .catch((err) => {
        if (isAuthenticated) {
          if (hasProfile) {
            setStakeholderSignupModalVisible(true);
          } else {
            setWarningVisible(true);
          }
        } else {
          loginWithPopup();
        }
      });
  };

  // Choose topics to count, based on whether user is approved or not,
  // and if any topic filters are active.
  const topicsForTotal = (isApprovedUser
    ? topicTypesApprovedUser
    : topicTypes
  ).map((t) => humps.decamelize(t));
  const filteredTopics =
    filters?.topic?.length > 0
      ? filters?.topic?.filter((t) => topicsForTotal.indexOf(t) > -1)
      : topicsForTotal;
  const totalItems = filteredTopics.reduce(
    (acc, topic) =>
      acc + (countData?.find((it) => it.topic === topic)?.count || 0),
    0
  );

  return (
    <div id="browse">
      <div className="ui container">
        <div className="main-content">
          <StickyBox offsetBottom={20}>
            <aside>
              <div className="inner">
                <Input
                  value={query.q}
                  className="src"
                  placeholder="Search for resources and stakeholders"
                  suffix={<SearchOutlined />}
                  onChange={({ target: { value } }) => updateQuery("q", value)}
                />
                <div className="field">
                  <div className="label">Country</div>
                  <Select
                    virtual={false}
                    value={
                      countries && query?.country
                        ? countries
                            .filter((x) => query.country.includes(String(x.id)))
                            .map((x) => x.id)
                        : []
                    }
                    placeholder="Find country"
                    mode="multiple"
                    options={
                      countries &&
                      countries
                        .map((it) => ({
                          value: it.id,
                          label: it.name,
                        }))
                        .sort((a, b) => a.label.localeCompare(b.label))
                    }
                    allowClear
                    onChange={(val) => {
                      const selected = countries?.filter((x) => {
                        return val.includes(x.id);
                      });
                      updateQuery(
                        "country",
                        selected.map((x) => x.id)
                      );
                    }}
                    filterOption={(input, option) =>
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >=
                      0
                    }
                    onDeselect={(val) => {
                      const diselected = countries?.find((x) => x.id === val);
                      const selected =
                        countries && query?.country
                          ? countries.filter(
                              (x) =>
                                query.country.includes(String(x.id)) &&
                                diselected.id !== x.id
                            )
                          : [];
                      updateQuery(
                        "country",
                        selected.map((x) => x.id)
                      );
                    }}
                  />
                </div>
              </div>
            </aside>
          </StickyBox>
          <div className="scroll-content">
            <StickyBox offsetBottom={500} className="sticky-pagination">
              <div className="page">
                {!isEmpty(results) && (
                  <Pagination
                    defaultCurrent={1}
                    current={(filters?.offset || 0) / pageSize + 1}
                    pageSize={pageSize}
                    total={totalItems}
                    showSizeChanger={false}
                    onChange={(n, size) =>
                      updateQuery("offset", (n - 1) * size)
                    }
                  />
                )}
                {loading && (
                  <h2 className="loading">
                    <LoadingOutlined spin /> Loading
                  </h2>
                )}
              </div>
            </StickyBox>
            {isEmpty(results) && (
              <h2 className="loading">
                {isValidUser ? (
                  "There is no data to display"
                ) : (
                  <>
                    <WarningOutlined
                      style={{ fontSize: "48px", color: "#ffb800" }}
                    />
                    <div>
                      Please register as a user for the GPML Digital Platform to
                      be able to access this page
                    </div>
                  </>
                )}
              </h2>
            )}
            {isValidUser &&
              !loading &&
              results.map((result) => (
                <Result
                  key={`${result.type}-${result.id}`}
                  {...{ result, handleRelationChange, relations, profile }}
                />
              ))}
          </div>
        </div>
      </div>
      <ModalWarningUser
        visible={warningVisible}
        close={() => setWarningVisible(false)}
      />
    </div>
  );
};

export default withRouter(Stakeholders);
