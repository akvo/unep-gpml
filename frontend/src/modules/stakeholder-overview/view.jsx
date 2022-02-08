import React, { useEffect, useState } from "react";
import { Row, Col, Pagination, Tag } from "antd";
import { useAuth0 } from "@auth0/auth0-react";
import "./styles.scss";
import LeftSidebar from "./leftSidebar";
import ProfileCard from "./card";
import Header from "./header";
import FilterDrawer from "./filterDrawer";
import { useQuery } from "./common";
import { UIStore } from "../../store";
import humps from "humps";
import { profiles } from "./profiles";
import api from "../../utils/api";
import { redirectError } from "../error/error-util";
import { suggestedProfiles } from "./suggested-profile";
import { entityName } from "../../utils/misc";

let tmid;

const StakeholderOverview = ({ history }) => {
  const {
    countries,

    representativeGroup,
  } = UIStore.useState((s) => ({
    countries: s.countries,
    representativeGroup: s.sectorOptions,
  }));

  const [filterVisible, setFilterVisible] = useState(false);
  const query = useQuery();
  const { isLoading } = useAuth0();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [test, setTest] = useState([]);
  const [isAscending, setIsAscending] = useState(null);
  const [filters, setFilters] = useState(null);
  const pageSize = 12;

  const { entityRoleOptions, stakeholders } = UIStore.useState((s) => ({
    entityRoleOptions: s.entityRoleOptions,
    countries: s.countries,
    tags: s.tags,
    geoCoverageTypeOptions: s.geoCoverageTypeOptions,
    languages: s.languages,
    stakeholders: s.stakeholders,
  }));

  useState(() => {
    setResults([...profiles]);
  }, []);

  const sortPeople = () => {
    const sortByName = results.sort((a, b) => {
      if (!isAscending) {
        if (a.first_name) {
          return a.first_name.localeCompare(b.first_name);
        } else {
          return a.name.localeCompare(b.first_name);
        }
      } else {
        if (b.first_name) {
          return b.first_name.localeCompare(a.first_name);
        } else {
          return b.name.localeCompare(a.first_name);
        }
      }
    });
    setResults(sortByName);
    setIsAscending(!isAscending);
  };

  const getResults = () => {
    const searchParms = new URLSearchParams({
      limit: 20,
      tag: "",
      offset: 20,
    });
    const url = `/browse?${String(searchParms)}`;
    api
      .get(url)
      .then((resp) => {
        console.log(resp);
        setResults(resp?.data?.results);
      })
      .catch((err) => {
        console.error(err);
        redirectError(err, history);
      });
  };

  // const getResults = () => {
  //   const searchParms = new URLSearchParams(window.location.search);
  //   searchParms.set("limit", pageSize);
  //   const url = `https://unep-gpml.akvotest.org/api/stakeholder`;

  //   api
  //     .get(url)
  //     .then((resp) => {
  //       setTest(resp?.data);

  //       setLoading(false);
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //       redirectError(err, history);
  //     });
  // };

  console.log(test, "DATA");

  useEffect(() => {
    setLoading(true);
    if (isLoading === false && !filters) {
      setTimeout(getResults, 0);
    }

    if (isLoading === false && filters) {
      clearTimeout(tmid);
      tmid = setTimeout(getResults, 1000);
    }
  }, [isLoading]); // eslint-disable-line

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
    tmid = setTimeout(getResults, 1000);
  };

  // Here is the function to render filter tag
  const renderFilterTag = () => {
    const renderName = (key, value) => {
      if (key === "entity") {
        const findEntity = entityRoleOptions.find((x) => x == value);
        const name = humps.decamelize(findEntity);
        return entityName(name);
      }

      if (key === "country") {
        const findCountry = countries.find((x) => x.id == value);
        return findCountry?.name;
      }

      if (key === "representativeGroup") {
        const representativeGroups = representativeGroup.find(
          (x) => x == value
        );
        return representativeGroups;
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
    <div id="stakeholder-overview">
      <Header
        filterVisible={filterVisible}
        isAscending={isAscending}
        setFilterVisible={setFilterVisible}
        renderFilterTag={renderFilterTag}
        sortPeople={sortPeople}
      />
      <Row type="flex" className="body-wrapper">
        {/* Filter Drawer */}
        <FilterDrawer
          query={query}
          updateQuery={updateQuery}
          entities={entityRoleOptions}
          filterVisible={filterVisible}
          setFilterVisible={setFilterVisible}
        />

        <LeftSidebar />
        <Col lg={22} xs={24} order={2}>
          <Col className="card-container green">
            <h3 className="title text-white ui container">
              Suggested profiles
            </h3>
            <div className="card-wrapper ui container">
              {suggestedProfiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          </Col>
          <Col className="all-profiles">
            <div className="card-wrapper ui container">
              {results.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
            <div className="page">
              <Pagination
                defaultCurrent={1}
                current={1}
                pageSize={3}
                total={4}
                showSizeChanger={false}
                onChange={() => null}
              />
            </div>
          </Col>
        </Col>
      </Row>
    </div>
  );
};

export default StakeholderOverview;
