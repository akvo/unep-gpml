import React from "react";
import Maps from "../map/Map";
import { tTypes, topicNames } from "../../utils/misc";
import { UIStore } from "../../store";

const MapView = () => {
  const { landing, nav } = UIStore.useState((s) => ({
    landing: s?.landing,
    nav: s?.nav,
  }));
  const box = document.getElementsByClassName("stakeholder-overview");
console.log(landing, UIStore);
  const contentToDisplay = (dataToDisplay) => {
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
        // data={landing?.map}
        data={[]}
        topic={[]}
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
        contentToDisplay={contentToDisplay}
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
