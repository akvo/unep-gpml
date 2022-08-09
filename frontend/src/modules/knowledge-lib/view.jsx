import React, { Fragment, useEffect, useState } from "react";
import classNames from "classnames";
import { CSSTransition } from "react-transition-group";
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
import { Link, useHistory } from "react-router-dom";
import { useQuery, topicNames } from "../../utils/misc";
import TopicView from "./topic-view";
import Overview from "./overview";

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

const KnowledgeLib = () => {
  const { landing } = UIStore.useState((s) => ({
    landing: s.landing,
  }));

  const box = document.getElementsByClassName("knowledge-lib");
  const history = useHistory();
  const query = useQuery();
  const [view, setView] = useState(
    query.hasOwnProperty("view") ? query.view[0] : "map"
  ); // to be changed to 'overview' later
  const [isAscending, setIsAscending] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterCountries, setFilterCountries] = useState([]);
  const [filter, setFilter] = useState([]);
  const [countData, setCountData] = useState([]);
  const [initialCountData, setInitialCountData] = useState([]);
  const [multiCountryCountries, setMultiCountryCountries] = useState([]);
  const [catData, setCatData] = useState([]);
  const [data, setData] = useState([]);
  const [gridItems, setGridItems] = useState([]);
  const [isShownModal, setIsShownModal] = useState(false);
  const [pageNumber, setPageNumber] = useState(false);
  const limit = 30;
  const totalItems = topic.reduce(
    (acc, topic) =>
      acc + (countData?.find((it) => it.topic === topic)?.count || 0),
    0
  );

  const fetchData = (query, hideCount) => {
    setLoading(true);
    const searchParms = new URLSearchParams(
      view === "topic" || view === "grid" ? query : window.location.search
    );
    searchParms.set("limit", limit);

    searchParms.set("incCountsForTags", popularTags);

    searchParms.delete("view");

    const url = `/browse?${String(searchParms)}`;

    api
      .get(url)
      .then((resp) => {
        setLoading(false);
        setData(resp?.data);
        setGridItems((prevItems) => {
          return [...new Set([...prevItems, ...resp?.data?.results])];
        });
        if (
          data.length === 0 &&
          view === "topic" &&
          query.hasOwnProperty("tag")
        ) {
          searchParms.delete("tag");
          api.get(`/browse?${String(searchParms)}`).then((data) => {
            setCountData(data?.data?.counts);
          });
        }
        if (!hideCount) {
          setCountData(resp?.data?.counts);
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData(query);
  }, []);

  useEffect(() => {
    if (view) {
      const searchParms = new URLSearchParams(window.location.search);
      searchParms.set("view", view);
      history.push(`/knowledge/lib?${String(searchParms)}`);
    }
  }, [view]);

  useEffect(() => {
    api.get(`/landing?entityGroup=topic`).then((resp) => {
      UIStore.update((e) => {
        e.landing = resp.data;
      });
    });
  }, []);

  const updateQuery = (param, value, fetch, reset, hideCount) => {
    {
      view !== "category" && setLoading(true);
    }
    {
      !reset && setGridItems([]);
    }
    const newQuery = { ...query };
    newQuery[param] = value;

    // Remove empty query
    const arrayOfQuery = Object.entries(newQuery)?.filter(
      (item) => item[1]?.length !== 0
    );

    const pureQuery = Object.fromEntries(arrayOfQuery);
    // setFilter(pureQuery);

    const newParams = new URLSearchParams(pureQuery);
    newParams.delete("offset");

    history.push(`/knowledge/lib?${newParams.toString()}`);

    if (fetch && view !== "category") {
      fetchData(pureQuery, hideCount);
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
    const promiseArray = topic.map((url) => api.get(`/browse?topic=${url}`));

    Promise.all(promiseArray)
      .then((data) => {
        const newData = topic.map((categories, idx) => ({
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

  if (view === "overview") {
    return (
      <div id="knowledge-lib">
        <Overview
          summaryData={landing?.summary}
          {...{
            setView,
            updateQuery,
            box,
            query,
            countData,
            landing,
            data,
            loading,
          }}
        />
      </div>
    );
  }

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
          updateQuery,
          multiCountryCountries,
          setMultiCountryCountries,
        }}
      />
      <div className="list-content">
        <div className="list-toolbar">
          <div className="quick-search">
            <div className="count">
              {view === "grid"
                ? `Showing ${
                    !loading ? gridItems?.length : ""
                  } of ${totalItems}`
                : view === "category"
                ? `${catData?.reduce(
                    (count, current) => count + current?.data?.length,
                    0
                  )}`
                : `Showing ${!loading ? data?.results?.length : ""}`}
            </div>
            <div className="search-icon">
              <SearchIcon />
            </div>
          </div>
          <ViewSwitch {...{ view, setView }} />
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
              loading={loading}
              countData={countData.filter(
                (count) => count.topic !== "gpml_member_entities"
              )}
              initialCountData={initialCountData.filter(
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
      {view === "grid" && (
        <GridView
          {...{
            query,
            gridItems,
            updateQuery,
            totalItems,
            limit,
            loading,
            setPageNumber,
            pageNumber,
          }}
        />
      )}
      {view === "map" && (
        <Maps
          box={box}
          query={query}
          countData={countData}
          clickEvents={clickCountry}
          isFilteredCountry={filterCountries}
          data={landing?.map || []}
          countryGroupCounts={landing?.countryGroupCounts || []}
          isLoaded={() => true}
          multiCountryCountries={multiCountryCountries}
          useVerticalLegend
          showLegend={true}
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

const GridView = ({
  query,
  gridItems,
  loading,
  updateQuery,
  totalItems,
  setPageNumber,
  pageNumber,
}) => {
  return (
    <div className="grid-view">
      <div className="items">
        {gridItems?.map((item, index) => (
          <ResourceCard item={item} key={item.id * index} />
        ))}
      </div>
      {gridItems?.length < totalItems && (
        <Button
          className="load-more"
          loading={loading}
          onClick={() => {
            setPageNumber((prevNumber) => prevNumber + 30);
            updateQuery("offset", [pageNumber + 30], true, true);
          }}
        >
          Load More
        </Button>
      )}
    </div>
  );
};

const ViewSwitch = ({ view, setView }) => {
  const viewOptions = ["map", "topic", "grid", "category"];
  const [visible, setVisible] = useState(false);
  const handleChangeView = (viewOption) => () => {
    setView(viewOption);
    setVisible(false);
  };
  return (
    <div className="view-switch-container">
      <div
        className={classNames("switch-btn", { active: visible })}
        onClick={() => {
          setVisible(!visible);
        }}
      >
        <DownOutlined />
        {view} view
      </div>
      <CSSTransition
        in={visible}
        timeout={200}
        unmountOnExit
        classNames="view-switch"
      >
        <div className="view-switch-dropdown">
          <ul>
            {viewOptions
              .filter((opt) => view !== opt)
              .map((viewOption) => (
                <li key={viewOption} onClick={handleChangeView(viewOption)}>
                  {viewOption} view
                </li>
              ))}
          </ul>
        </div>
      </CSSTransition>
    </div>
  );
};

export default KnowledgeLib;
