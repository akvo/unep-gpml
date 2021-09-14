import { UIStore } from "../../store";
import React, { useState, useEffect } from "react";
import { Button, Select, Switch, Tabs, Popover } from "antd";
import {
  DownOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Link, withRouter } from "react-router-dom";
import Maps from "./maps";
import "./map-styles.scss";
import humps from "humps";
import { topicNames, tTypes } from "../../utils/misc";
import api from "../../utils/api";

const { TabPane } = Tabs;
const { Option, OptGroup } = Select;

const MapLanding = ({
  history,
  setStakeholderSignupModalVisible,
  setWarningModalVisible,
  isAuthenticated,
  loginWithPopup,
  filters,
  setFilters,
  setToggleButton,
  updateQuery,
}) => {
  const { innerWidth, innerHeight } = window;
  const { profile, countries, landing } = UIStore.useState((s) => ({
    profile: s.profile,
    countries: s.countries,
    landing: s.landing,
  }));
  const [country, setCountry] = useState(null);
  const [counts, setCounts] = useState("project");
  const [multiCountry, setMultiCountry] = useState(null);

  const isApprovedUser = profile?.reviewStatus === "APPROVED";
  const hasProfile = profile?.reviewStatus;

  const isLoaded = () => Boolean(countries.length);

  const clickCountry = (name) => {
    setToggleButton("list");
    updateQuery("country", name);
    history.push(`/browse?country=${name}`);
  };

  const handleChangeTab = (key) => {
    key === "multi-country" && setCountry(null);
    key === "country" && setMultiCountry(null);
  };

  const handleChangeCountry = (id) => {
    setCountry(id);
  };

  const handleChangeMultiCountry = (id) => {
    setMultiCountry(id);
  };

  const countryOpts = countries
    ? countries
        .map((it) => ({ value: it.id, label: it.name }))
        .sort((a, b) => a.label.localeCompare(b.label))
    : [];

  const countryObj = country && countries.find((it) => it.id === country);

  const handleSummaryClick = (topic) => {
    setCounts(topic);
  };

  const handleSeeAllStakeholderClick = () => {
    if (!isAuthenticated) {
      return loginWithPopup();
    }
    if (isAuthenticated && !hasProfile) {
      return setStakeholderSignupModalVisible(true);
    }
    return setWarningModalVisible(true);
  };

  const selected =
    countries && country
      ? landing?.map?.find((x) => x.countryId === country)
      : {};

  const summaryData = landing?.summary?.filter((it, index) => {
    const current = Object.keys(it)[0];
    return tTypes.indexOf(current) > -1;
  });

  useEffect(() => {
    filters && setFilters(null);
  }, [filters, setFilters]);

  return (
    <div id="map-landing">
      <div className="landing-container map-container">
        {!isLoaded() && (
          <h2 className="loading">
            <LoadingOutlined spin /> Loading Data
          </h2>
        )}
        {isLoaded() && (
          <div className="map-overlay">
            <Tabs
              type="card"
              className="country-filter-tab"
              onChange={handleChangeTab}
            >
              <TabPane
                tab="Countries"
                key="country"
                className="country-filter-tab-pane country"
              >
                <Select
                  showSearch
                  allowClear
                  placeholder="Countries"
                  options={countryOpts}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().indexOf(input.toLowerCase()) >=
                    0
                  }
                  value={country}
                  onChange={handleChangeCountry}
                  virtual={false}
                />
              </TabPane>
              <TabPane
                tab="Multi-Country"
                key="multi-country"
                className={`country-filter-tab-pane ${
                  multiCountry ? "multi-country-info" : "multi-country"
                }`}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder="Multi-Country"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().indexOf(input.toLowerCase()) >=
                    0
                  }
                  value={multiCountry}
                  onChange={handleChangeMultiCountry}
                  dropdownClassName="country-filter-dropdown"
                  dropdownMatchSelectWidth={325}
                  suffixIcon={
                    multiCountry ? <MultiCountryInfo /> : <DownOutlined />
                  }
                >
                  <OptGroup
                    key="g1"
                    label="UN Regional Groups of Member States"
                  >
                    <Option value="1">African States</Option>
                    <Option value="2">Asia Pacific States</Option>
                  </OptGroup>
                </Select>
              </TabPane>
            </Tabs>
            <Summary
              clickEvents={handleSummaryClick}
              seeAllEvents={handleSeeAllStakeholderClick}
              isApprovedUser={isApprovedUser}
              summary={summaryData}
              country={countryObj}
              counts={counts}
              selected={selected}
              init={counts}
              setToggleButton={setToggleButton}
              updateQuery={updateQuery}
            />
          </div>
        )}
        {/* Dont render maps on mobile */}
        {innerWidth >= 768 && (
          <Maps
            data={landing?.map || []}
            clickEvents={clickCountry}
            topic={counts}
            country={countries.find((x) => x.id === country)}
          />
        )}
      </div>
    </div>
  );
};

