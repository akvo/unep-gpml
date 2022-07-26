import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import FilterBar from "./filter-bar";
import "./style.scss";
import FilterModal from "./filter-modal";
import ResourceCards from "../../components/resource-cards/resource-cards";
import { ArrowRightOutlined } from "@ant-design/icons";

const KnowledgeLib = () => {
  const [view, setView] = useState("map"); // to be changed to 'overview' later
  const [isAscending, setIsAscending] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterCountries, setFilterCountries] = useState([]);
  const [filter, setFilter] = useState([]);
  const [data, setData] = useState({});
  const [isShownModal, setIsShownModal] = useState(false);

  const fetchData = (params) => {
    api
      .get("/browse", { page_size: 30, page_n: 0, ...params })
      .then((resp) => {
        setData(resp.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div id="knowledge-lib">
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
      {view === 'map' &&
        <ResourceCards
          items={data?.results}
          showMoreCardAfter={20}
          showMoreCardClick={() => { setView('grid') }}
        />
      }
      {view === 'grid' && (
        <div className="grid">
          grid here
        </div>
      )}
      <FilterModal {...{ setIsShownModal, isShownModal }} />
    </div>
  );
};

export default KnowledgeLib;
