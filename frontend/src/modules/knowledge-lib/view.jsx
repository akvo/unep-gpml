import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import FilterBar from "./filter-bar";
import "./style.scss";
import FilterModal from "./filter-modal";
import ResourceCards, {
  ResourceCard,
} from "../../components/resource-cards/resource-cards";
import {
  AppstoreOutlined,
  ArrowRightOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { ReactComponent as SortIcon } from "../../images/knowledge-library/sort-icon.svg";
import { ReactComponent as GlobeIcon } from "../../images/transnational.svg";

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
  const [moreFilter, setMoreFilters] = useState({
    subContentType: null,
    tag: null,
    entity: null,
    representativeGroup: null,
    startDate: null,
    endDate: null,
  });

  const fetchData = (params) => {
    setLoading(true);
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
    fetchData();
  }, []);

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
    fetchData({
      ...moreFilter,
      ...(moreFilter.entity && {
        entity: moreFilter.entity.toString(),
      }),
      ...(moreFilter.subContentType && {
        subContentType: moreFilter.subContentType.toString(),
      }),
      ...(moreFilter.tag && {
        tag: moreFilter.tag.toString(),
      }),
      ...(moreFilter.representativeGroup && {
        representativeGroup: moreFilter.representativeGroup.toString(),
      }),
      ...(updateVal.length > 0 && {
        country: updateVal.toString(),
      }),
    });
    setFilterCountries(updateVal);
  };

  const handleFilter = (param, value) => {
    setMoreFilters({
      ...moreFilter,
      [param]: value ? value : null,
    });
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
          fetchData,
          moreFilter,
        }}
      />
      <div className="list-content">
        <div className="list-toolbar">
          <div className="page-label">Total {data?.results?.length}</div>
          <button
            className="view-button"
            shape="round"
            size="large"
            onClick={() => {
              view === "map" ? setView("grid") : setView("map");
            }}
          >
            <div className="view-button-text ">
              Switch to {`${view === "map" ? "grid" : "map"}`} view
            </div>
            {view === "map" ? <AppstoreOutlined /> : <GlobeIcon />}
          </button>
          <button
            className="sort-by-button"
            // onClick={() => sortExperts(!isAscending)}
          >
            <SortIcon
              style={{
                transform:
                  isAscending || isAscending === null
                    ? "initial"
                    : "rotate(180deg)",
              }}
            />
            <div className="sort-button-text">
              <span>Sort by:</span>
              <b>{isAscending ? `A>Z` : "Z>A"}</b>
            </div>
          </button>
        </div>
        {loading && (
          <div className="loading">
            <LoadingOutlined spin />
          </div>
        )}
        {view === "map" && (
          <ResourceCards
            items={data?.results}
            showMoreCardAfter={20}
            showMoreCardClick={() => {
              setView("grid");
            }}
          />
        )}
      </div>
      {view === "grid" && <GridView data={data} />}
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
      <FilterModal
        {...{
          setIsShownModal,
          isShownModal,
          moreFilter,
          handleFilter,
          fetchData,
          filterCountries,
        }}
      />
    </div>
  );
};

const GridView = ({ data, loading }) => {
  return (
    <div className="grid-view">
      <div className="items">
        {data?.results?.map((item) => (
          <ResourceCard item={item} />
        ))}
      </div>
    </div>
  );
};

export default KnowledgeLib;
