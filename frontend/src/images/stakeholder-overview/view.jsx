import React, { useState } from "react";
import { Row, Col, Pagination } from "antd";
import "./styles.scss";
import LeftSidebar from "./leftSidebar";
import ProfileCard from "./card";
import Header from "./header";
import FilterDrawer from "./filterDrawer";
import { UIStore } from "../../store";

const SuggestedProfiles = () => {
  const [filterVisible, setFilterVisible] = useState(false);
  const {
    entityRoleOptions,
    countries,
    geoCoverageTypeOptions,
    languages,
  } = UIStore.useState((s) => ({
    entityRoleOptions: s.entityRoleOptions,
    countries: s.countries,
    tags: s.tags,
    geoCoverageTypeOptions: s.geoCoverageTypeOptions,
    languages: s.languages,
  }));

  console.log(UIStore.currentState);

  return (
    <div id="suggested-profiles">
      <Header
        filterVisible={filterVisible}
        setFilterVisible={setFilterVisible}
      />
      <Row type="flex" className="body-wrapper">
        {/* Filter Drawer */}
        <FilterDrawer
          // filters={filters}
          entities={entityRoleOptions}
          filterVisible={filterVisible}
          setFilterVisible={setFilterVisible}
          // countData={countData}
          // query={query}
          // updateQuery={(flag, val) => updateQuery(flag, val)}
          // multiCountryCountries={multiCountryCountries}
          // setMultiCountryCountries={setMultiCountryCountries}
        />

        <LeftSidebar />
        <Col lg={22} xs={24} order={2}>
          <Col className="card-container green">
            <h3 className="title text-white">Suggested profiles</h3>
            <Row>
              <ProfileCard />
            </Row>
          </Col>
          <Col className="all-profiles">
            <Row type="flex">
              <ProfileCard />
              <ProfileCard />
              <ProfileCard />
              <ProfileCard />
              <ProfileCard />
              <ProfileCard />
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

export default SuggestedProfiles;
