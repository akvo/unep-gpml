import React, { useState } from "react";
import { Row, Col, Space, Drawer, Checkbox, Tag, Card, Image } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import classNames from "classnames";

import { useAuth0 } from "@auth0/auth0-react";
import api from "../../utils/api";
import { filterState } from "./common";
import { UIStore } from "../../store";
import { topicTypes, topicNames } from "../../utils/misc";
import CountryTransnationalFilter from "./country-transnational-filter";
import humps from "humps";
import isEmpty from "lodash/isEmpty";

const FilterDrawer = ({
  filterVisible,
  setFilterVisible,
  countData,
  query,
  updateQuery,
}) => {
  const { resourceType } = filterState.useState((s) => ({
    resourceType: s.resourceType,
  }));
  const { profile, countries, tags, transnationalOptions } = UIStore.useState(
    (s) => ({
      profile: s.profile,
      countries: s.countries,
      tags: s.tags,
      transnationalOptions: s.transnationalOptions,
    })
  );
  const { isAuthenticated } = useAuth0();
  const [multiCountryCountries, setMultiCountryCountries] = useState([]);

  const handleChangeResourceType = (flag, type) => {
    const val = query[flag];
    let updateVal = [];
    if (topicTypes?.length === val.length) {
      updateVal = [type];
    } else if (val.includes(type)) {
      updateVal = val.filter((x) => x !== type);
    } else {
      updateVal = [...val, type];
    }
    updateQuery(flag, updateVal);
    filterState.update((e) => {
      e.resourceType = updateVal;
    });
  };

  const handleClearResourceType = () => {
    const val = topicTypes?.map((x) => humps.decamelize(x));
    updateQuery("topic", val);
    filterState.update((e) => {
      e.resourceType = [];
    });
  };

  const handleChangeLocationTab = (key) => {
    const param = key === "country" ? "transnational" : "country";
    updateQuery(param, []);
  };

  const handleChangeCountry = (val) => {
    const selected = countries?.filter((x) => {
      return val.includes(x.id);
    });
    updateQuery(
      "country",
      selected.map((x) => x.id)
    );
  };

  const handleDeselectCountry = (val) => {
    const diselected = countries?.find((x) => x.id === val);
    const selected =
      countries && query?.country
        ? countries.filter(
            (x) =>
              query.country.includes(String(x.id)) && diselected.id !== x.id
          )
        : [];
    updateQuery(
      "country",
      selected.map((x) => x.id)
    );
  };

  const handleChangeMultiCountry = (val) => {
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
    const diselected = transnationalOptions?.find((x) => x.id === val);
    const selected =
      transnationalOptions && query?.transnational
        ? transnationalOptions.filter(
            (x) =>
              query.transnational.includes(String(x.id)) &&
              diselected.id !== x.id
          )
        : [];
    updateQuery(
      "transnational",
      selected.map((x) => x.id)
    );
  };

  const country =
    countries && query?.country
      ? countries
          .filter((x) => query.country.includes(String(x.id)))
          .map((x) => x.id)
      : [];

  const multiCountry =
    transnationalOptions && query?.transnational
      ? transnationalOptions
          .filter((x) => query.transnational.includes(String(x.id)))
          .map((x) => x.id)
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
      >
        {/* Filter content */}
        <Row type="flex" gutter={[0, 24]}>
          {/* Resource type */}
          <Col span={24}>
            <Space align="middle">
              <div className="filter-title">Resource type</div>
              {isEmpty(resourceType) ? (
                <Tag>All (default)</Tag>
              ) : (
                <Tag closable={true} onClose={() => handleClearResourceType()}>
                  Clear selection
                </Tag>
              )}
            </Space>
            <Row type="flex" gutter={[12, 12]}>
              {topicTypes.map((type) => {
                const topic = humps.decamelize(type);
                const count =
                  countData?.find((it) => it.topic === topic)?.count || 0;
                return (
                  <Col span={6} key={type}>
                    <Card
                      onClick={() => handleChangeResourceType("topic", topic)}
                      className={classNames("resource-type-card", {
                        active: resourceType?.includes(topic),
                      })}
                    >
                      <Space direction="vertical" align="center">
                        <Image />
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
                  className="my-favorites"
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
          <Col span={24}>
            <Space align="middle">
              <div className="filter-title">Location</div>
            </Space>
            <div className="country-filter-tab-wrapper">
              <CountryTransnationalFilter
                handleChangeTab={handleChangeLocationTab}
                country={country}
                handleChangeCountry={handleChangeCountry}
                handleDeselectCountry={handleDeselectCountry}
                multiCountry={multiCountry}
                handleChangeMultiCountry={handleChangeMultiCountry}
                handleDeselectMultiCountry={handleDeselectMultiCountry}
                multiCountryCountries={multiCountryCountries}
                multiCountryLabelCustomIcon={true}
                countrySelectMode="multiple"
                multiCountrySelectMode="multiple"
              />
            </div>
          </Col>
        </Row>
      </Drawer>
    </div>
  );
};

export default FilterDrawer;
