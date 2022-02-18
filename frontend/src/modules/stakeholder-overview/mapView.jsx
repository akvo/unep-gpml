import React from "react";
import Maps from "../map/Map";
import { UIStore } from "../../store";
import { useQuery } from "./common";
import { isEmpty } from "lodash";

const MapView = () => {
  const { landing } = UIStore.useState((s) => ({
    landing: s.landing,
    countries: s.countries,
  }));
  const query = useQuery();
  const box = document.getElementsByClassName("stakeholder-overview");
  const isLoaded = () => !isEmpty(landing?.map);
  return (
    <Maps
      box={box}
      clickEvents={() => null}
      country={[]}
      multiCountries={[]}
      listVisible={[]}
      isDisplayedList={[]}
      isFilteredCountry={[]}
      dataToDisplay={[]}
      data={landing?.map || []}
      topic={query?.topic}
      isLoaded={isLoaded}
    />
  );
};

export default MapView;
