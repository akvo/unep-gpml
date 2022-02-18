import React from "react";
import Maps from "../map/Map";
import { UIStore } from "../../store";
import { useQuery } from "./common";

const MapView = () => {
  const { landing, countries } = UIStore.useState((s) => ({
    landing: s.landing,
    countries: s.countries,
  }));
  const query = useQuery();
  const box = document.getElementsByClassName("stakeholder-overview");

  return (
    <Maps
      box={box}
      clickEvents={() => null}
      country={[]}
      multiCountries={[]}
      listVisible={[]}
      isDisplayedList={[]}
      isFilteredCountry={[]}
      curr={() => null}
      dataToDisplay={[]}
      data={landing?.map || []}
      topic={query?.topic}
    />
  );
};

export default MapView;
