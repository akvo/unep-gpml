import React, { Fragment, useEffect, useState } from "react";
import classNames from "classnames";
import { CSSTransition } from "react-transition-group";
import api from "../../utils/api";
import FilterBar from "./filter-bar";
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
import { useParams, useLocation, withRouter } from "react-router-dom";

const resourceTopic = [
  "action_plan",
  "project",
  "policy",
  "technical_resource",
  "technology",
  "event",
  "financing_resource",
];

function ResourceView({ history, popularTags, landing, box }) {
  const query = useQuery();
  const [isAscending, setIsAscending] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [countData, setCountData] = useState([]);
  const [filterCountries, setFilterCountries] = useState([]);
  const [multiCountryCountries, setMultiCountryCountries] = useState([]);
  const [catData, setCatData] = useState([]);
  const [gridItems, setGridItems] = useState([]);
  const [pageNumber, setPageNumber] = useState(false);
  const { type, view } = useParams();
  const { pathname, search } = useLocation();
  const [showFilterModal, setShowFilterModal] = useState(false);

  const limit = 30;
  const totalItems = resourceTopic.reduce(
    (acc, topic) =>
      acc + (countData?.find((it) => it.topic === topic)?.count || 0),
    0
  );

  const fetchData = (searchParams) => {
    setLoading(true);
    const queryParams = new URLSearchParams(searchParams);
    if (type || history?.location?.state?.type)
      queryParams.set(
        "topic",
        history?.location?.state?.type
          ? history?.location?.state?.type.replace(/-/g, "_")
          : type.replace(/-/g, "_")
      );
    queryParams.set("incCountsForTags", popularTags);
    queryParams.set("limit", limit);

    const url = `/browse?${String(queryParams)}`;
    api
      .get(url)
      .then((resp) => {
        setLoading(false);
        setData(resp?.data);
        setCountData(resp?.data?.counts);
        setGridItems((prevItems) => {
          return [...new Set([...prevItems, ...resp?.data?.results])];
        });
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const updateQuery = (param, value, reset) => {
    if (!reset) setGridItems([]);
    const newQuery = { ...query };
    newQuery[param] = value;
    // Remove empty query
    const arrayOfQuery = Object.entries(newQuery)?.filter(
      (item) => item[1]?.length !== 0 && typeof item[1] !== "undefined"
    );

    const pureQuery = Object.fromEntries(arrayOfQuery);

    const newParams = new URLSearchParams(pureQuery);

    newParams.delete("offset");

    if (param === "replace")
      history.replace({
        pathname: pathname,
        search: newParams.toString(),
        state: { type: type },
      });
    else
      history.push({
        pathname: pathname,
        search: newParams.toString(),
        state: { type: type },
      });

    fetchData(pureQuery);

    if (param === "country") {
      setFilterCountries(value);
    }
  };

  useEffect(() => {
    return history.listen((location) => {
      if (history.action === "PUSH") {
        console.log("push");
      }

      if (history.action === "POP") {
        if (view === "grid") setGridItems([]);
        updateQuery();
      }
    });
  }, []);

  const loadAllCat = async (sort) => {
    setLoading(true);
    const promiseArray = resourceTopic.map((url) =>
      api.get(
        `/browse?topic=${url}${
          sort
            ? `&descending=${sort}&orderBy=title`
            : sort === false
            ? `&descending=${"false"}&orderBy=title`
            : ""
        }`
      )
    );

    Promise.all(promiseArray)
      .then((data) => {
        const newData = resourceTopic.map((categories, idx) => ({
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

  useEffect(() => {
    if (pathname) updateQuery("replace");
  }, [pathname]);

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

  const handleCategoryFilter = (key) => {
    // if (view === "category") setView("grid");
    if (query?.topic?.includes(key)) {
      updateQuery(
        "topic",
        query?.topic?.filter((it) => it !== key),
        true
      );
    } else {
      updateQuery("topic", key, true);
    }
  };

  return (
    <Fragment>
      <FilterBar
        {...{
          history,
          type,
          view,
          fetchData,
          setFilterCountries,
          setMultiCountryCountries,
          multiCountryCountries,
          updateQuery,
          search,
          setShowFilterModal,
        }}
      />
      <div className="list-content">
        <div className="list-toolbar">
          <div className="quick-search">
            <div className="count">
              {view === "grid"
                ? `Showing ${gridItems?.length} of ${totalItems}`
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
          <ViewSwitch {...{ type, view, history }} />
          <button className="sort-by-button">
            <SortIcon
              style={{
                transform:
                  !isAscending || isAscending === null
                    ? "initial"
                    : "rotate(180deg)",
              }}
            />
            <div className="sort-button-text">
              <span>Sort by:</span>
              <b>{!isAscending ? `A>Z` : "Z>A"}</b>
            </div>
          </button>
        </div>
        {loading && (
          <div className="loading">
            <LoadingOutlined spin />
          </div>
        )}
        {(view === "map" || view === "topic") && (
          <div style={{ overflowX: "hidden" }}>
            <ResourceCards
              items={data?.results}
              showMoreCardAfter={20}
              showMoreCardClick={() => {
                // setView("grid");
              }}
            />
          </div>
        )}
        {view === "map" && (
          <Maps
            box={box}
            countData={countData || []}
            clickEvents={clickCountry}
            isFilteredCountry={filterCountries}
            data={landing?.map || []}
            countryGroupCounts={landing?.countryGroupCounts || []}
            isLoaded={() => true}
            multiCountryCountries={multiCountryCountries}
            useVerticalLegend
            showLegend={true}
            path="knowledge"
          />
        )}
        {!loading && view === "topic" && (
          <div className="topic-view-container">
            <TopicView
              results={data?.results}
              fetch={true}
              loading={loading}
              countData={countData.filter(
                (count) => count.topic !== "gpml_member_entities"
              )}
            />
          </div>
        )}
        {view === "grid" && (
          <GridView
            {...{
              gridItems,
              totalItems,
              limit,
              loading,
              setPageNumber,
              pageNumber,
              updateQuery,
            }}
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
                  <Button
                    type="link"
                    block
                    onClick={() => {
                      // setView("grid");
                      handleCategoryFilter(d.categories);
                    }}
                  >
                    See all {`>`}
                  </Button>
                </div>
                <ResourceCards
                  items={d?.data}
                  showMoreCardAfter={20}
                  showMoreCardClick={() => {
                    // setView("grid");
                    handleCategoryFilter(d.categories);
                  }}
                />
              </Fragment>
            ))}
          </div>
        )}
      </div>
      <FilterModal
        {...{
          query,
          setShowFilterModal,
          showFilterModal,
          updateQuery,
          fetchData,
          filterCountries,
          pathname,
          history,
          setGridItems,
        }}
      />
    </Fragment>
  );
}

const GridView = ({
  gridItems,
  loading,
  updateQuery,
  totalItems,
  limit,
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
            setPageNumber((prevNumber) => prevNumber + limit);
            updateQuery("offset", [pageNumber + limit], true);
          }}
        >
          Load More
        </Button>
      )}
    </div>
  );
};

const ViewSwitch = ({ type, view, history }) => {
  const viewOptions = ["map", "topic", "grid", "category"];
  const [visible, setVisible] = useState(false);

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
                <li
                  key={viewOption}
                  onClick={() => {
                    setVisible(!visible);
                    history.push(
                      `/knowledge/lib/resource/${viewOption}/${
                        type ? type : ""
                      }`
                    );
                  }}
                >
                  {viewOption} view
                </li>
              ))}
          </ul>
        </div>
      </CSSTransition>
    </div>
  );
};

export default withRouter(ResourceView);
