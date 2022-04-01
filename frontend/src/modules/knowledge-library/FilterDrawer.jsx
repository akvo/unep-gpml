import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Space,
  Drawer,
  Checkbox,
  Tag,
  Card,
  Select,
  DatePicker,
} from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import classNames from "classnames";

import { useAuth0 } from "@auth0/auth0-react";
import moment from "moment";
import api from "../../utils/api";
import { UIStore } from "../../store";
import { topicTypes, topicNames } from "../../utils/misc";
import CountryTransnationalFilter from "./country-transnational-filter";
import humps from "humps";
import isEmpty from "lodash/isEmpty";
import values from "lodash/values";
import flatten from "lodash/flatten";

// Import Icons as React component since the color of the icons changes when the card is selected
import { ReactComponent as CapacityBuildingIcon } from "../../images/knowledge-library/capacity-building.svg";
import { ReactComponent as ActionSelectedIcon } from "../../images/knowledge-library/action-selected.svg";
import { ReactComponent as EventFlexibleIcon } from "../../images/knowledge-library/event-flexible.svg";
import { ReactComponent as InitiativeIcon } from "../../images/knowledge-library/initiative.svg";
import { ReactComponent as FinancingIcon } from "../../images/knowledge-library/financing-2.svg";
import { ReactComponent as PolicyIcon } from "../../images/knowledge-library/policy.svg";
import { ReactComponent as TechnicalIcon } from "../../images/knowledge-library/technical.svg";
import { ReactComponent as TechnologyIcon } from "../../images/knowledge-library/technology.svg";
import { titleCase } from "../../utils/string";

