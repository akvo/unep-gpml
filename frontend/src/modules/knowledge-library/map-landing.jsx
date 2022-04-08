import { UIStore } from "../../store";
import React, { useState, useEffect } from "react";
import { PageHeader } from "antd";
import { withRouter } from "react-router-dom";
import Maps from "../map/Map";

import api from "../../utils/api";
import isEmpty from "lodash/isEmpty";
import HideIcon from "../../images/knowledge-library/hide-icon.svg";

const MapLanding = ({
  query,
  countData,
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

  const [multiCountry, setMultiCountry] = useState(null);
  const box = document.getElementsByClassName("resource-list-container");
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
    <>
      {!isDisplayedList && (
        <div className="map-overlay">
          <PageHeader
            className="resource-list-header show-list"
            ghost={false}
            backIcon={
              <img src={HideIcon} className="hide-icon show" alt="show-icon" />
            }
            onBack={() => setListVisible(true)}
            title="Show List"
          />
        </div>
      )}
      <Maps
        {...{
          box,
          query,
          isFilteredCountry,
          isDisplayedList,
          listVisible,
          multiCountryCountries,
          countData,
        }}
        data={landing?.map || []}
        countryGroupCounts={landing?.countryGroupCounts || []}
        clickEvents={clickCountry}
        isLoaded={isLoaded}
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
        useVerticalLegend
      />
    </>
  );
};

export default withRouter(MapLanding);
