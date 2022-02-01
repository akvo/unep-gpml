import React, { useState } from "react";
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
import { topicTypes, topicNames, topicIcons } from "../../utils/misc";
import CountryTransnationalFilter from "./country-transnational-filter";
import humps from "humps";
import isEmpty from "lodash/isEmpty";
import values from "lodash/values";
import flatten from "lodash/flatten";

const FilterDrawer = ({
  filterVisible,
  setFilterVisible,
  countData,
  query,
  updateQuery,
  multiCountryCountries,
  setMultiCountryCountries,
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

  const handleChangeLocationTab = (key) => {
    const param = key === "country" ? "transnational" : "country";
    // updateQuery(param, []);
  };

  const handleChangeCountry = (val) => {
    updateQuery("country", query?.country ? [...query?.country, ...val] : val);
  };

  const handleDeselectCountry = (val) => {
    updateQuery(
      "country",
      query?.country ? query?.country.filter((x) => x != val) : []
    );
  };

  const handleChangeMultiCountry = (val) => {
    updateQuery("transnational", [...query?.transnational, ...val]);
    // Fetch transnational countries
    val.forEach((id) => {
      const check = multiCountryCountries.find((x) => x.id === id);
      !check &&
        api.get(`/country-group/${id}`).then((resp) => {
          setMultiCountryCountries([
            ...multiCountryCountries,
            { id: id, countries: resp.data?.[0]?.countries },
          ]);
        });
    });
  };

  const handleDeselectMultiCountry = (val) => {
    updateQuery(
      "transnational",
      query?.transnational ? query?.transnational.filter((x) => x != val) : []
    );
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
          {/* My Bookmarks */}
          {isAuthenticated && (
            <Col span={24}>
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
              {/* <Select
                className="collection-selector"
                disabled={
                  !isEmpty(query?.favorites)
                    ? query.favorites[0] === "true"
                      ? false
                      : true
                    : true
                }
                showSearch
                allowClear
                mode="multiple"
                placeholder="My collections"
                options={[]}
                filterOption={(input, option) =>
                  option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                value={[]}
                onChange={(val) => updateQuery("collections", val)}
                onDeselect={(val) =>
                  updateQuery(
                    "collections",
                    query?.collections?.filter((x) => x != val)
                  )
                }
                virtual={false}
              /> */}
            </Col>
          )}
          {/* Location */}
          <Col span={24}>
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
                handleChangeTab={handleChangeLocationTab}
                country={query?.country?.map((x) => parseInt(x)) || []}
                handleChangeCountry={handleChangeCountry}
                handleDeselectCountry={handleDeselectCountry}
                multiCountry={
                  query?.transnational?.map((x) => parseInt(x)) || []
                }
                handleChangeMultiCountry={handleChangeMultiCountry}
                handleDeselectMultiCountry={handleDeselectMultiCountry}
                multiCountryCountries={multiCountryCountries}
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
            value={query?.tag?.map((x) => parseInt(x)) || []}
            flag="tag"
            query={query}
            updateQuery={updateQuery}
          />
          {/* Sectors */}
          {/* <MultipleSelectFilter
            title="Sectors"
            options={
              isLoaded()
                ? sectorOptions?.map((x) => ({ value: x, label: x }))
                : []
            }
            value={query?.sector || []}
            flag="sector"
            query={query}
            updateQuery={updateQuery}
          /> */}
          {/* Goals */}
          {/* <MultipleSelectFilter
            title="Goals"
            options={[]}
            value={query?.goal || []}
            flag="goal"
            query={query}
            updateQuery={updateQuery}
          /> */}
          {/* Representative group */}
          <MultipleSelectFilter
            title="Representative group"
            options={representativeOpts}
            value={
              query?.representativeGroup?.map((x) =>
                Number(x) ? parseInt(x) : x
              ) || []
            }
            flag="representativeGroup"
            query={query}
            updateQuery={updateQuery}
          />

          {/* Language */}
          {/* <MultipleSelectFilter
            title="Language"
            options={
              isLoaded()
                ? values(languages).map((x) => ({
                    value: x.name,
                    label: `${x.name} (${x.native})`,
                  }))
                : []
            }
            value={query?.language || []}
            flag="language"
            query={query}
            updateQuery={updateQuery}
          /> */}
          {/* Rating */}
          {/* <MultipleSelectFilter
            title="Rating"
            options={[]}
            value={query?.rating || []}
            flag="rating"
            query={query}
            updateQuery={updateQuery}
          /> */}
          {/* Date Filter */}
          <Col span={24} className="date-picker-container">
            <Row type="flex" style={{ width: "100%" }} gutter={[10, 10]}>
              {/* Start date */}
              <DatePickerFilter
                title="Start date"
                value={query?.startDate}
                flag="startDate"
                query={query}
                updateQuery={updateQuery}
                span={12}
              />
              {/* End date */}
              <DatePickerFilter
                title="End date"
                value={query?.endDate}
                flag="endDate"
                query={query}
                updateQuery={updateQuery}
                span={12}
                startDate={
                  !isEmpty(query?.startDate)
                    ? moment(query?.startDate[0])
                    : null
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
