import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import FilterBar from "./filter-bar";
import "./style.scss";
import FilterModal from "./filter-modal";
import ResourceCards from "../../components/resource-cards/resource-cards";
import { ArrowRightOutlined } from "@ant-design/icons";

import Maps from "../map/map";
import { UIStore } from "../../store";
import { isEmpty } from "lodash";
import { useQuery } from "../../utils/misc";

const KnowledgeLib = () => {
  const { countries, organisations, landing } = UIStore.useState((s) => ({
    countries: s.countries,
    organisations: s.organisations,
    landing: s.landing,
  }));

  const box = document.getElementsByClassName("knowledge-lib");
  const query = useQuery();
  const [view, setView] = useState("map"); // to be changed to 'overview' later
  const [isAscending, setIsAscending] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterCountries, setFilterCountries] = useState([]);
  const [filter, setFilter] = useState([]);
  const [countData, setCountData] = useState([]);
  const [data, setData] = useState({});
  const [isShownModal, setIsShownModal] = useState(false);

  const fetchData = (params) => {
    api
      .get("/browse", { page_size: 30, page_n: 0, ...params })
      .then((resp) => {
        setData(resp.data);
        setCountData(resp?.data?.counts);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData({
      ...(filterCountries.length > 0 && {
        country: filterCountries.toString(),
      }),
    });
  }, [filterCountries]);

  useEffect(() => {
    api.get(`/landing?entityGroup=topic`).then((resp) => {
      UIStore.update((e) => {
        e.landing = resp.data;
      });
    });
  }, []);

  const clickCountry = (value) => {
    let updateVal = [];
    if (isEmpty(filterCountries)) {
      updateVal = [value];
    } else if (filterCountries.includes(value)) {
      updateVal = filterCountries.filter((x) => x !== value);
    } else {
      updateVal = [...filterCountries, value];
    }
    setFilterCountries(updateVal);
  };

  return (
    <div id="knowledge-lib" className="knowledge-lib">
      <FilterBar
        {...{
          view,
          setView,
          filterCountries,
          setFilterCountries,
          filter,
          setFilter,
          setIsShownModal,
        }}
      />
      {view === "map" && (
        <ResourceCards
          items={data?.results}
          showMoreCardAfter={20}
          showMoreCardClick={() => {
            setView("grid");
          }}
        />
      )}
      {view === "grid" && <div className="grid">grid here</div>}
      {view === "map" && (
        <Maps
          box={box}
          query={query}
          countData={countData}
          clickEvents={clickCountry}
          stakeholderCount={[]}
          listVisible={[]}
          isDisplayedList={[]}
          dataToDisplay={[]}
          isFilteredCountry={filterCountries}
          data={landing?.map || []}
          countryGroupCounts={landing?.countryGroupCounts || []}
          isLoaded={() => true}
          multiCountryCountries={[]}
          multiCountries={[]}
          useVerticalLegend
        />
      )}
      <FilterModal {...{ setIsShownModal, isShownModal }} />
    </div>
  );
};

export default KnowledgeLib;
