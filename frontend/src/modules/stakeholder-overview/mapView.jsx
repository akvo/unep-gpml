import React from "react";
import Maps from "../map/Map";
import { LoadingOutlined } from "@ant-design/icons";
import { UIStore } from "../../store";
import isEmpty from "lodash/isEmpty";
import { useQuery } from "./common";

const MapView = () => {
  const { landing, countries } = UIStore.useState((s) => ({
    landing: s.landing,
    countries: s.countries,
  }));
  const query = useQuery();
  const box = document.getElementsByClassName("stakeholder-overview");
  const isLoaded = () => isEmpty(landing?.map);

  return (
    <div id="map-landing">
      <div className="landing-container map-container">
        {isLoaded() && (
          <h2 className="loading" id="map-loader">
            <LoadingOutlined spin /> Loading
          </h2>
        )}

        <Maps
          box={box}
          clickEvents={() => null}
          country={[]}
          multiCountries={[]}
          listVisible={[]}
          isDisplayedList={[]}
          isFilteredCountry={[]}
          // needed props
          curr={() => null}
          dataToDisplay={[]}
          // isFilteredCountry={isFilteredCountry}
          // isDisplayedList={isDisplayedList}
          // listVisible={listVisible}
          data={landing?.map || []}
          // clickEvents={clickCountry}
          topic={query?.topic}
          // country={countries.find((x) => x.id === country)}
        />
      </div>
    </div>
  );
};

export default MapView;
