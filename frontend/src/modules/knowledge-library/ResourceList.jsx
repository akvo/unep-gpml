import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  PageHeader,
  Card,
  Space,
  Avatar,
  Button,
  Tooltip,
  Pagination,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import StickyBox from "react-sticky-box";
import { Link, useLocation, withRouter } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { LoadingOutlined } from "@ant-design/icons";
import moment from "moment";

import "./styles.scss";
import { UIStore } from "../../store";
import {
  topicTypes,
  topicTypesIncludingOrg,
  topicTypesApprovedUser,
  topicNames,
  resourceTypeToTopicType,
} from "../../utils/misc";
import api from "../../utils/api";
import ModalWarningUser from "../../utils/modal-warning-user";
import humps from "humps";
import { TrimText } from "../../utils/string";
// import MapLanding from "./map-landing";
// import CountryTransnationalFilter from "./country-transnational-filter";
import { redirectError } from "../error/error-util";
import isEmpty from "lodash/isEmpty";

// Global variabel
let tmid;

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

const ResourceList = ({
  history,
  filters,
  setFilters,
  filterMenu,
  setListVisible,
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
      history.push(`/knowledge-library?${newParams.toString()}`);
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
    history.push(`/knowledge-library?${newParams.toString()}`);
    clearTimeout(tmid);
    tmid = setTimeout(getResults, 1000);
    if (param === "country") {
      setFilterCountries(value);
    }
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
    <Row>
      <Col span={24}>
        <PageHeader
          className="resource-list-header"
          ghost={false}
          onBack={() => setListVisible(false)}
          title="Hide List"
          subTitle="Showing 10 of 92 results"
          extra={<Button>Sort By: A &gt; Z</Button>}
        />
      </Col>
      <Col span={24} className="resource-list">
        {!isLoaded() || loading ? (
          <h2 className="loading">
            <LoadingOutlined spin /> Loading
          </h2>
        ) : isLoaded() && !loading && !isEmpty(results) ? (
          <ResourceItem results={results} />
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
              onChange={(n, size) => updateQuery("offset", (n - 1) * size)}
            />
          )}
        </div>
      </Col>
    </Row>
  );
};

const ResourceItem = ({ results }) => {
  return results.map((result) => {
    const { id, type } = result;
    const fullName = (data) =>
      data.title
        ? `${data.title} ${data.firstName} ${data.lastName}`
        : `${data.firstName} ${data.lastName}`;
    const title =
      (type === "stakeholder" && fullName(result)) ||
      result.title ||
      result.name;
    const description =
      result.description ||
      result.abstract ||
      result.summary ||
      result.about ||
      result.remarks;
    const linkTo = `/${type}/${id}`;

    return (
      <Card key={`${type}-${id}`} className="resource-item">
        <div className="topic">{topicNames(type)}</div>
        <div className="item-body">
          <div className="title">{title}</div>
          <div className="description">
            <TrimText text={description} max={125} />
          </div>
        </div>
        <div className="item-footer">
          <Space size={5}>
            <Avatar.Group
              maxCount={3}
              maxStyle={{
                color: "#f56a00",
                backgroundColor: "#fde3cf",
              }}
            >
              {["a", "b"].map((b, i) => (
                <Tooltip key={`avatar-${i}`} title={b} placement="top">
                  <Avatar
                    style={{ backgroundColor: "#FFB800" }}
                    icon={<UserOutlined />}
                  />
                </Tooltip>
              ))}
            </Avatar.Group>{" "}
            <span className="avatar-number">+42</span>
          </Space>
          <span className="read-more">
            <Link to={linkTo}>
              Read more <ArrowRightOutlined />
            </Link>
          </span>
        </div>
      </Card>
    );
  });
};

export default ResourceList;
