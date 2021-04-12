import { UIStore } from "../../store";
import React, { useEffect, useState } from "react";
import { Card, Input, Select, Checkbox, Tag, Pagination } from "antd";
import { SearchOutlined } from "@ant-design/icons";
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
import TrimText from "../../utils/trim";

function useQuery() {
  const srcParams = new URLSearchParams(useLocation().search);
  const ret = {
    country: [],
    topic: [],
    q: "",
  };
  for (var key of srcParams.keys()) {
    ret[key] = srcParams
      .get(key)
      .split(",")
      .filter((it) => it !== "");
  }
  return ret;
}

let tmid;

const Browse = ({
  history,
  countData,
  setSignupModalVisible,
  updateDisclaimer,
  filters,
  setFilters,
}) => {
  const query = useQuery();
  const { profile, countries } = UIStore.currentState;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCountries, setFilterCountries] = useState([]);
  const location = useLocation();
  const [relations, setRelations] = useState([]);
  const { isAuthenticated, loginWithPopup, isLoading } = useAuth0();
  const [warningVisible, setWarningVisible] = useState(false);
  const isApprovedUser = profile?.reviewStatus === "APPROVED";
  const getResults = () => {
    // NOTE: This needs to be window.location.search because of how of
    // how `history` and `location` are interacting!
    setLoading(true);
    api.get(`/browse${window.location.search}`).then((resp) => {
      setResults(resp?.data?.results);
      setLoading(false);
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
      setFilters({ ...filters, topic: query.topic });
      setFilterCountries(filters.country);
    }

    setLoading(true);
    if (isLoading === false && !filters) {
      setTimeout(() => {
        api.get(`/browse${location.search}`).then((resp) => {
          setResults(resp?.data?.results);
          setLoading(false);
        });
      });
    }

    if (isLoading === false && filters) {
      const newParams = new URLSearchParams({ ...filters, topic: query.topic });
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
    if (profile.reviewStatus === "APPROVED") {
      setTimeout(() => {
        api.get("/favorite").then((resp) => {
          setRelations(resp.data);
        });
      }, 100);
    }
  }, [profile]);
  const updateQuery = (param, value) => {
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
            setSignupModalVisible(true);
          } else {
            setWarningVisible(true);
          }
        } else {
          loginWithPopup();
        }
      });
  };
  const tTypes = isApprovedUser
    ? topicTypesApprovedUser
    : topicTypesIncludingOrg;
  const topicCounts = tTypes.reduce((acc, topic) => {
    const data = Object();
    if (filterCountries.length === 0) {
      data[topic] = countData?.summary?.find((it) =>
        it.hasOwnProperty(topic)
      )?.[topic];
    } else {
      // FIXME: The counts would be incorrect if the countries have common resources which are transnational - those would be double counted!
      // FIXME: Also, we display global and regional resources, but those are not included in the counts.
      const count = filterCountries.reduce(
        (acc, isoCode) =>
          acc + countData?.map?.find((it) => it.isoCode === isoCode)?.[topic],
        0
      );
      data[topic] = count;
    }
    return { ...acc, ...data };
  }, {});

  // Choose topics to count, based on whether user is approved or not,
  // and if any topic filters are active.
  const topicsForTotal = isApprovedUser ? topicTypesIncludingOrg : topicTypes;
  const filteredTopics =
    filters?.topic?.length > 0
      ? topicsForTotal.filter(
          (t) => filters?.topic?.indexOf(humps.decamelize(t)) > -1
        )
      : topicsForTotal;
  const totalItems = filteredTopics.reduce(
    (acc, topic) => acc + topicCounts[topic],
    0
  );

  useEffect(() => {
    updateDisclaimer("/browse");
  }, [updateDisclaimer]);

  return (
    <div id="browse">
      <div className="ui container">
        <aside>
          <div className="inner">
            <Input
              value={query.q}
              className="src"
              placeholder="Search for resources and stakeholders"
              suffix={<SearchOutlined />}
              onChange={({ target: { value } }) => updateQuery("q", value)}
            />
            <div className="field">
              <div className="label">Country</div>
              <Select
                virtual={false}
                value={
                  countries && query?.country
                    ? countries
                        .filter((x) => query.country.includes(x.isoCode))
                        .map((x) => x.id)
                    : []
                }
                placeholder="Find country"
                mode="multiple"
                options={
                  countries &&
                  countries
                    .map((it) => ({
                      value: it.id,
                      label: it.name,
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label))
                }
                allowClear
                onChange={(val) => {
                  const selected = countries?.filter((x) => val.includes(x.id));
                  updateQuery(
                    "country",
                    selected.map((x) => x.isoCode)
                  );
                }}
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              />
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
              counts={topicCounts}
              isApprovedUser={isApprovedUser}
              value={query.topic}
              onChange={(val) => updateQuery("topic", val)}
            />
          </div>
        </aside>
        <div className="main-content">
          {!loading && (
            <div className="page">
              <Pagination
                defaultCurrent={1}
                current={(filters?.offset || 0) / 50 + 1}
                pageSize={50}
                total={totalItems}
                showSizeChanger={false}
                onChange={(n, size) => updateQuery("offset", (n - 1) * size)}
              />
            </div>
          )}
          {loading ? (
            <h2 className="loading">
              <LoadingOutlined spin /> Loading
            </h2>
          ) : isEmpty(results) ? (
            <h2 className="loading">There is no data to display</h2>
          ) : (
            results.map((result) => (
              <Result
                key={`${result.type}-${result.id}`}
                {...{ result, handleRelationChange, relations, profile }}
              />
            ))
          )}
        </div>
      </div>
      <ModalWarningUser
        visible={warningVisible}
        close={() => setWarningVisible(false)}
      />
    </div>
  );
};

const TopicSelect = ({ value, onChange, counts, isApprovedUser }) => {
  const handleChange = (type) => ({ target: { checked } }) => {
    if (checked && value.indexOf(type) === -1) {
      onChange([...value, type]);
    } else if (!checked && value.indexOf(type) !== -1) {
      onChange(value.filter((it) => it !== type));
    }
  };
  return [
    <div className="field" key={"topic-select"}>
      <div className="label">Resources</div>
      <ul className="topic-list">
        {topicTypes.map((type) => (
          <li key={type}>
            <Checkbox
              checked={value.indexOf(humps.decamelize(type)) !== -1}
              onChange={handleChange(humps.decamelize(type))}
            >
              {topicNames(type)} ({(counts && counts[type]) || 0})
            </Checkbox>
          </li>
        ))}
      </ul>
    </div>,
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
              {(counts && counts["organisation"]) || 0})
            </Checkbox>
          </li>
          <li>
            <Checkbox
              checked={value.indexOf("stakeholder") !== -1}
              onChange={handleChange("stakeholder")}
            >
              Individual ({(counts && counts["stakeholder"]) || 0})
            </Checkbox>
          </li>
        </ul>
      </div>
    ) : null,
  ];
};

const Result = ({ result, relations, handleRelationChange, profile }) => {
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

  return (
    <Linkify result={result}>
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
          <li>
            <span>Starts:</span>
            <i>{moment(result.startDate).format("DD MMM YYYY")}</i>
          </li>,
          <li>
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
      {result.type !== "project" && description && (
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
