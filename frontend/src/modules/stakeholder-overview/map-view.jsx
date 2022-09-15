import React, { useEffect, useState } from "react";
import { UIStore } from "../../store";
import { useQuery } from "./common";
import { isEmpty } from "lodash";
import api from "../../utils/api";
import Maps from "../map/map";

const MapView = ({
  multiCountryCountries,
  updateQuery,
  isFilteredCountry,
  stakeholderCount,
  landingQuery,
}) => {
  const { landing, countries } = UIStore.useState((s) => ({
    landing: s.landing,
    countries: s.countries,
  }));

  const query = useQuery();

  const box = document.getElementsByClassName("stakeholder-overview");
  const isLoaded = () => !isEmpty(landing?.map);
  const [multiCountry, setMultiCountry] = useState(null);
  const clickCountry = (name) => {
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
    api.get(`/landing?entityGroup=community&${landingQuery}`).then((resp) => {
      UIStore.update((e) => {
        e.landing = resp.data;
      });
    });
  }, [landingQuery]);

  return (
    <Maps
      box={box}
      query={query}
      clickEvents={clickCountry}
      stakeholderCount={stakeholderCount}
      listVisible={[]}
      isDisplayedList={[]}
      dataToDisplay={[]}
      isFilteredCountry={isFilteredCountry}
      data={landing?.map || []}
      countryGroupCounts={landing?.countryGroupCounts || []}
      isLoaded={isLoaded}
      multiCountryCountries={multiCountryCountries}
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
      showLegend={true}
      path="community"
    />
  );
};

export default MapView;
