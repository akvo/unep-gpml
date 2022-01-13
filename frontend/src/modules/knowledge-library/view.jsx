import React, { useState, useEffect } from "react";
import { Row, Col, Button, Input, Space, Tag, Select, Drawer } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";

import "./styles.scss";
import { UIStore } from "../../store";
import LeftSidebar from "../left-sidebar/LeftSidebar";
import ResourceList from "./ResourceList";
import FilterDrawer from "./FilterDrawer";
import { useQuery } from "./common";
import { useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import api from "../../utils/api";
import { redirectError } from "../error/error-util";
import isEmpty from "lodash/isEmpty";
import { topicTypes } from "../../utils/misc";
import humps from "humps";

const { Option } = Select;
// Global variabel
let tmid;

const KnowledgeLibrary = ({ history, filters, setFilters, filterMenu }) => {
  const query = useQuery();
  const [filterVisible, setFilterVisible] = useState(false);
  const [listVisible, setListVisible] = useState(true);

  const { profile } = UIStore.useState((s) => ({
    profile: s.profile,
  }));
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCountries, setFilterCountries] = useState([]);
  const location = useLocation();
  const [relations, setRelations] = useState([]);
  const { isAuthenticated, loginWithPopup, isLoading } = useAuth0();
  const [warningVisible, setWarningVisible] = useState(false);
  const pageSize = 10;
  const [toggleButton, setToggleButton] = useState("list");
  const { innerWidth } = window;
  const [countData, setCountData] = useState([]);

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

  return (
    <Row id="knowledge-library">
      {/* Header */}
      <Col span={24} className="ui-header">
        <div className="ui-container">
          <Row type="flex" justify="space-between" align="middle">
            {/* Search input & filtered by list */}
            <Col span={22}>
              <Row type="flex" justify="space-between" align="middle">
                <Col span={4}>
                  <Space>
                    <Search />
                    <Button
                      onClick={() => setFilterVisible(!filterVisible)}
                      type="ghost"
                      shape="circle"
                      icon={<FilterOutlined />}
                    />
                  </Space>
                </Col>
                <Col span={20}>
                  <Space direction="horizontal">
                    <Tag closable>Initiative</Tag>
                    <Tag closable>Italy</Tag>
                  </Space>
                </Col>
              </Row>
            </Col>
            {/* Map/Topic view dropdown */}
            <Col span={2}>
              <Select defaultValue={"map"}>
                <Option value="map">Map View</Option>
                <Option value="topic">Topic View</Option>
              </Select>
            </Col>
          </Row>
        </div>
      </Col>

      {/* Content */}
      <Col span={24}>
        <div className="ui-container">
          {/* Filter Drawer */}
          <FilterDrawer
            filters={filters}
            filterVisible={filterVisible}
            setFilterVisible={setFilterVisible}
            countData={countData}
            query={query}
            updateQuery={(flag, val) => updateQuery(flag, val)}
          />

          <LeftSidebar active={1}>
            <Row className="resource-main-container">
              {/* Resource Main Content */}
              {listVisible && (
                <Col
                  lg={10}
                  md={9}
                  sm={12}
                  xs={24}
                  className="resource-list-container"
                >
                  {/* Resource List */}
                  <ResourceList
                    filters={filters}
                    setListVisible={setListVisible}
                    countData={countData}
                    updateQuery={updateQuery}
                    loading={loading}
                    results={results}
                    pageSize={pageSize}
                  />
                </Col>
              )}
              {/* Map/Topic View */}
              <Col
                lg={listVisible ? 14 : 24}
                md={listVisible ? 15 : 24}
                sm={listVisible ? 12 : 24}
                xs={24}
                align="center"
              >
                Map here...
              </Col>
            </Row>
          </LeftSidebar>
        </div>
      </Col>
    </Row>
  );
};

const Search = () => {
  const [search, setSearch] = useState("");
  const handleSearch = (src) => {
    console.log(src);
  };

  return (
    <div className="src">
      <Input
        className="input-src"
        placeholder="Search"
        suffix={
          <Button
            onClick={() => handleSearch(search)}
            type="primary"
            shape="circle"
            size="small"
            icon={<SearchOutlined />}
          />
        }
        onPressEnter={(e) => handleSearch(e.target.value)}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
};

export default KnowledgeLibrary;
