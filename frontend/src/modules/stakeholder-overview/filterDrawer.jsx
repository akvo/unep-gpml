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
  filterVisible,
  setFilterVisible,
  entities,
  query,
  updateQuery,
  organisationCount,
  GPMLMemberCount,
}) => {
  const {
    countries,
    transnationalOptions,
    geoCoverageTypeOptions,
    representativeGroup,
    organisations,
    stakeholders,
    seeking,
    offering,
  } = UIStore.useState((s) => ({
    countries: s.countries,
    transnationalOptions: s.transnationalOptions,
    geoCoverageTypeOptions: s.geoCoverageTypeOptions,
    representativeGroup: s.sectorOptions,
    stakeholders: s.stakeholders?.stakeholders,
    organisations: s.organisations,
    seeking: s.tags.seeking,
    offering: s.tags.offering,
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
    "topic",
    "representativeGroup",
    "geoCoverage",
    "seeking",
    "offering",
    "affiliation",
    "is_member",
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
          <Col span={24}>
            <Space align="middle">
              <div className="filter-title">Network type</div>
              {isEmpty(query?.topic) ? (
                <Tag className="selection-card-type">All (default)</Tag>
              ) : (
                <Tag
                  className="clear-selection"
                  closable={true}
                  onClose={() => updateQuery("topic", [])}
                  onClick={() => updateQuery("topic", [])}
                >
                  Clear selection
                </Tag>
              )}
            </Space>

            <Row type="flex" gutter={[10, 10]}>
              {networkTypes.map((type) => {
                return (
                  <Col span={6} key={type}>
                    <Card
                      onClick={() => handleChangeType("topic", type)}
                      className={classNames("drawer-card", {
                        active: query?.topic?.includes(type),
                      })}
                    >
                      <Space direction="vertical" align="center">
                        {networkIcon(type)}
                        <div className="topic-text">{networkNames(type)}</div>
                        <div className="topic-text topic-counts">
                          {type === "organisation"
                            ? organisationCount
                            : stakeholders?.length}
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
                        onClick={() => handleChangeType("is_member", entity)}
                        className={classNames("drawer-card", {
                          active: query?.is_member.length > 0,
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
                ? organisations?.map((x) => ({ value: x.id, label: x.name }))
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
                ? representativeGroup?.map((x) => ({ value: x, label: x }))
                : []
            }
            value={query?.representativeGroup || []}
            flag="representativeGroup"
            query={query}
            updateQuery={updateQuery}
          />

          <Col className="drawer-button-wrapper">
            <Button
              className="clear-all-btn"
              onClick={() => {
                const paramValueArr = filterQueries.map((query) => ({
                  param: query,
                  value: [],
                }));

                updateQuery(null, null, paramValueArr);
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
