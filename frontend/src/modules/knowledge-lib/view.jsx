import React, { Fragment, useEffect, useState } from "react";
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
  DownOutlined,
} from "@ant-design/icons";
import { ReactComponent as SortIcon } from "../../images/knowledge-library/sort-icon.svg";
import { ReactComponent as GlobeIcon } from "../../images/transnational.svg";
import { ReactComponent as SearchIcon } from "../../images/search-icon.svg";
import { Button } from "antd";
import Maps from "../map/map";
import { UIStore } from "../../store";
import { isEmpty } from "lodash";
import { useQuery, topicNames } from "../../utils/misc";

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
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterCountries, setFilterCountries] = useState([]);
  const [filter, setFilter] = useState([]);
  const [countData, setCountData] = useState([]);
  const [categories, setCategories] = useState([
    "project",
    "action_plan",
    "policy",
    "technical_resource",
    "technology",
    "event",
    "financing_resource",
  ]);
  const [catData, setCatData] = useState([]);
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

  const loadAllCat = async () => {
    const promiseArray = categories.map((url) =>
      api.get(`/browse?topic=${url}`)
    );

    Promise.all(promiseArray)
      .then((data) => {
        const newData = categories.map((categories, idx) => ({
          categories,
          data: data[idx].data.results,
        }));
        setCatData(newData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (view === "topic" && catData.length === 0) {
      loadAllCat();
    }
  }, [view, catData]);

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
          <div className="view-button-container">
            <div className="dropdown">
              <div className="dropdown__value">
                <DownOutlined />
                {view} View
              </div>
              <div className="dropdown__option-box">
                <div
                  className="dropdown__option-box__item"
                  onClick={() => setView("map")}
                >
                  <div>MAP VIEW </div>
                  <GlobeIcon />
                </div>
                <div
                  className="dropdown__option-box__item"
                  onClick={() => setView("topic")}
                >
                  <div>TOPIC VIEW </div>
                  <GlobeIcon />
                </div>
                <div
                  className="dropdown__option-box__item"
                  onClick={() => setView("grid")}
                >
                  <div>GRID VIEW </div>
                  <GlobeIcon />
                </div>
                <div
                  className="dropdown__option-box__item"
                  onClick={() => setView("graph")}
                >
                  <div>KNOWLEDGE GRAPH VIEW</div>
                  <GlobeIcon />
                </div>
              </div>
            </div>
          </div>
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
      {view === "topic" && (
        <div className="cat-view">
          {catData.map((d) => (
            <Fragment key={d.categories}>
              <div className="header-wrapper">
                <div className="title-wrapper">
                  <h4 className="cat-title">{topicNames(d.categories)}</h4>
                  <div className="quick-search">
                    <div className="count">{d?.data.length}</div>
                    <div className="search-icon">
                      <SearchIcon />
                    </div>
                  </div>
                </div>
                <Button type="link" block>
                  See all {`>`}
                </Button>
              </div>
              <ResourceCards
                items={d?.data}
                showMoreCardAfter={20}
                showMoreCardClick={() => {
                  setView("grid");
                }}
              />
            </Fragment>
          ))}
        </div>
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
