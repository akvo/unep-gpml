import { UIStore } from "../../store";
import React, { useState, useEffect } from "react";
import { Button, Switch } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { Link, withRouter } from "react-router-dom";
import Maps from "./maps";
import "./map-styles.scss";
import humps from "humps";
import { topicNames, tTypes, topicTypes } from "../../utils/misc";
import api from "../../utils/api";
import isEmpty from "lodash/isEmpty";
import sumBy from "lodash/sumBy";
import CountryTransnationalFilter from "./country-transnational-filter";

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
  multiCountryCountries,
  setMultiCountryCountries,
}) => {
  const {
    profile,
    countries,
    landing,
    nav,
    transnationalOptions,
  } = UIStore.useState((s) => ({
    profile: s.profile,
    countries: s.countries,
    landing: s.landing,
    nav: s.nav,
    transnationalOptions: s.transnationalOptions,
  }));
  const [country, setCountry] = useState(null);
  const [counts, setCounts] = useState("initiative");
  const [multiCountry, setMultiCountry] = useState(null);

  const isApprovedUser = profile?.reviewStatus === "APPROVED";
  const hasProfile = profile?.reviewStatus;

  const isLoaded = () =>
    !isEmpty(countries) &&
    !isEmpty(landing?.map) &&
    !isEmpty(transnationalOptions);

  const clickCountry = (name) => {
    setToggleButton("list");
    updateQuery("country", name);
    history.push(`/browse?country=${name}`);
  };

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

  const handleChangeTab = (key) => {
    key === "multi-country" ? setCountry(null) : setMultiCountry(null);
  };

  const handleChangeCountry = (id) => {
    setCountry(id);
  };

  const handleChangeMultiCountry = (id) => {
    if (id) {
      const check = multiCountryCountries.find((x) => x.id === id);
      !check &&
        api.get(`/country-group/${id}`).then((resp) => {
          setMultiCountryCountries([
            ...multiCountryCountries,
            { id: id, countries: resp.data?.[0]?.countries },
          ]);
        });
    }
    setMultiCountry(id);
  };

  useEffect(() => {
    api.get("/landing").then((resp) => {
      UIStore.update((e) => {
        e.landing = resp.data;
      });
    });
  }, []);

  useEffect(() => {
    filters && setFilters(null);
  }, [filters, setFilters]);

  const countryObj = country && countries.find((it) => it.id === country);
  const selectedCountry =
    countries && country
      ? landing?.map?.find((x) => x.countryId === country)
      : {};

  const findMultiCountriesData =
    multiCountry && !isEmpty(multiCountryCountries)
      ? multiCountryCountries
          .find((x) => x.id === multiCountry)
          ?.countries.map((country) =>
            landing?.map?.find((x) => x.countryId === country.id)
          )
      : [];

  const selectedMultiCountry =
    transnationalOptions && multiCountry && findMultiCountriesData
      ? Object.assign(
          {},
          ...tTypes.map((x) => ({
            [x]: sumBy(findMultiCountriesData, x) || 0,
          }))
        )
      : {};

  const selected = isEmpty(selectedCountry)
    ? selectedMultiCountry
    : selectedCountry;

  const resourceCounts = nav?.resourceCounts?.filter((it, index) => {
    const current = Object.keys(it)[0];
    return tTypes.indexOf(current) > -1;
  });

  return (
    <div id="map-landing">
      <div className="landing-container map-container">
        {!isLoaded() && (
          <h2 className="loading">
            <LoadingOutlined spin /> Loading
          </h2>
        )}
        {isLoaded() && (
          <div className="map-overlay">
            <CountryTransnationalFilter
              handleChangeTab={handleChangeTab}
              country={country}
              handleChangeCountry={handleChangeCountry}
              multiCountry={multiCountry}
              handleChangeMultiCountry={handleChangeMultiCountry}
              multiCountryCountries={multiCountryCountries}
            />
            <Summary
              clickEvents={handleSummaryClick}
              seeAllEvents={handleSeeAllStakeholderClick}
              isApprovedUser={isApprovedUser}
              summary={resourceCounts}
              country={countryObj}
              multiCountries={multiCountryCountries}
              counts={counts}
              selected={selected}
              init={counts}
              setToggleButton={setToggleButton}
              updateQuery={updateQuery}
            />
          </div>
        )}
        <Maps
          data={landing?.map || []}
          clickEvents={clickCountry}
          topic={counts}
          country={countries.find((x) => x.id === country)}
          multiCountries={
            multiCountry &&
            !isEmpty(multiCountryCountries) &&
            multiCountryCountries.find((x) => x.id === multiCountry)
              ? multiCountryCountries
                  .find((x) => x.id === multiCountry)
                  ?.countries.map((country) =>
                    countries.find((x) => x.id === country.id)
                  )
              : []
          }
        />
      </div>
    </div>
  );
};

const Summary = ({
  clickEvents,
  seeAllEvents,
  summary,
  country,
  multiCountries,
  counts,
  selected,
  init,
  isApprovedUser,
  setToggleButton,
  updateQuery,
}) => {
  summary = summary?.map((x) => ({
    ...x,
    name: Object.keys(x).find((k) => k !== "country"),
  }));
  summary = tTypes.map((x) => summary?.find((it) => it.name === x));
  const restricted = ["stakeholder", "organisation"];
  // Filter, do not show restricted
  summary = summary?.filter((x) => !restricted.includes(x.name));
  return (
    <div className="summary">
      <header>{isEmpty(selected) ? "Global summary" : "Summary"}</header>
      <ul>
        {isEmpty(selected) &&
          summary?.map((it, index) => {
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
        {!isEmpty(selected) &&
          topicTypes.map((type) => (
            <li key={type} className="summary-count-item">
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

export default withRouter(MapLanding);
