import { UIStore } from "../../store";
import React, { useState, useEffect } from "react";
import { Button, Select, Switch } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { Link, withRouter } from "react-router-dom";
import Maps from "./maps";
import "./styles.scss";
import humps from "humps";
import { topicNames, tTypes } from "../../utils/misc";

const Landing = ({
  history,
  data,
  setSignupModalVisible,
  setWarningModalVisible,
  isAuthenticated,
  loginWithPopup,
  updateDisclaimer,
  setFilters,
}) => {
  const { innerWidth, innerHeight } = window;
  const { profile, countries } = UIStore.currentState;
  const [country, setCountry] = useState(null);
  const [counts, setCounts] = useState("project");
  const [mapData, setMapData] = useState([]);

  const isApprovedUser = profile?.reviewStatus === "APPROVED";
  const hasProfile = profile?.reviewStatus;
  const clickCountry = (name) => {
    history.push(`/browse?country=${name}`);
  };

  const handleChangeCountry = (id) => {
    setCountry(id);
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
      return setSignupModalVisible(true);
    }
    return setWarningModalVisible(true);
  };

  const selected =
    countries && country
      ? data?.map?.find(
          (x) =>
            x.isoCode === countries.find((it) => it.id === country).territory
        )
      : {};

  const summaryData = data?.summary?.filter((it, index) => {
    const current = Object.keys(it)[0];
    return tTypes.indexOf(current) > -1;
  });

  useEffect(() => {
    setFilters(null);
    updateDisclaimer(window.location.pathname);
  }, [updateDisclaimer, setFilters]);

  return (
    <div id="landing">
      <div className="landing-container">
        <div className="landing-banner ui container">
          <h2>
            Welcome to the Global Partnership on Marine Litter Digital Platform!
          </h2>
          <p>
            The Digital Platform is an open-source, multi-stakeholder platform
            that compiles different resources, connects stakeholders and
            integrates data to guide action. The resources have been collected
            through research based on publicly available information, interviews
            with experts, and inputs received through submissions. They cover
            all stages in the plastics life cycle, with respect to prevention of
            litter and waste, design and production, use and consumption, waste
            management and marine litter monitoring and capturing. Explore the
            map below by clicking on a country, or filter by resource. You can
            learn more about each resource's source{" "}
            <a
              href="https://www.gpmarinelitter.org/what-we-do/gpml-digital-platform"
              target="_blank"
              rel="noreferrer"
            >
              here
            </a>
            .
          </p>
        </div>
      </div>
      <div className="landing-container map-container">
        {!data && (
          <h2 className="loading">
            <LoadingOutlined spin /> Loading Data
          </h2>
        )}
        {data && (
          <div className="map-overlay">
            <Select
              showSearch
              allowClear
              placeholder="Countries"
              options={countryOpts}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              value={country}
              onChange={handleChangeCountry}
              virtual={false}
            />
            <Summary
              clickEvents={handleSummaryClick}
              seeAllEvents={handleSeeAllStakeholderClick}
              isApprovedUser={isApprovedUser}
              summary={summaryData}
              country={countryObj}
              counts={counts}
              selected={selected}
              init={counts}
            />
          </div>
        )}
        {/* Dont render maps on mobile */}
        {innerWidth >= 768 && (
          <Maps
            data={data?.map || []}
            clickEvents={clickCountry}
            topic={counts}
            country={countries.find((x) => x.id === country)}
          />
        )}
      </div>
      <div className="topics">
        <div className="ui container">
          {data?.topics.map(
            (topic, index) =>
              (topic.topicType !== "stakeholder" || isApprovedUser) && (
                <TopicItem key={`topic-${index}`} {...{ topic }} />
              )
          )}
        </div>
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
}) => {
  summary = summary.map((x) => ({
    ...x,
    name: Object.keys(x).find((k) => k !== "country"),
  }));
  summary = tTypes.map((x) => summary.find((it) => it.name === x));
  const restricted = ["stakeholder", "organisation"];
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
                    to={{
                      pathname: "/browse",
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

export default withRouter(Landing);
