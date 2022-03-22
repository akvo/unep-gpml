import React from "react";
import { Row, Col, Space, Drawer, Tag, Card, Select, Button } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import classNames from "classnames";

import { UIStore } from "../../store";
import { entityName, networkNames, networkTypes } from "../../utils/misc";
import humps from "humps";
import isEmpty from "lodash/isEmpty";

import { ReactComponent as BusinessIcon } from "../../images/stakeholder-overview/business-icon.svg";
import { ReactComponent as AchievementIcon } from "../../images/stakeholder-overview/medal-icon.svg";
import { ReactComponent as AgreementIcon } from "../../images/stakeholder-overview/agreement-icon.svg";
import { ReactComponent as GPMLLogo } from "../../images/stakeholder-overview/gpml-logo.svg";
import { ReactComponent as CommunityIcon } from "../../images/stakeholder-overview/community-outlined.svg";
import { ReactComponent as UnionIcon } from "../../images/stakeholder-overview/union-outlined.svg";

const FilterDrawer = ({
  query,
  updateQuery,
  entities,
  filterVisible,
  setFilterVisible,
  stakeholderCount,
  GPMLMemberCount,
  setFilterCountries,
}) => {
  const {
    seeking,
    offering,
    countries,
    organisations,
    representativeGroup,
    transnationalOptions,
    geoCoverageTypeOptions,
  } = UIStore.useState((s) => ({
    seeking: s.tags.seeking,
    offering: s.tags.offering,
    countries: s.countries,
    organisations: s.organisations,
    representativeGroup: s.sectorOptions,
    transnationalOptions: s.transnationalOptions,
    geoCoverageTypeOptions: s.geoCoverageTypeOptions,
  }));

  const isLoaded = () =>
    !isEmpty(countries) &&
    !isEmpty(transnationalOptions) &&
    !isEmpty(geoCoverageTypeOptions) &&
    !isEmpty(representativeGroup);

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

  const networkIcon = (name) => {
    if (name.toLowerCase() === "stakeholder") {
      return <UnionIcon />;
    }
    if (name.toLowerCase() === "organisation") {
      return <CommunityIcon />;
    }
  };

  const filterQueries = [
    "country",
    "networkType",
    "representativeGroup",
    "geoCoverageType",
    "seeking",
    "offering",
    "affiliation",
    "isMember",
  ];

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

  const queryToRefresh = Object.fromEntries(
    Object.entries(query).filter(([key]) => key !== "page" && key !== "q")
  );

  const queryValues = Object.values(queryToRefresh).flat();

  const countryOpts = countries
    .filter((country) => country.description === "Member State")
    .map((it) => ({ value: it.id, label: it.name }))
    .sort((a, b) => a.label.localeCompare(b.label));

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
          <Col span={24} className="network-card-filter">
            <Space align="middle">
              <div className="filter-title">Network type</div>
              {isEmpty(query?.networkType) ? (
                <Tag className="selection-card-type">All (default)</Tag>
              ) : (
                <Tag
                  className="clear-selection"
                  closable={true}
                  onClose={() => updateQuery("networkType", [])}
                  onClick={() => updateQuery("networkType", [])}
                >
                  Clear selection
                </Tag>
              )}
            </Space>

            <Row type="flex" gutter={[10, 10]}>
              {networkTypes.map((networkType) => {
                return (
                  <Col span={6} key={networkType}>
                    <Card
                      onClick={() =>
                        handleChangeType("networkType", networkType)
                      }
                      className={classNames("drawer-card", {
                        active: query?.networkType?.includes(networkType),
                      })}
                    >
                      <Space direction="vertical" align="center">
                        {networkIcon(networkType)}
                        <div className="topic-text">
                          {networkNames(networkType)}
                        </div>
                        <div className="topic-text topic-counts">
                          {networkType === "organisation"
                            ? stakeholderCount?.entity
                            : stakeholderCount?.individual}
                        </div>
                      </Space>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Col>

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
                        onClick={() => handleChangeType("isMember", "true")}
                        className={classNames("drawer-card", {
                          active: query?.isMember.includes("true"),
                        })}
                      >
                        <Space
                          direction="vertical"
                          align="center"
                          className="for-entity"
                        >
                          {entityIcon(name)}
                          <div className="topic-text">{entityName(name)}</div>
                          <div className="topic-text topic-counts">
                            {GPMLMemberCount}
                          </div>
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
            options={
              isLoaded()
                ? organisations
                    ?.map((x) => ({ value: x.id, label: x.name }))
                    .filter((organisation) => organisation?.value > -1)
                : []
            }
            value={query?.affiliation?.map((x) => parseInt(x)) || []}
            flag="affiliation"
            query={query}
            updateQuery={updateQuery}
          />

          {/*Geo-coverage*/}
          <MultipleSelectFilter
            title="Geo-coverage"
            options={
              isLoaded()
                ? geoCoverageTypeOptions?.map((x) => ({
                    value: x,
                    label: x,
                  }))
                : []
            }
            value={query?.geoCoverageType || []}
            flag="geoCoverageType"
            query={query}
            updateQuery={updateQuery}
          />

          {/* Location */}
          <MultipleSelectFilter
            title="Location"
            options={countryOpts}
            value={query?.country?.map((x) => parseInt(x)) || []}
            flag="country"
            query={query}
            updateQuery={updateQuery}
          />

          {/*Expertise to offer*/}
          <MultipleSelectFilter
            title="What expertises are they offering?"
            options={
              isLoaded()
                ? offering?.map((x) => ({ value: x.tag, label: x.tag }))
                : []
            }
            value={query?.offering || []}
            flag="offering"
            query={query}
            updateQuery={updateQuery}
          />

          {/* Expertise they seek */}
          <MultipleSelectFilter
            title="What expertises are they seeking?"
            options={
              isLoaded()
                ? seeking?.map((x) => ({ value: x.tag, label: x.tag }))
                : []
            }
            value={query?.seeking || []}
            flag="seeking"
            query={query}
            updateQuery={updateQuery}
          />

          {/* Representative group */}
          <MultipleSelectFilter
            title="Representative group"
            options={
              isLoaded()
                ? representativeGroup
                    ?.map((x) => ({ value: x, label: x }))
                    .sort((a, b) => a?.label?.localeCompare(b?.label))
                : []
            }
            value={query?.representativeGroup || []}
            flag="representativeGroup"
            query={query}
            updateQuery={updateQuery}
          />

          <Col className="drawer-button-wrapper">
            <Button
              disabled={queryValues.length === 0}
              className={
                queryValues.length > 0
                  ? "clear-all-btn"
                  : "clear-all-btn disabled"
              }
              onClick={() => {
                if (queryValues.length > 0) {
                  const paramValueArr = filterQueries.map((query) => ({
                    param: query,
                    value: [],
                  }));
                  setFilterCountries([]);
                  updateQuery(null, null, paramValueArr);
                }
              }}
            >
              Clear all
            </Button>
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
