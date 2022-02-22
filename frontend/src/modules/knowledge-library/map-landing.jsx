import { UIStore } from "../../store";
import React, { useState, useEffect } from "react";
import { PageHeader } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { withRouter } from "react-router-dom";
import Maps from "./maps";
import "./map-styles.scss";

import api from "../../utils/api";
import isEmpty from "lodash/isEmpty";
import HideIcon from "../../images/knowledge-library/hide-icon.svg";

const MapLanding = ({
  query,
  multiCountryCountries,
  listVisible,
  isDisplayedList,
  isFilteredCountry,
  updateQuery,
  setToggleButton,
  setListVisible,
}) => {
  const { countries, landing, transnationalOptions } = UIStore.useState(
    (s) => ({
      profile: s.profile,
      countries: s.countries,
      landing: s.landing,
      nav: s.nav,
      transnationalOptions: s.transnationalOptions,
    })
  );
  const [country, setCountry] = useState(null);
  const [multiCountry, setMultiCountry] = useState(null);

  const isLoaded = () =>
    !isEmpty(countries) &&
    !isEmpty(landing?.map) &&
    !isEmpty(transnationalOptions);

  const clickCountry = (name) => {
    setToggleButton("list");
    const val = query["country"];
    let updateVal = [];
    if (isEmpty(val)) {
      updateVal = [name];
    } else if (val.includes(name)) {
      updateVal = val.filter((x) => x !== name);
    } else {
      updateVal = [...val, name];
    }
    updateQuery("country", updateVal);
  };

  useEffect(() => {
    api.get("/landing").then((resp) => {
      UIStore.update((e) => {
        e.landing = resp.data;
      });
    });
  }, []);

  return (
    <div id="map-landing">
      <div className="landing-container map-container">
        {!isLoaded() && (
          <h2 className="loading" id="map-loader">
            <LoadingOutlined spin /> Loading
          </h2>
        )}
        {!isDisplayedList && (
          <div className="map-overlay">
            <PageHeader
              className="resource-list-header show-list"
              ghost={false}
              backIcon={
                <img
                  src={HideIcon}
                  className="hide-icon show"
                  alt="show-icon"
                />
              }
              onBack={() => setListVisible(true)}
              title="Show List"
            />
          </div>
        )}
        <Maps
          isFilteredCountry={isFilteredCountry}
          isDisplayedList={isDisplayedList}
          listVisible={listVisible}
          data={landing?.map || []}
          clickEvents={clickCountry}
          topic={query?.topic}
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

export default withRouter(MapLanding);
