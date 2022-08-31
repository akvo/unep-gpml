import { UIStore } from "../../store";
import React, { useEffect, useState } from "react";
import { Card, Input, Checkbox, Tag, Pagination, Switch } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import StickyBox from "react-sticky-box";
import "./styles.scss";
import {
  topicTypes,
  topicTypesIncludingOrg,
  topicTypesApprovedUser,
  topicNames,
  resourceTypeToTopicType,
} from "../../utils/misc";
import { Link, useLocation, withRouter } from "react-router-dom";
import moment from "moment";
import api from "../../utils/api";
import ModalWarningUser from "../../utils/modal-warning-user";
import { useAuth0 } from "@auth0/auth0-react";
import humps from "humps";
import isEmpty from "lodash/isEmpty";
import { LoadingOutlined } from "@ant-design/icons";
import { TrimText } from "../../utils/string";
import MapLanding from "./map-landing";
import CountryTransnationalFilter from "./country-transnational-filter";
import { redirectError } from "../error/error-util";

export const useQuery = () => {
  const srcParams = new URLSearchParams(useLocation().search);
  const ret = {
    country: [],
    transnational: [],
    topic: [],
    tag: [],
    q: "",
  };
  for (var key of srcParams.keys()) {
    ret[key] = srcParams
      .get(key)
      .split(",")
      .filter((it) => it !== "");
  }
  return ret;
};

const StickyAside = ({ children, innerWidth }) => {
  if (innerWidth > 644) {
    return <StickyBox offsetBottom={20}>{children}</StickyBox>;
  }
  return children;
};

let tmid;

