import React, { Fragment, useEffect, useState, useMemo } from "react";
import classNames from "classnames";
import { CSSTransition } from "react-transition-group";
import api from "../../utils/api";
import FilterBar from "./filter-bar";
import { resourceTypes } from "./filter-bar";
import FilterModal from "./filter-modal";
import ResourceCards, {
  ResourceCard,
} from "../../components/resource-cards/resource-cards";
import { LoadingOutlined, DownOutlined } from "@ant-design/icons";
import SortIcon from "../../images/knowledge-library/sort-icon.svg";
import SearchIcon from "../../images/search-icon.svg";
import { Button } from "antd";
import Maps from "../map/map";
import { isEmpty } from "lodash";
import { useQuery, topicNames } from "../../utils/misc";
import TopicView from "./topic-view";

const resourceTopic = [
  "action_plan",
  "initiative",
  "policy",
  "technical_resource",
  "technology",
  "event",
  "financing_resource",
];

function ResourceView({ history, popularTags, landing, box, showModal }) {
  const query = useQuery();

  const [isAscending, setIsAscending] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [countData, setCountData] = useState([]);
  const [totalCount, setTotalCount] = useState([]);
  const [filterCountries, setFilterCountries] = useState([]);
  const [multiCountryCountries, setMultiCountryCountries] = useState([]);
  const [catData, setCatData] = useState([]);
  const [gridItems, setGridItems] = useState([]);
  const [pageNumber, setPageNumber] = useState(false);
  const [view, type] = history.query.slug || [];
  const { slug, ...queryParams } = history.query;
  const { pathname } = history;
  const search = new URLSearchParams(history.query).toString();
  console.log(history.query.slug);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const limit = 30;
  const totalItems = resourceTopic.reduce(
    (acc, topic) =>
      acc + (countData?.find((it) => it.topic === topic)?.count || 0),
    0
  );

  const allResources = totalCount
    ?.filter((array) =>
      resourceTypes.some(
        (filter) =>
          array.topic === filter.title && filter.title !== "capacity building"
      )
    )
    ?.reduce(function (acc, obj) {
      return acc + obj.count;
    }, 0);

  const uniqueArrayByKey = (array) => [
    ...new Map(array.map((item) => [item["id"], item])).values(),
  ];

  const fetchData = (searchParams) => {
    setLoading(true);
    const queryParams = new URLSearchParams(searchParams);
    console.log(queryParams);
    queryParams.delete("slug");

    if (type || history?.location?.state?.type)
      if (
        type === "capacity-building" ||
        history?.location?.state?.type === "capacity-building"
      ) {
        queryParams.set(
          "topic",
          history?.location?.state?.type
            ? history?.location?.state?.type.replace(/-/g, "_")
            : type.replace(/-/g, "_")
        );

        queryParams.set("capacity_building", ["true"]);
        queryParams.delete("topic");
      }
    queryParams.set("incCountsForTags", popularTags);
    queryParams.set("limit", limit);

    const url = `https://digital.gpmarinelitter.org/api/browse?${String(
      queryParams
    )}`;
    console.log(view, totalCount);
    api
      .get(url)
      .then((resp) => {
        setLoading(false);
        setData(resp?.data);
        if (totalCount.length === 0) {
          setTotalCount(resp?.data?.counts);
        }
        setCountData(resp?.data?.counts);
        setGridItems((prevItems) => {
          return uniqueArrayByKey([...prevItems, ...resp?.data?.results]);
        });
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const updateQuery = (param, value, reset, fetch = true) => {
    if (!reset) {
      setPageNumber(null);
      setGridItems([]);
    }
    const newQuery = { ...query };
    newQuery[param] = value;

    if (param === "descending" || query.hasOwnProperty("descending")) {
      newQuery["orderBy"] = "title";
    }

    if (newQuery.hasOwnProperty("country"))
      setFilterCountries(newQuery.country);

    // Remove empty query
    const arrayOfQuery = Object.entries(newQuery)?.filter(
      (item) => item[1]?.length !== 0 && typeof item[1] !== "undefined"
    );

    const pureQuery = Object.fromEntries(arrayOfQuery);

    const newParams = new URLSearchParams(pureQuery);

    newParams.delete("offset");
    const newQueryStr = newParams.toString();

    // if (param === "replace")
    //   router.replace(
    //     {
    //       pathname: router.pathname,
    //       query: newParams.toString(),
    //     },
    //     undefined,
    //     { shallow: true }
    //   );
    // else
    //   router.push({
    //     pathname: router.pathname,
    //     query: newParams.toString(),
    //   });

    if (fetch && view !== "category") fetchData(pureQuery);

    if (view === "category") loadAllCat(pureQuery);

    if (param === "country") {
      setFilterCountries(value);
    }
  };

  const loadAllCat = async (filter) => {
    setLoading(true);

    const queryParams = new URLSearchParams(filter);
    const promiseArray = resourceTopic.map((url) =>
      api.get(
        `https://digital.gpmarinelitter.org/api/browse?topic=${url}&${String(
          queryParams
        )}`
      )
    );

    Promise.all(promiseArray)
      .then((data) => {
        const newData = resourceTopic.map((categories, idx) => ({
          categories,
          data: data[idx].data.results,
          count: data[idx]?.data?.counts[0]?.count || 0,
        }));
        setCatData(newData);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useMemo(() => {
    // if ((pathname || search) && !loading) updateQuery("replace");
  }, [pathname, search]);

  useEffect(() => {
    if (data.length === 0) updateQuery();
  }, []);

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
    history.push({
      pathname: `/knowledge/library/${
        view ? (view === "category" ? "grid" : view) : "map"
      }/${key.replace(/_/g, "-")}/`,
      search: search,
      state: { type: key.replace(/-/g, "_") },
    });
  };

  const sortResults = (ascending) => {
    setPageNumber(null);
    if (!ascending) {
      updateQuery("descending", "false", true);
    } else {
      updateQuery("descending", "true", true);
    }
    setIsAscending(ascending);
  };

  return (
    <Fragment>
      <FilterBar
        {...{
          history,
          type,
          view,
          totalCount,
          fetchData,
          setFilterCountries,
          setMultiCountryCountries,
          multiCountryCountries,
          updateQuery,
          search,
          setShowFilterModal,
          setPageNumber,
          pathname,
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
                    (count, current) => count + current?.count,
                    0
                  )}`
                : `Showing ${!loading ? data?.results?.length : ""}`}
            </div>
            <div className="search-icon">
              <SearchIcon />
            </div>
          </div>
          <ViewSwitch {...{ type, view, history, queryParams }} />
          <button
            className="sort-by-button"
            onClick={() => {
              if (view === "grid") setGridItems([]);
              sortResults(!isAscending);
            }}
          >
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
        {(view === "map" || !view || view === "topic") && (
          <div style={{ position: "relative" }}>
            <ResourceCards
              items={data?.results}
              showMoreCardAfter={20}
              showMoreCardClick={() => {
                history.push({
                  pathname: `/knowledge/library/grid/${type ? type : ""}`,
                  search: history.location.search,
                });
              }}
              showModal={(e) =>
                showModal({
                  e,
                  type: e.currentTarget.type,
                  id: e.currentTarget.id,
                })
              }
            />
            {loading && (
              <div className="loading">
                <LoadingOutlined spin />
              </div>
            )}
          </div>
        )}
        {(view === "map" || !view) && (
          <Maps
            query={query}
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
              showModal,
            }}
          />
        )}

        {view === "category" && (
          <div className="cat-view">
            {loading && (
              <div className="loading">
                <LoadingOutlined spin />
              </div>
            )}
            {catData.map((d) => (
              <Fragment key={d.categories}>
                {d?.count > 0 && (
                  <>
                    <div className="header-wrapper">
                      <div className="title-wrapper">
                        <h4 className="cat-title">
                          {topicNames(d.categories)}
                        </h4>
                        <div className="quick-search">
                          <div className="count">{d?.count}</div>
                          <div className="search-icon">
                            <SearchIcon />
                          </div>
                        </div>
                      </div>
                      <Button
                        type="link"
                        block
                        onClick={() => {
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
                        handleCategoryFilter(d.categories);
                      }}
                      showModal={(e) =>
                        showModal({
                          e,
                          type: e.currentTarget.type,
                          id: e.currentTarget.id,
                        })
                      }
                    />
                  </>
                )}
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
          loadAllCat,
          view,
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
  showModal,
}) => {
  return (
    <div className="grid-view">
      <div className="items">
        {gridItems?.map((item, index) => (
          <ResourceCard
            item={item}
            key={item.id * index}
            showModal={(e) =>
              showModal({
                e,
                type: item?.type.replace("_", "-"),
                id: item?.id,
              })
            }
          />
        ))}
      </div>
      {!loading && gridItems?.length < totalItems && (
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

const ViewSwitch = ({ type, view, history, queryParams }) => {
  const viewOptions = ["map", "grid", "category"];
  const [visible, setVisible] = useState(false);
  view = !view ? "map" : view;

  console.log(history);

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
                    history.push({
                      pathname: `/knowledge/library/${viewOption}/${
                        type && viewOption !== "category" ? type : ""
                      }`,
                      query: queryParams,
                    });
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

export default ResourceView;
