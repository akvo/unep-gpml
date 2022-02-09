import React from "react";
import { Row, Col, Space, Drawer, Tag, Card, Select, Button } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import classNames from "classnames";

import { useAuth0 } from "@auth0/auth0-react";
import { UIStore } from "../../store";
import { entityName } from "../../utils/misc";
import humps from "humps";
import isEmpty from "lodash/isEmpty";

import { ReactComponent as BusinessIcon } from "../../images/stakeholder-overview/business-icon.svg";
import { ReactComponent as AchievementIcon } from "../../images/stakeholder-overview/medal-icon.svg";
import { ReactComponent as AgreementIcon } from "../../images/stakeholder-overview/agreement-icon.svg";
import { ReactComponent as GPMLLogo } from "../../images/stakeholder-overview/gpml-logo.svg";

import { ReactComponent as CommunityIcon } from "../../images/stakeholder-overview/community-outlined.svg";
import { ReactComponent as UnionIcon } from "../../images/stakeholder-overview/union-outlined.svg";

const FilterDrawer = ({
  filterVisible,
  setFilterVisible,
  entities,
  query,
  updateQuery,
}) => {
  const {
    countries,
    transnationalOptions,
    geoCoverageTypeOptions,
    representativeGroup,
    seeking,
    offering,
  } = UIStore.useState((s) => ({
    profile: s.profile,
    countries: s.countries,
    transnationalOptions: s.transnationalOptions,
    geoCoverageTypeOptions: s.geoCoverageTypeOptions,
    mainContentType: s.mainContentType,
    representativeGroup: s.sectorOptions,
    seeking: s.tags.seeking,
    offering: s.tags.offering,
  }));
  console.log(seeking);
  const isLoaded = () =>
    !isEmpty(countries) &&
    !isEmpty(transnationalOptions) &&
    !isEmpty(geoCoverageTypeOptions) &&
    !isEmpty(representativeGroup);

  const handleChangeType = (flag, type) => {
    const val = query[flag];
    let updateVal = [];
    if (isEmpty(val)) {
      updateVal = [type];
    } else if (val.includes(type)) {
      updateVal = val.filter((x) => x !== type);
    } else {
      updateVal = [...val, type];
    }
    updateQuery(flag, updateVal);
  };

  const entityIcon = (name) => {
    if (name.toLowerCase() === "owner") {
      return <GPMLLogo />;
    }
    if (name.toLowerCase() === "implementor") {
      return <AchievementIcon />;
    }
    if (name.toLowerCase() === "partner") {
      return <AgreementIcon />;
    }
    if (name.toLowerCase() === "donor") {
      return <BusinessIcon />;
    }
  };

  return (
    <div className="site-drawer-render-in-current-wrapper">
      <Drawer
        title="Choose your filters below"
        placement="left"
        visible={filterVisible}
        getContainer={false}
        onClose={() => setFilterVisible(false)}
        closeIcon={<CloseCircleOutlined className="drawer-close-icon" />}
        style={{ position: "absolute" }}
        width={500}
        height="100%"
        autoFocus={false}
      >
        {/* Filter content */}
        <Row type="flex" gutter={[0, 24]}>
          <Col span={24}>
            <Space align="middle">
              <div className="filter-title">Network type</div>
              {isEmpty("") ? (
                <Tag className="selection-card-type">All (default)</Tag>
              ) : (
                <Tag
                  className="clear-selection"
                  closable={true}
                  onClose={() => updateQuery("entity", [])}
                  onClick={() => updateQuery("entity", [])}
                >
                  Clear selection
                </Tag>
              )}
            </Space>

            <Row type="flex" gutter={[10, 10]}>
              <Col span={6}>
                <Card
                  onClick={() => handleChangeType("entity", "")}
                  className={classNames("drawer-card", {
                    active: query?.entity?.includes(""),
                  })}
                >
                  <Space direction="vertical" align="center">
                    <UnionIcon />
                    <div className="topic-text">Individuals</div>
                  </Space>
                </Card>
              </Col>

              <Col span={6}>
                <Card
                  onClick={() => handleChangeType("entity", "")}
                  className={classNames("drawer-card", {
                    active: query?.entity?.includes(""),
                  })}
                >
                  <Space direction="vertical" align="center">
                    <CommunityIcon />
                    <div className="topic-text">Entities</div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Col>

          {/* Specificity */}
          {/* <Col span={24} className="specificity-card">
            <Space align="middle">
              <div className="filter-title">Specificity</div>
              {isEmpty("") ? (
                <Tag className="selection-card-type">All (default)</Tag>
              ) : (
                <Tag
                  className="clear-selection"
                  closable={true}
                  onClose={() => updateQuery("entity", [])}
                  onClick={() => updateQuery("entity", [])}
                >
                  Clear selection
                </Tag>
              )}
            </Space>

            <Row type="flex" gutter={[10, 10]}>
              <p className="specificity-title">For individuals</p>
              <Col span={6}>
                <Card
                  className={classNames("drawer-card", {
                    active: query?.entity?.includes(""),
                  })}
                >
                  <Space direction="vertical" align="center">
                    <Badge />
                    <div className="topic-text">Experts</div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Col> */}

          {/* For entities */}
          <Col span={24} className="specificity-card">
            <Space align="middle">
              {!isEmpty(query?.entity) && (
                <Tag
                  className="clear-selection"
                  closable={true}
                  onClose={() => updateQuery("entity", [])}
                  onClick={() => updateQuery("entity", [])}
                >
                  Clear selection
                </Tag>
              )}
            </Space>

            <Row type="flex" gutter={[10, 10]}>
              <p className="specificity-title">For entities</p>
              {[entities[0]].map((entity) => {
                const name = humps.decamelize(entity);
                return (
                  name && (
                    <Col span={6} key={entity}>
                      <Card
                        onClick={() => handleChangeType("entity", entity)}
                        className={classNames("drawer-card", {
                          active: query?.entity?.includes(entity),
                        })}
                      >
                        <Space direction="vertical" align="center">
                          {entityIcon(name)}
                          <div className="topic-text">{entityName(name)}</div>
                        </Space>
                      </Card>
                    </Col>
                  )
                );
              })}
            </Row>
          </Col>

          {/* Affiliation */}
          <MultipleSelectFilter
            title="Affiliation"
            options={[]}
            value={[]}
            flag="affiliation"
            query={query}
            updateQuery={updateQuery}
          />

          {/*Geo-coverage*/}
          <MultipleSelectFilter
            title="Geo-coverage"
            options={
              isLoaded()
                ? geoCoverageTypeOptions?.map((x) => ({ value: x, label: x }))
                : []
            }
            value={query?.geoCoverage || []}
            flag="geoCoverage"
            query={query}
            updateQuery={updateQuery}
          />

          {/* Location */}
          <MultipleSelectFilter
            title="Location"
            options={
              isLoaded()
                ? countries?.map((x) => ({ value: x.name, label: x.name }))
                : []
            }
            value={query?.country || []}
            flag="location"
            query={query}
            updateQuery={updateQuery}
          />

          {/* Goals */}
          {/* <MultipleSelectFilter
            title="Goals"
            options={[]}
            value={query?.goal || []}
            flag="goal"
            query={query}
            updateQuery={updateQuery}
          /> */}

          {/*Expertise to offer*/}
          <MultipleSelectFilter
            title="What expertises are they offering?"
            options={
              isLoaded()
                ? offering?.map((x) => ({ value: x.id, label: x.tag }))
                : []
            }
            value={[]}
            flag="offering"
            query={query}
            updateQuery={updateQuery}
          />

          {/* Expertise they seek */}
          <MultipleSelectFilter
            title="What expertises are they seeking?"
            options={
              isLoaded()
                ? seeking?.map((x) => ({ value: x.id, label: x.tag }))
                : []
            }
            value={[]}
            flag="seeking"
            query={query}
            updateQuery={updateQuery}
          />

          {/* Representative group */}
          <MultipleSelectFilter
            title="Representative group"
            options={
              isLoaded()
                ? representativeGroup?.map((x) => ({ value: x, label: x }))
                : []
            }
            value={query?.representativeGroup || []}
            flag="representativeGroup"
            query={query}
            updateQuery={updateQuery}
          />

          <Col className="drawer-button-wrapper">
            <Button className="show-stakeholder-btn">
              Show stakeholders (87)
            </Button>
            <Button className="clear-all-btn">Clear all</Button>
          </Col>
        </Row>
      </Drawer>
    </div>
  );
};

const MultipleSelectFilter = ({
  title,
  options,
  value,
  query,
  flag,
  updateQuery,
  span = 24,
}) => {
  return (
    <Col span={span} className="multiselection-filter">
      <Space align="middle">
        <div className="filter-title multiple-filter-title">{title}</div>
        {!isEmpty(query?.[flag]) ? (
          <Tag
            className="clear-selection"
            closable
            onClose={() => updateQuery(flag, [])}
            onClick={() => updateQuery(flag, [])}
          >
            Clear Selection
          </Tag>
        ) : (
          ""
        )}
      </Space>
      <div>
        <Select
          showSearch
          allowClear
          mode="multiple"
          placeholder="All (default)"
          options={options}
          filterOption={(input, option) =>
            option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          value={value}
          onChange={(val) => updateQuery(flag, val)}
          onDeselect={(val) =>
            updateQuery(
              flag,
              query?.[flag]?.filter((x) => x != val)
            )
          }
          virtual={false}
        />
      </div>
    </Col>
  );
};

export default FilterDrawer;