const Browse = ({
  setWarningModalVisible,
  history,
  setStakeholderSignupModalVisible,
  filters,
  setFilters,
  filterMenu,
}) => {
  const query = useQuery();
  const { profile, countries, tags, transnationalOptions } = UIStore.useState(
    (s) => ({
      profile: s.profile,
      countries: s.countries,
      tags: s.tags,
      transnationalOptions: s.transnationalOptions,
    })
  );
  const [results, setResults] = useState([]);
  const [countData, setCountData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCountries, setFilterCountries] = useState([]);
  const location = useLocation();
  const [relations, setRelations] = useState([]);
  const { isAuthenticated, loginWithPopup, isLoading } = useAuth0();
  const [warningVisible, setWarningVisible] = useState(false);
  const isApprovedUser = profile?.reviewStatus === "APPROVED";
  const pageSize = 10;
  const [toggleButton, setToggleButton] = useState("list");
  const { innerWidth } = window;
  const [multiCountryCountries, setMultiCountryCountries] = useState([]);

  const isLoaded = () =>
    Boolean(
      !isEmpty(countries) && !isEmpty(tags) && !isEmpty(transnationalOptions)
    );

  const getResults = () => {
    // NOTE: The url needs to be window.location.search because of how
    // of how `history` and `location` are interacting!
    const searchParms = new URLSearchParams(window.location.search);
    searchParms.set("limit", pageSize);
    const url = `/browse?${String(searchParms)}`;
    api
      .get(url)
      .then((resp) => {
        setResults(resp?.data?.results);
        setCountData(resp?.data?.counts);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        redirectError(err, history);
      });
  };

  useEffect(() => {
    // setFilterCountries if user click from map to browse view
    query?.country &&
      query?.country.length > 0 &&
      setFilterCountries(query.country);

    // Manage filters display
    !filters && setFilters(query);
    if (filters) {
      setFilters({ ...filters, topic: query.topic, tag: query.tag });
      setFilterCountries(filters.country);
    }

    setLoading(true);
    if (isLoading === false && !filters) {
      setTimeout(getResults, 0);
    }

    if (isLoading === false && filters) {
      const newParams = new URLSearchParams({
        ...filters,
        topic: query.topic,
        tag: query.tag,
      });
      history.push(`/browse?${newParams.toString()}`);
      clearTimeout(tmid);
      tmid = setTimeout(getResults, 1000);
    }
    // NOTE: Since we are using `history` and `location`, the
    // dependency needs to be []. Ignore the linter warning, because
    // adding a dependency here on location makes the FE send multiple
    // requests to the backend.
  }, [isLoading]); // eslint-disable-line

  useEffect(() => {
    UIStore.update((e) => {
      e.disclaimer = "browse";
    });
    if (profile.reviewStatus === "APPROVED") {
      setTimeout(() => {
        api.get("/favorite").then((resp) => {
          setRelations(resp.data);
        });
      }, 100);
    }
  }, [profile]);

  useEffect(() => {
    if (isEmpty(filterMenu) && isEmpty(query?.topic)) {
      updateQuery(
        "topic",
        topicTypes.map((x) => humps.decamelize(x))
      );
    }
    if (!isEmpty(filterMenu)) {
      updateQuery("topic", filterMenu);
    }
    // NOTE: this are triggered when user click a topic from navigation menu
  }, [filterMenu]); // eslint-disable-line

  const updateQuery = (param, value) => {
    const topScroll = window.innerWidth < 640 ? 996 : 207;
    window.scrollTo({
      top: window.pageYOffset < topScroll ? window.pageYOffset : topScroll,
    });
    setLoading(true);
    const newQuery = { ...query };
    newQuery[param] = value;
    if (param !== "offset") {
      newQuery["offset"] = 0;
    }
    setFilters(newQuery);
    const newParams = new URLSearchParams(newQuery);
    history.push(`/browse?${newParams.toString()}`);
    clearTimeout(tmid);
    tmid = setTimeout(getResults, 1000);
    if (param === "country") {
      setFilterCountries(value);
    }
  };

  const handleChangeToggleButton = (status) => {
    setToggleButton(status ? "map" : "list");
  };

  const handleChangeTab = (key) => {
    const param = key === "country" ? "transnational" : "country";
    updateQuery(param, []);
  };

  const country =
    countries && query?.country
      ? countries
          .filter((x) => query.country.includes(String(x.id)))
          .map((x) => x.id)
      : [];

  const handleChangeCountry = (val) => {
    const selected = countries?.filter((x) => {
      return val.includes(x.id);
    });
    updateQuery(
      "country",
      selected.map((x) => x.id)
    );
  };

  const handleDeselectCountry = (val) => {
    const diselected = countries?.find((x) => x.id === val);
    const selected =
      countries && query?.country
        ? countries.filter(
            (x) =>
              query.country.includes(String(x.id)) && diselected.id !== x.id
          )
        : [];
    updateQuery(
      "country",
      selected.map((x) => x.id)
    );
  };

  const multiCountry =
    transnationalOptions && query?.transnational
      ? transnationalOptions
          .filter((x) => query.transnational.includes(String(x.id)))
          .map((x) => x.id)
      : [];

  const handleChangeMultiCountry = (val) => {
    // Fetch transnational countries
    val.forEach((id) => {
      const check = multiCountryCountries.find((x) => x.id === id);
      !check &&
        api.get(`/country-group/${id}`).then((resp) => {
          setMultiCountryCountries([
            ...multiCountryCountries,
            { id: id, countries: resp.data?.[0]?.countries },
          ]);
        });
    });
    // End of fetch transnational countries

    const selected = transnationalOptions?.filter((x) => {
      return val.includes(x.id);
    });
    updateQuery(
      "transnational",
      selected.map((x) => x.id)
    );
  };

  const handleDeselectMultiCountry = (val) => {
    const diselected = transnationalOptions?.find((x) => x.id === val);
    const selected =
      transnationalOptions && query?.transnational
        ? transnationalOptions.filter(
            (x) =>
              query.transnational.includes(String(x.id)) &&
              diselected.id !== x.id
          )
        : [];
    updateQuery(
      "transnational",
      selected.map((x) => x.id)
    );
  };

  const handleRelationChange = (relation) => {
    api
      .post("/favorite", relation)
      .then((res) => {
        const relationIndex = relations.findIndex(
          (it) => it.topicId === relation.topicId
        );
        if (relationIndex !== -1) {
          setRelations([
            ...relations.slice(0, relationIndex),
            relation,
            ...relations.slice(relationIndex + 1),
          ]);
        } else {
          setRelations([...relations, relation]);
        }
      })
      .catch((err) => {
        if (isAuthenticated) {
          if (Object.keys(profile).length === 0) {
            setStakeholderSignupModalVisible(true);
          } else {
            setWarningVisible(true);
          }
        } else {
          loginWithPopup();
        }
      });
  };

  // Choose topics to count, based on whether user is approved or not,
  // and if any topic filters are active.
  const topicsForTotal = (isApprovedUser
    ? topicTypesApprovedUser
    : topicTypes
  ).map((t) => humps.decamelize(t));
  const filteredTopics =
    filters?.topic?.length > 0
      ? filters?.topic?.filter((t) => topicsForTotal.indexOf(t) > -1)
      : topicsForTotal;
  const totalItems = filteredTopics.reduce(
    (acc, topic) =>
      acc + (countData?.find((it) => it.topic === topic)?.count || 0),
    0
  );

  return (
    <div id="browse">
      <div className="section-header">
        <div className="ui container page-title">
          <h2 className="text-green">All Resources</h2>
          <span className="text-white">
            <Switch
              checked={toggleButton === "map"}
              disabled={!isLoaded()}
              onChange={handleChangeToggleButton}
              size="small"
            />{" "}
            Switch to {toggleButton === "list" ? "map" : "list"} view
          </span>
        </div>
      </div>
      {toggleButton === "map" ? (
        <MapLanding
          {...{
            setWarningModalVisible,
            setStakeholderSignupModalVisible,
            loginWithPopup,
            isAuthenticated,
            filters,
            setFilters,
            setToggleButton,
            updateQuery,
            multiCountryCountries,
            setMultiCountryCountries,
          }}
        />
      ) : (
        <div className="ui container">
          <div className="main-content">
            <StickyAside
              innerWidth={innerWidth}
              children={
                <aside>
                  <div className="country-filter-tab-wrapper">
                    <CountryTransnationalFilter
                      handleChangeTab={handleChangeTab}
                      country={country}
                      handleChangeCountry={handleChangeCountry}
                      handleDeselectCountry={handleDeselectCountry}
                      multiCountry={multiCountry}
                      handleChangeMultiCountry={handleChangeMultiCountry}
                      handleDeselectMultiCountry={handleDeselectMultiCountry}
                      multiCountryCountries={multiCountryCountries}
                      multiCountryLabelCustomIcon={true}
                      countrySelectMode="multiple"
                      multiCountrySelectMode="multiple"
                    />
                  </div>
                  <div className="inner">
                    <Input
                      value={query.q}
                      className="src"
                      placeholder="Search for resources and stakeholders"
                      suffix={<SearchOutlined />}
                      onChange={({ target: { value } }) =>
                        updateQuery("q", value)
                      }
                    />
                    <div className="field">
                      {isAuthenticated && (
                        <Checkbox
                          className="my-favorites"
                          checked={query?.favorites?.indexOf("true") > -1}
                          onChange={({ target: { checked } }) =>
                            updateQuery("favorites", checked)
                          }
                        >
                          My Bookmarks
                        </Checkbox>
                      )}
                    </div>
                    <TopicSelect
                      countData={countData}
                      isApprovedUser={isApprovedUser}
                      value={query}
                      onChange={(flag, val) => updateQuery(flag, val)}
                      tagTopics={tags?.topics ? tags.topics : []}
                    />
                  </div>
                </aside>
              }
            />
            <div className="scroll-content">
              <StickyBox offsetBottom={500} className="sticky-pagination">
                <div className="page">
                  {filters?.q &&
                    !isEmpty(filters.q) &&
                    "The search functionality currently only shows resources"}
                </div>
              </StickyBox>
              {!isLoaded() || loading ? (
                <h2 className="loading">
                  <LoadingOutlined spin /> Loading
                </h2>
              ) : isLoaded() && !loading && !isEmpty(results) ? (
                results.map((result) => (
                  <Result
                    key={`${result.type}-${result.id}`}
                    {...{
                      result,
                      handleRelationChange,
                      relations,
                      profile,
                      isApprovedUser,
                    }}
                  />
                ))
              ) : (
                <h2 className="loading">There is no data to display</h2>
              )}
              <div className="page">
                {!isEmpty(results) && (
                  <Pagination
                    defaultCurrent={1}
                    current={(filters?.offset || 0) / pageSize + 1}
                    pageSize={pageSize}
                    total={totalItems}
                    showSizeChanger={false}
                    onChange={(n, size) =>
                      updateQuery("offset", (n - 1) * size)
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <ModalWarningUser
        visible={warningVisible}
        close={() => setWarningVisible(false)}
      />
    </div>
  );
};

const TopicSelect = ({
  value,
  onChange,
  countData,
  isApprovedUser,
  tagTopics,
}) => {
  const handleChange = (flag, type) => ({ target: { checked } }) => {
    const val = value[flag];
    if (checked && val.indexOf(type) === -1) {
      onChange(flag, [...val, type]);
    } else if (!checked && val.indexOf(type) !== -1) {
      onChange(
        flag,
        val.filter((it) => it !== type)
      );
    }
  };
  return [
    <div className="field" key={"topic-select"}>
      <div className="label">Resources</div>
      <ul className="topic-list">
        {topicTypes.map((type) => {
          const topic = humps.decamelize(type);
          const count = countData?.find((it) => it.topic === topic)?.count || 0;
          return (
            <li key={type}>
              <Checkbox
                checked={value.topic.indexOf(topic) !== -1}
                onChange={handleChange("topic", topic)}
              >
                {topicNames(type)} ({count})
              </Checkbox>
            </li>
          );
        })}
      </ul>
    </div>,
    /* Topics / tags.topics */
    <div className="field" key={"topic-tags-select"}>
      <div className="label">Topics</div>
      <ul className="topic-list">
        {tagTopics.map((it) => {
          const { id, tag } = it;
          return (
            <li key={`tags-topic-${tag}-${id}`}>
              <Checkbox
                checked={value.tag.indexOf(tag) !== -1}
                onChange={handleChange("tag", tag)}
              >
                {tag}
              </Checkbox>
            </li>
          );
        })}
      </ul>
    </div>,
    /* Commented this to remove */
    /*
    isApprovedUser ? (
      <div className="field" key={"topic-select-unlisted"}>
        <div className="label">Stakeholders</div>
        <ul className="topic-list">
          <li>
            <Checkbox
              checked={value.indexOf("organisation") !== -1}
              onChange={handleChange("organisation")}
            >
              {topicNames("organisation")} (
              {countData?.find((it) => it.topic === "organisation")?.count || 0}
              )
            </Checkbox>
          </li>
          <li>
            <Checkbox
              checked={value.indexOf("stakeholder") !== -1}
              onChange={handleChange("stakeholder")}
            >
              Individual (
              {countData?.find((it) => it.topic === "stakeholder")?.count || 0})
            </Checkbox>
          </li>
        </ul>
      </div>
    ) : null,
    */
  ];
};

export const Result = ({
  result,
  relations,
  handleRelationChange,
  profile,
  isApprovedUser,
}) => {
  const fullName = (data) =>
    data.title
      ? `${data.title} ${data.firstName} ${data.lastName}`
      : `${data.firstName} ${data.lastName}`;
  const title =
    (result.type === "stakeholder" && fullName(result)) ||
    result.title ||
    result.name;
  const description =
    result.description ||
    result.abstract ||
    result.summary ||
    result.about ||
    result.remarks;
  const relation = relations.find(
    (it) =>
      it.topicId === result.id &&
      it.topic === resourceTypeToTopicType(result.type)
  );
  const allowBookmark =
    result.type !== "stakeholder" || profile.id !== result.id;
  const tagClassname = "type " + result.type;
  const reviewStatus = result?.reviewStatus;

  const showReviewStatus =
    !isEmpty(profile) && isApprovedUser && profile?.role === "ADMIN";

  return (
    <Linkify result={result}>
      {showReviewStatus && (
        <Tag
          color={reviewStatus === "APPROVED" ? "success" : "processing"}
          key={`review-status-${result?.id}`}
        >
          {reviewStatus}
        </Tag>
      )}
      <h4>{title}</h4>
      <div className={tagClassname}>{topicNames(result.type)}</div>
      <ul className="stats">
        {result.geoCoverageType && <li>{result.geoCoverageType}</li>}
        {/* Global Coverage Value */}
        {/* {result.geoCoverageType === 'global' && result.geoCoverageValues === null && <li><Excerpt content={values(countries).map(c => c.name).join(', ')} max={500} /></li>} */}
        {/* {result.geoCoverageType === 'global' && result.geoCoverageValues !== null && <li><Excerpt content={result.geoCoverageValues.map(it => countries[countries3to2[it]]?.name || it).join(', ')} /></li>} */}
        {/* {result.geoCoverageType === 'regional' && <li><Excerpt content={result.geoCoverageValues.join(', ')} /></li>} */}
        {/* {(result.geoCoverageType === 'transnational' || result.geoCoverageType === 'national' || result.geoCoverageType === 'sub-national') && result.geoCoverageValues && <li><Excerpt content={result.geoCoverageValues.map(it => countries[countries3to2[it]]?.name || it).join(', ')} max={500} /></li>} */}
        {/* End Global Coverage Value */}
        {result.status && (
          <li>
            <span>Status:</span>
            {result.status}
          </li>
        )}
        {result.organisationType && (
          <li>
            <span>Org:</span>
            {result.organisationType}
          </li>
        )}
        {result.yearFounded && (
          <li>
            <span>Founded:</span>
            {result.yearFounded}
          </li>
        )}
        {result.developmentStage && (
          <li>
            <span>Stage:</span>
            {result.developmentStage}
          </li>
        )}
        {result.value && (
          <li>
            <span>Value:</span>
            {result.valueCurrency}{" "}
            {String(result.value).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </li>
        )}
        {result.type === "event" && [
          <li key="1">
            <span>Starts:</span>
            <i>{moment(result.startDate).format("DD MMM YYYY")}</i>
          </li>,
          <li key="2">
            <span>Ends:</span>
            <i>{moment(result.endDate).format("DD MMM YYYY")}</i>
          </li>,
        ]}
        {result.type === "stakeholder" && result.publicEmail && (
          <li>
            <span>Email:</span>
            {result.email}
          </li>
        )}
      </ul>
      {result.type !== "initiative" && description && (
        <TrimText text={description} />
      )}
      {allowBookmark && (
        <PortfolioBar topic={result} {...{ handleRelationChange, relation }} />
      )}
    </Linkify>
  );
};

const Linkify = ({ result, children }) => {
  return (
    <Card className="result fade-in" key={result.id}>
      <Link to={`/${result.type}/${result.id}`} className="browse-card"></Link>
      {children}
    </Card>
  );
};

export const PortfolioBar = ({ relation }) => {
  return (
    <div className="portfolio-bar" onClick={(e) => e.stopPropagation()}>
      {relation?.association?.map((relationType, index) => (
        <Tag color="blue" key={`browse-relation-${index}`}>
          {relationType}
        </Tag>
      ))}
    </div>
  );
};

export default withRouter(Browse);
