import React, { useState } from "react";
import { Row, Col, Space, Drawer, Tag, Card, Select, DatePicker } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import classNames from "classnames";

import { useAuth0 } from "@auth0/auth0-react";
import moment from "moment";
import api from "../../utils/api";
import { UIStore } from "../../store";
import { topicTypes, topicNames } from "../../utils/misc";
import { entityName } from "../../utils/misc";
import humps from "humps";
import isEmpty from "lodash/isEmpty";
import values from "lodash/values";
import flatten from "lodash/flatten";
import { ReactComponent as BusinessIcon } from "../../images/stakeholder-overview/business-icon.svg";
import { ReactComponent as AchievementIcon } from "../../images/stakeholder-overview/medal-icon.svg";
import { ReactComponent as AgreementIcon } from "../../images/stakeholder-overview/agreement-icon.svg";
import { ReactComponent as GPMLLogo } from "../../images/stakeholder-overview/gpml-logo.svg";
import { ReactComponent as Badge } from "../../images/stakeholder-overview/badge-outlined.svg";

const FilterDrawer = ({
  filterVisible,
  setFilterVisible,
  countData,
  entities,
  query,
  updateQuery,
}) => {
  const {
    profile,
    countries,
    tags,
    transnationalOptions,
    sectorOptions,
    geoCoverageTypeOptions,
    languages,
    representativeGroup,
  } = UIStore.useState((s) => ({
    profile: s.profile,
    countries: s.countries,
    tags: s.tags,
    transnationalOptions: s.transnationalOptions,
    sectorOptions: s.sectorOptions,
    geoCoverageTypeOptions: s.geoCoverageTypeOptions,
    languages: s.languages,
    representativeGroup: s.representativeGroup,
  }));
  const { isAuthenticated } = useAuth0();

  const isLoaded = () =>
    !isEmpty(tags) &&
    !isEmpty(countries) &&
    !isEmpty(transnationalOptions) &&
    !isEmpty(geoCoverageTypeOptions) &&
    !isEmpty(representativeGroup) &&
    !isEmpty(languages);

  const handleChangeResourceType = (flag, type) => {
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

  // populate options for tags dropdown
  const tagOpts = isLoaded()
    ? flatten(values(tags))?.map((it) => ({ value: it.id, label: it.tag }))
    : [];

  // populate options for representative group options
  const representativeOpts = isLoaded()
    ? flatten(
        representativeGroup?.map((x) => {
          //  if child is an object
          if (!Array.isArray(x?.childs) && x?.childs) {
            return tags?.[x?.childs?.tags]?.map((it) => ({
              value: it.id,
              label: it.tag,
            }));
          }
          // if child null
          if (!x?.childs) {
            return [{ value: x?.name, label: x?.name }];
          }
          return x?.childs?.map((x) => ({
            value: x,
            label: x,
          }));
        })
      )
    : [];

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
          {/* Resource type */}
          <Col span={24}>
            <Space align="middle">
              <div className="filter-title">Network type</div>
              {isEmpty(query?.topic) ? (
                <Tag className="resource-type">All (default)</Tag>
              ) : (
                <Tag
                  className="clear-selection"
                  closable={true}
                  onClose={() => updateQuery("topic", [])}
                >
                  Clear selection
                </Tag>
              )}
            </Space>

            <Row type="flex" gutter={[10, 10]}>
              {topicTypes.map((type) => {
                const topic = humps.decamelize(type);
                const count =
                  countData?.find((it) => it.topic === topic)?.count || 0;
                return (
                  <Col span={6} key={type}>
                    <Card
                      onClick={() => handleChangeResourceType("topic", topic)}
                      className={classNames("resource-type-card", {
                        active: query?.topic?.includes(topic),
                      })}
                    >
                      <Space direction="vertical" align="center">
                        <div className="topic-text">{topicNames(type)}</div>
                        <div className="topic-count">{count}</div>
                      </Space>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Col>

          {/* Specificity */}
          <Col span={24} className="specificity-card">
            <Space align="middle">
              <div className="filter-title">Specificity</div>
              {isEmpty(query?.topic) ? (
                <Tag className="resource-type">All (default)</Tag>
              ) : (
                <Tag
                  className="clear-selection"
                  closable={true}
                  onClose={() => updateQuery("topic", [])}
                >
                  Clear selection
                </Tag>
              )}
            </Space>

            <Row type="flex" gutter={[10, 10]}>
              <p className="specificity-title">For individuals</p>
              <Col span={6}>
                <Card
                // onClick={() => handleChangeResourceType("topic", topic)}
                className={classNames("resource-type-card", {
                  active: query?.topic?.includes(topic),
                })}
                >
                  <Space direction="vertical" align="center">
                    <Badge />
                    <div className="topic-text">Experts</div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Col>

          {/* For entities */}
          <Col span={24} className="specificity-card">
            <Row type="flex" gutter={[10, 10]}>
              <p className="specificity-title">For entities</p>
              {entities.map((entity) => {
                const name = humps.decamelize(entity);

                return (
                  <Col span={6} key={entity}>
                    <Card
                      // onClick={() => handleChangeResourceType("topic", topic)}
                      className={classNames("resource-type-card", {
                        active: query?.topic?.includes(name),
                      })}
                    >
                      <Space direction="vertical" align="center">
                        {entityIcon(name)}
                        <div className="topic-text">{entityName(name)}</div>
                      </Space>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Col>

          {/* Affiliation */}
          <MultipleSelectFilter
            title="Affiliation"
            options={tagOpts || []}
            value={query?.tag?.map((x) => parseInt(x)) || []}
            flag="affiliation"
            query={query}
            updateQuery={updateQuery}
          />
          {/* Location */}
          <MultipleSelectFilter
            title="Location"
            options={
              isLoaded()
                ? sectorOptions?.map((x) => ({ value: x, label: x }))
                : []
            }
            value={query?.sector || []}
            flag="location"
            query={query}
            updateQuery={updateQuery}
          />
          {/* Goals */}
          <MultipleSelectFilter
            title="Goals"
            options={[]}
            value={query?.goal || []}
            flag="goal"
            query={query}
            updateQuery={updateQuery}
          />
          {/*Expertise to offer*/}
          <MultipleSelectFilter
            title="What expertises are they offering?"
            options={representativeOpts}
            value={
              query?.representativeGroup?.map((x) =>
                Number(x) ? parseInt(x) : x
              ) || []
            }
            flag="expertiseToOffer"
            query={query}
            updateQuery={updateQuery}
          />
          {/* Expertise they seek */}
          <MultipleSelectFilter
            title="What expertises are they seeking?"
            options={
              isLoaded()
                ? geoCoverageTypeOptions?.map((x) => ({ value: x, label: x }))
                : []
            }
            value={query?.geoCoverage || []}
            flag="exertiseTheySeek"
            query={query}
            updateQuery={updateQuery}
          />
          {/* Representative group */}
          <MultipleSelectFilter
            title="Representative group"
            options={
              isLoaded()
                ? values(languages).map((x) => ({
                    value: x.name,
                    label: `${x.name} (${x.native})`,
                  }))
                : []
            }
            value={query?.language || []}
            flag="representativeGroup"
            query={query}
            updateQuery={updateQuery}
          />
          {/*Geo-coverage*/}
          <MultipleSelectFilter
            title="Geo-coverage"
            options={[]}
            value={query?.entity || []}
            flag="geoCoverage"
            query={query}
            updateQuery={updateQuery}
          />
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

const DatePickerFilter = ({
  title,
  value,
  query,
  flag,
  updateQuery,
  span = 24,
  startDate = null,
}) => {
  return (
    <Col span={span}>
      <Space align="middle">
        <div className="filter-title multiple-filter-title">{title}</div>
        {!isEmpty(query?.[flag]) ? (
          <Tag
            className="clear-selection"
            closable
            onClose={() => updateQuery(flag, [])}
          >
            Clear Selection
          </Tag>
        ) : (
          ""
        )}
      </Space>
      <div>
        <DatePicker
          placeholder="dd.mm.yyyy"
          value={!isEmpty(value) ? moment(value[0]) : ""}
          onChange={(val) =>
            updateQuery(flag, val ? moment(val).format("YYYY-MM-DD") : [])
          }
          disabledDate={(current) => {
            // Can not select days past start date
            if (startDate) {
              return current < startDate;
            }
            return null;
          }}
        />
      </div>
    </Col>
  );
};

export default FilterDrawer;
