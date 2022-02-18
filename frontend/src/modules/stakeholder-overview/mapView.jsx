import React from "react";
import Maps from "../map/Map";
import { tTypes, topicNames } from "../../utils/misc";
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
  const isLoaded = () => !isEmpty(landing?.map);

  const contentToDisplay = (data) => {
    
    const dataToDisplay = {
      initiative: data?.initiative,
      actionPlan: data?.actionPlan,
      policy: data?.policy,
      technicalResource: data?.technicalResource,
      financingResource: data?.financingResource,
      event: data?.event,
      technology: data?.technology,
    };

    return tTypes.map(
      (topic) =>
        topic !== "project" &&
        topic !== "policy" &&
        topic !== "actionPlan" &&
        topic !== "financingResource" &&
        topic !== "technicalResource" &&
        topic !== "technology" &&
        topic !== "event" && (
          <li key={topic}>
            <span>{topicNames(topic)}</span>
            <b>{dataToDisplay?.[topic] ? dataToDisplay[topic] : 0}</b>
          </li>
        )
    );
  };
  return (
    <div id="map-landing">
      <Maps
        box={box}
        // data={!isLoaded() ? landing?.map : []}
        // topic={[]}
        clickEvents={() => null}
        country={[]}
        multiCountries={[]}
        listVisible={[]}
        isDisplayedList={[]}
        isFilteredCountry={[]}
        // needed props
        values={[]}
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
  );
};

export default MapView;
// const dataToDisplay = {
//   initiative: data?.initiative,
//   actionPlan: data?.actionPlan,
//   policy: data?.policy,
//   technicalResource: data?.technicalResource,
//   financingResource: data?.financingResource,
//   event: data?.event,
//   technology: data?.technology,
// };
