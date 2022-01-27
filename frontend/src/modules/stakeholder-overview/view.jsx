import React, { useState } from "react";
import { Row, Col, Pagination } from "antd";
import "./styles.scss";
import LeftSidebar from "./leftSidebar";
import ProfileCard from "./card";
import Header from "./header";
import FilterDrawer from "./filterDrawer";
import { UIStore } from "../../store";
import { profiles } from "./profiles";

const StakeholderOverview = () => {
  const [filterVisible, setFilterVisible] = useState(false);
  const { entityRoleOptions } = UIStore.useState((s) => ({
    entityRoleOptions: s.entityRoleOptions,
    countries: s.countries,
    tags: s.tags,
    geoCoverageTypeOptions: s.geoCoverageTypeOptions,
    languages: s.languages,
  }));

 

  return (
    <div id="suggested-profiles">
      <Header
        filterVisible={filterVisible}
        setFilterVisible={setFilterVisible}
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
              {profiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </Row>
          </Col>
          <Col className="all-profiles">
            <Row type="flex">
              {profiles.map((profile) => (
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
