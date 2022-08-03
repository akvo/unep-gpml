import React, { Fragment, useEffect, useState } from "react";
import api from "../../utils/api";
import FilterBar from "./filter-bar";
import "./style.scss";
import FilterModal from "./filter-modal";
import ResourceCards, {
  ResourceCard,
} from "../../components/resource-cards/resource-cards";
import { LoadingOutlined, DownOutlined } from "@ant-design/icons";
import { ReactComponent as SortIcon } from "../../images/knowledge-library/sort-icon.svg";
import { ReactComponent as GlobeIcon } from "../../images/transnational.svg";
import { ReactComponent as TopicIcon } from "../../images/topic-view.svg";
import { ReactComponent as GridIcon } from "../../images/grid-view.svg";
import { ReactComponent as GraphIcon } from "../../images/graph-view.svg";
import { ReactComponent as SearchIcon } from "../../images/search-icon.svg";
import { Button } from "antd";
import Maps from "../map/map";
import { UIStore } from "../../store";
import { isEmpty } from "lodash";
import { useHistory } from "react-router-dom";
import { useQuery, topicNames } from "../../utils/misc";
import TopicView from "./topic-view";
const popularTags = [
  "plastics",
  "waste management",
  "marine litter",
  "capacity building",
  "product by design",
  "source to sea",
];

const KnowledgeLib = () => {
  const { landing } = UIStore.useState((s) => ({
    landing: s.landing,
  }));

  const box = document.getElementsByClassName("knowledge-lib");
  const history = useHistory();
  const query = useQuery();
  const [view, setView] = useState("map"); // to be changed to 'overview' later
  const [isAscending, setIsAscending] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterCountries, setFilterCountries] = useState([]);
  const [filter, setFilter] = useState([]);
  const [countData, setCountData] = useState([]);
  const [multiCountryCountries, setMultiCountryCountries] = useState([]);
  const categories = [
    "project",
    "action_plan",
    "policy",
    "technical_resource",
    "technology",
    "event",
    "financing_resource",
  ];
  const [catData, setCatData] = useState([]);
  const [data, setData] = useState([]);
  const [isShownModal, setIsShownModal] = useState(false);

  const fetchData = (query) => {
    setLoading(true);
    const searchParms = new URLSearchParams(window.location.search);
    searchParms.set("limit", 30);
    const topic = [
      "action_plan",
      "project",
      "policy",
      "technical_resource",
      "technology",
      "event",
      "financing_resource",
    ];

    const popularTags = [
      "plastics",
      "waste management",
      "marine litter",
      "capacity building",
      "product by design",
      "source to sea",
    ];

    searchParms.set("incCountsForTags", popularTags);

    if (query?.topic?.length === 0) {
      if (
        (query?.startDate && query?.startDate?.length !== 0) ||
        (query?.endDate && query?.endDate?.length !== 0)
      ) {
        searchParms.set("topic", "event");
      } else if (
        query?.hasOwnProperty("favorites") &&
        query?.favorites === true
      ) {
        searchParms.set("topic", []);
      } else {
        searchParms.set("topic", topic);
      }
    }
    const url = `/browse?${String(searchParms)}`;
    api
      .get(url)
      .then((resp) => {
        setData(resp?.data);
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

  const updateQuery = (param, value, fetch) => {
    const topScroll = window.innerWidth < 640 ? 996 : 207;
    window.scrollTo({
      top: window.pageYOffset < topScroll ? window.pageYOffset : topScroll,
    });
    {
      view !== "category" && setLoading(true);
    }
    const newQuery = { ...query };
    newQuery[param] = value;

    if (param !== "offset") {
      newQuery["offset"] = 0;
    }

    // Remove empty query
    const arrayOfQuery = Object.entries(newQuery)?.filter(
      (item) => item[1]?.length !== 0
    );

    const pureQuery = Object.fromEntries(arrayOfQuery);
    // setFilter(pureQuery);

    const newParams = new URLSearchParams(pureQuery);

    history.push(`/knowledge/lib?${newParams.toString()}`);

    if (fetch && view !== "category") {
      fetchData(pureQuery);
    }

    if (param === "country") {
      setFilterCountries(value);
    }
  };

  const clickCountry = (name) => {
    const val = query["country"];
    let updateVal = [];

    if (isEmpty(val)) {
      updateVal = [name];
    } else if (val.includes(name)) {
      updateVal = val.filter((x) => x !== name);
    } else {
      updateVal = [...val, name];
    }
    updateQuery("country", updateVal, true);
  };

  const loadAllCat = async () => {
    setLoading(true);
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
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (view === "category" && catData.length === 0) {
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
          updateQuery,
          multiCountryCountries,
          setMultiCountryCountries,
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
                  {/* <GlobeIcon width={32} /> */}
                </div>
                <div
                  className="dropdown__option-box__item"
                  onClick={() => setView("topic")}
                >
                  <div>TOPIC VIEW </div>
                  {/* <TopicIcon width={30} height={30} /> */}
                </div>
                <div
                  className="dropdown__option-box__item"
                  onClick={() => setView("grid")}
                >
                  <div>GRID VIEW </div>
                  {/* <GridIcon width={30} height={30} /> */}
                </div>
                <div
                  className="dropdown__option-box__item"
                  onClick={() => setView("category")}
                >
                  <div>CATEGORY VIEW</div>
                  {/* <GraphIcon width={30} height={30} /> */}
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
        {(view === "map" || view === "topic") && (
          <ResourceCards
            items={data?.results}
            showMoreCardAfter={20}
            showMoreCardClick={() => {
              setView("grid");
            }}
          />
        )}
        {view === "topic" && (
          <div className="topic-view-container">
            <TopicView
              {...{ updateQuery, query }}
              results={data?.results}
              fetch={true}
              countData={countData.filter(
                (count) => count.topic !== "gpml_member_entities"
              )}
            />
          </div>
        )}
      </div>
      {loading && (
        <div className="loading">
          <LoadingOutlined spin />
        </div>
      )}
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
          multiCountryCountries={multiCountryCountries}
          multiCountries={[]}
          useVerticalLegend
        />
      )}
      {view === "category" && (
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
          query,
          setIsShownModal,
          isShownModal,
          updateQuery,
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