const FilterDrawer = ({
  query,
  countData,
  updateQuery,
  filterVisible,
  setFilterVisible,
  multiCountryCountries,
  setMultiCountryCountries,
}) => {
  const {
    nav,
    tags,
    countries,
    transnationalOptions,
    geoCoverageTypeOptions,
    representativeGroup,
    mainContentType,
    organisations,
  } = UIStore.useState((s) => ({
    profile: s.profile,
    nav: s.nav,
    tags: s.tags,
    countries: s.countries,
    transnationalOptions: s.transnationalOptions,
    geoCoverageTypeOptions: s.geoCoverageTypeOptions,
    mainContentType: s.mainContentType,
    representativeGroup: s.representativeGroup,
    organisations: s.organisations,
  }));
  const { isAuthenticated } = useAuth0();

  const isLoaded = () =>
    !isEmpty(tags) &&
    !isEmpty(countries) &&
    !isEmpty(transnationalOptions) &&
    !isEmpty(geoCoverageTypeOptions) &&
    !isEmpty(mainContentType) &&
    !isEmpty(representativeGroup) &&
    !isEmpty(organisations);

  const filteredMainContentOptions = isLoaded()
    ? mainContentType
        .filter((content) => {
          const resourceName = (name) => {
            if (name === "initiative") {
              return "project";
            } else if (name === "event_flexible") {
              return "event";
            } else if (name === "financing") {
              return "financing_resource";
            } else if (name === "technical") {
              return "technical_resource";
            } else if (name === "action") {
              return "action_plan";
            } else {
              return name;
            }
          };
          return query?.topic.includes(resourceName(content.code));
        })
        .sort((a, b) => a?.code.localeCompare(b?.code))
    : [];

  const mainContentOption = () => {
    if (query?.topic.length > 0) {
      return filteredMainContentOptions;
    } else if (query?.topic.length === 0) {
      return mainContentType;
    }
  };

  const topicIcons = (topic) => {
    if (topic === "project") {
      return <InitiativeIcon width="53" height="53" />;
    }
    if (topic === "actionPlan") {
      return <ActionSelectedIcon width="53" height="53" />;
    }
    if (topic === "policy") {
      return <PolicyIcon width="53" height="53" />;
    }
    if (topic === "technicalResource") {
      return <TechnicalIcon width="53" height="53" />;
    }
    if (topic === "financingResource") {
      return <FinancingIcon width="53" height="53" />;
    }
    if (topic === "event") {
      return <EventFlexibleIcon width="53" height="53" />;
    }
    if (topic === "technology") {
      return <TechnologyIcon width="53" height="53" />;
    }
    if (topic === "capacityBuilding") {
      return <CapacityBuildingIcon width="53" height="53" />;
    }
  };

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
  const tagsWithoutSpace =
    isLoaded() &&
    flatten(values(tags)).map((it) => ({
      value: it?.tag?.trim(),
      label: it?.tag?.trim(),
    }));

  const tagOpts = isLoaded()
    ? [...new Set(tagsWithoutSpace.map((s) => JSON.stringify(s)))]
        .map((s) => JSON.parse(s))
        ?.sort((tag1, tag2) => tag1?.label.localeCompare(tag2?.label))
    : [];

  // populate options for representative group options
  const representativeOpts = isLoaded()
    ? [...representativeGroup, { code: "other", name: "Other" }].map((x) => ({
        label: x?.name,
        value: x?.code,
      }))
    : [];

  return (
    <div className="site-drawer-render-in-current-wrapper">
      <Drawer
        tabIndex=""
        tabindex=""
        title="Choose your filters below"
        placement="left"
        visible={filterVisible}
        getContainer={false}
        onClose={() => setFilterVisible(false)}
        closeIcon={<CloseCircleOutlined className="drawer-close-icon" />}
        style={{ position: "absolute" }}
        height="100%"
        autoFocus={false}
      >
        {/* Filter content */}
        <Row type="flex" gutter={[0, 24]}>
          {/* Resource type */}
          <Col span={24} className="resources-card-filter">
            <Space align="middle">
              <div className="filter-title">Resources type</div>
              {isEmpty(query?.topic) ? (
                <Tag className="resource-type">All (default)</Tag>
              ) : (
                <Tag
                  className="clear-selection"
                  closable={true}
                  onClick={() => updateQuery("topic", [])}
                  onClose={() => updateQuery("topic", [])}
                >
                  Clear selection
                </Tag>
              )}
            </Space>
            <Row
              type="flex"
              gutter={[10, 10]}
              justify="space-between"
              style={{ width: "100%" }}
            >
              {topicTypes.map((type) => {
                const topic = humps.decamelize(type);
                const count =
                  countData?.find((it) => it.topic === topic)?.count || 0;

                return (
                  <Col span={6} key={type} className="resource-card-wrapper">
                    <Card
                      onClick={() => handleChangeResourceType("topic", topic)}
                      className={classNames("resource-type-card", {
                        active: query?.topic?.includes(topic),
                      })}
                    >
                      <Space direction="vertical" align="center">
                        {topicIcons(type)}
                        <div className="topic-text">{topicNames(type)}</div>
                        <div className="topic-count">{count}</div>
                      </Space>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Col>
          {/* Sub-content type */}

          <MultipleSelectFilter
            title="Sub-content type"
            options={
              isLoaded()
                ? mainContentOption().map((content) => ({
                    label: content?.name,
                    options: content?.childs
                      .map((child, i) => ({
                        label: child?.title,
                        value: child?.title,
                        key: `${i}-${content.name}`,
                      }))
                      .sort((a, b) =>
                        a?.label?.trim().localeCompare(b?.label?.trim())
                      ),
                  }))
                : []
            }
            value={query?.subContentType || []}
            flag="subContentType"
            query={query}
            updateQuery={updateQuery}
          />

          {/* My Bookmarks */}
          {isAuthenticated && (
            <Col span={24} style={{ paddingTop: 5, paddingBottom: 5 }}>
              <Space align="middle">
                <Checkbox
                  className="favorites-checkbox"
                  checked={query?.favorites?.indexOf("true") > -1}
                  onChange={({ target: { checked } }) =>
                    updateQuery("favorites", checked)
                  }
                >
                  My Bookmarks
                </Checkbox>
              </Space>
            </Col>
          )}
          {/* Location */}
          <Col span={24} style={{ paddingTop: 5, paddingBottom: 5 }}>
            <Space align="middle">
              <div className="filter-title">Location</div>
              {!isEmpty(query?.country) ? (
                <Tag
                  className="clear-selection"
                  closable
                  onClick={() => {
                    updateQuery("country", []);
                  }}
                  onClose={() => updateQuery("country", [])}
                >
                  Clear Country Selection
                </Tag>
              ) : (
                ""
              )}
              {!isEmpty(query?.transnational) ? (
                <Tag
                  className="clear-selection"
                  closable
                  onClick={() => {
                    updateQuery("transnational", []);
                    setMultiCountryCountries([]);
                  }}
                  onClose={() => updateQuery("transnational", [])}
                >
                  Clear Multi-Country Selection
                </Tag>
              ) : (
                ""
              )}
            </Space>
            <div className="country-filter-tab-wrapper">
              <CountryTransnationalFilter
                {...{
                  query,
                  updateQuery,
                  multiCountryCountries,
                  setMultiCountryCountries,
                }}
                country={query?.country?.map((x) => parseInt(x)) || []}
                multiCountry={
                  query?.transnational?.map((x) => parseInt(x)) || []
                }
                multiCountryLabelCustomIcon={true}
                countrySelectMode="multiple"
                multiCountrySelectMode="multiple"
              />
            </div>
          </Col>
          {/* Tags */}
          <MultipleSelectFilter
            title="Tags"
            options={tagOpts || []}
            value={query?.tag?.map((x) => x) || []}
            flag="tag"
            query={query}
            updateQuery={updateQuery}
          />

          <MultipleSelectFilter
            title="Entities"
            options={
              isLoaded()
                ? organisations
                    ?.map((x) => ({ value: x.id, label: x.name }))
                    .filter((organisation) => organisation?.value > -1)
                : []
            }
            value={query?.entity?.map((x) => parseInt(x)) || []}
            flag="entity"
            query={query}
            updateQuery={updateQuery}
          />

          <MultipleSelectFilter
            title="Representative group"
            options={
              isLoaded()
                ? representativeOpts.map((x) => ({
                    value: x?.value,
                    label: x.label,
                  }))
                : []
            }
            value={query?.representativeGroup || []}
            flag="representativeGroup"
            query={query}
            updateQuery={updateQuery}
          />
          {/* Date Filter */}
          <Col
            span={24}
            className="date-picker-container"
            style={{ paddingTop: 5, paddingBottom: 5 }}
          >
            <Row type="flex" style={{ width: "100%" }} gutter={[10, 10]}>
              {/* Start date */}
              <DatePickerFilter
                title="Start Date"
                value={query?.startDate}
                flag="startDate"
                query={query}
                updateQuery={updateQuery}
                span={12}
                startDate={
                  !isEmpty(query?.startDate)
                    ? moment(query?.startDate[0])
                    : null
                }
              />
              {/* End date */}
              <DatePickerFilter
                title="End Date"
                value={query?.endDate}
                flag="endDate"
                query={query}
                updateQuery={updateQuery}
                span={12}
                startDate={
                  !isEmpty(query?.endDate) ? moment(query?.endDate[0]) : null
                }
              />
            </Row>
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
            onClick={() => updateQuery(flag, [])}
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
          dropdownClassName="multiselection-dropdown"
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
            onClick={() => updateQuery(flag, [])}
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
