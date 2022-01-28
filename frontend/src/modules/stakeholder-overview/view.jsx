import React, { useEffect, useState } from "react";
import { Row, Col, Pagination } from "antd";
import "./styles.scss";
import LeftSidebar from "./leftSidebar";
import ProfileCard from "./card";
import Header from "./header";
import FilterDrawer from "./filterDrawer";
import { UIStore } from "../../store";
import { profiles } from "./profiles";
import api from "../../utils/api";

const StakeholderOverview = () => {
  const [filterVisible, setFilterVisible] = useState(false);
  const [results, setResults] = useState([]);
  const [isAscending, setIsAscending] = useState(null);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;
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

  // const getResults = () => {
  //   // NOTE: The url needs to be window.location.search because of how
  //   // of how `history` and `location` are interacting!
  //   const searchParms = new URLSearchParams(window.location.search);
  //   searchParms.set("limit", pageSize);
  //   const url = `detail/stakeholder/${stakeholders?.stakeholders[0]?.id}`;
  //   api
  //     .get(url)
  //     .then((resp) => {
  //       setResults(resp?.data?.results);

  //       setLoading(false);
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //     });
  // };

  // useEffect(() => {
  //   getResults();
  //   console.log(results);
  // }, []);

  return (
    <div id="suggested-profiles">
      <Header
        filterVisible={filterVisible}
        isAscending={isAscending}
        setFilterVisible={setFilterVisible}
        sortPeople={sortPeople}
      />
      <Row type="flex" className="body-wrapper">
        {/* Filter Drawer */}
        <FilterDrawer
          entities={entityRoleOptions}
          filterVisible={filterVisible}
          setFilterVisible={setFilterVisible}
        />

        <LeftSidebar />
        <Col lg={22} xs={24} order={2}>
          <Col className="card-container green">
            <h3 className="title text-white">Suggested profiles</h3>
            <Row>
              {results.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </Row>
          </Col>
          <Col className="all-profiles">
            <Row type="flex">
              {results.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </Row>
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