const Summary = ({
  clickEvents,
  seeAllEvents,
  summary,
  country,
  counts,
  selected,
  init,
  isApprovedUser,
  setToggleButton,
  updateQuery,
}) => {
  summary = summary.map((x) => ({
    ...x,
    name: Object.keys(x).find((k) => k !== "country"),
  }));
  summary = tTypes.map((x) => summary.find((it) => it.name === x));
  const restricted = ["stakeholder", "organisation"];
  // Filter, do not show restricted
  summary = summary.filter((x) => !restricted.includes(x.name));
  return (
    <div className="summary">
      <header>{!selected ? "Global summary" : "Summary"}</header>
      <ul>
        {!country &&
          summary.map((it, index) => {
            const current = Object.keys(it)[0];
            let className =
              init !== current
                ? "summary-list"
                : "summary-list summary-list-selected";
            if (init === "") {
              className =
                current !== counts
                  ? "summary-list"
                  : "summary-list summary-list-selected";
              className = counts === "" ? "" : className;
            }
            return (
              <li key={`li-${index}`} className={className}>
                <div className="switcher" onClick={(e) => clickEvents(current)}>
                  <Switch
                    size="small"
                    checked={counts === current || init === current}
                  />
                </div>
                <div className="text" onClick={(e) => clickEvents(current)}>
                  <div className="label">{topicNames(current)}</div>
                  <span>
                    <b>{it[current]}</b> in <b>{it.countries}</b>{" "}
                    {it.countries === 1 ? "country" : "countries"}
                  </span>
                </div>
                {restricted.includes(current) && !isApprovedUser ? (
                  <Link to="/" onClick={seeAllEvents}>
                    See all
                  </Link>
                ) : (
                  <Link
                    onClick={() => {
                      setToggleButton("list");
                      updateQuery("topic", [humps.decamelize(current)]);
                    }}
                    to={{
                      pathname: restricted.includes(current)
                        ? "/stakeholders"
                        : "/browse",
                      search: `?topic=${humps.decamelize(current)}`,
                    }}
                  >
                    See all
                  </Link>
                )}
              </li>
            );
          })}
        {country &&
          tTypes.map((type) => (
            <li key={type}>
              <div className="text">
                <div className="label">{topicNames(type)}</div>
              </div>
              <b>{selected?.[type] || 0}</b>
            </li>
          ))}
        <li className="no-hover">
          <div className="disclaimer">
            The boundaries and names shown, and the designations used on this
            map do not imply official endorsement or acceptance by the United
            Nations.
          </div>
        </li>
      </ul>
    </div>
  );
};

const MultiCountryInfo = () => {
  const renderContent = () => {
    return (
      <div className="popover-content-wrapper">
        <div className="popover-content-item">Niger</div>
        <div className="popover-content-item">Nigeria</div>
        <div className="popover-content-item">Senegal</div>
        <div className="popover-content-item">Ghana</div>
        <div className="popover-content-item">Rwanda</div>
      </div>
    );
  };
  return (
    <Popover placement="right" title={""} content={renderContent}>
      <InfoCircleOutlined />
    </Popover>
  );
};

const TopicItem = ({ topic }) => {
  const fullName = (data) =>
    data.title
      ? `${data.title} ${data.firstName} ${data.lastName}`
      : `${data.firstName} ${data.lastName}`;
  const title =
    (topic.topicType === "stakeholder" && fullName(topic)) ||
    topic.title ||
    topic.name;
  return (
    <div className="topic-item">
      <div className="inner">
        <span className="type">latest {topicNames(topic.topicType)}</span>
        <h2>{title}</h2>
        {/*topic.description && <p>{topic.description}</p>*/}
        <div className="bottom">
          <Link to={`/${topic.topicType}/${topic.id}`}>
            <Button type="link">Find out more</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default withRouter(MapLanding);
