import React from "react";
import Maps from "../map/Map";

const MapView = () => {
  const box = document.getElementsByClassName("stakeholder-overview");
  console.log(box.length);
  return (
    <div id="map-landing">
      <Maps
        box={box}
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
        contentToDisplay={() => "NOTHING FOR NOW"}
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
