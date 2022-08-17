import React, { useEffect, useState } from "react";
import humps from "humps";
import api from "../../utils/api";
import { resourceTypes } from "./filter-bar";
import ResourceCards from "../../components/resource-cards/resource-cards";
import { Icon } from "../../components/svg-icon/svg-icon";
import Maps from "../map/map";
import TopicView from "./topic-view";
import { Card, Col, Row } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const Overview = ({
  summaryData,
  box,
  query,
  countData,
  landing,
  data,
  loading,
  history,
  showModal,
}) => {
  const summaryDict = {};
  let allResources = 0;
  summaryData?.forEach((obj) => {
    const key = Object.keys(obj)[0];
    summaryDict[key] = obj[key];
    allResources += obj[key];
  });

  if (loading) {
    return (
      <div className="overview">
        <div className="loading">
          <LoadingOutlined spin />
        </div>
      </div>
    );
  }

  const handleClickCategory = (key) => () => {
    history.push({
      pathname: `/knowledge/lib/resource/map/${key}`,
    });
  };

  return (
    <div className="overview">
      <ul className="categories">
        <li
          onClick={() => {
            history.push({
              pathname: `/knowledge/lib/resource/category`,
            });
          }}
        >
          <div>
            <Icon name={`all`} fill="#000" />
            <b>{allResources}</b>
          </div>
          <span>All Resources</span>
        </li>
        {resourceTypes.map((type) => (
          <li onClick={handleClickCategory(type.key)} key={type.key}>
            <div>
              <Icon name={`resource-types/${type.key}`} fill="#000" />
              <b>
                {countData.find((item) => type.title === item.topic)?.count ||
                  "XX"}
              </b>
            </div>
            <span>{type.label}</span>
          </li>
        ))}
      </ul>
      <section className="grey">
        {/* <h3>Categories</h3> */}
        <Featured {...{ showModal }} />
      </section>
      <section>
        <Row gutter={16}>
          <Col sm={24} md={24} lg={12} xl={12}>
            <h3>Resources by location</h3>
            <div
              className="overlay-btn"
              onClick={() => {
                history.push({
                  pathname: `/knowledge/lib/resource/map`,
                });
              }}
            >
              <Maps
                {...{ box, query, countData }}
                data={landing?.map || []}
                isLoaded={() => true}
                useTooltips={false}
                showLegend={false}
                zoom={0.9}
                path="knowledge"
              />
            </div>
          </Col>
          <Col sm={24} md={24} lg={12} xl={12}>
            <h3>Resources by topic</h3>
            <div
              className="overlay-btn"
              onClick={() => {
                history.push({
                  pathname: `/knowledge/lib/resource/topic`,
                });
              }}
            >
              <TopicView
                {...{ query, loading }}
                results={data?.results}
                fetch={true}
                countData={countData.filter(
                  (count) => count.topic !== "gpml_member_entities"
                )}
              />
            </div>
          </Col>
        </Row>
      </section>
    </div>
  );
};

const Featured = ({ showModal }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get("/browse?featured=true").then(({ data }) => {
      setResults(data.results);
      setLoading(false);
    });
  }, []);
  return (
    <>
      <h3>Featured resources</h3>
      <ResourceCards
        items={results}
        showMoreCardAfter={20}
        showMoreCardClick={() => {
          history.push({
            pathname: `/knowledge/lib/resource/grid`,
          });
        }}
        showModal={(e) =>
          showModal({
            e,
            type: e.currentTarget.type,
            id: e.currentTarget.id,
          })
        }
        firstCard={
          <Link to="/flexible-forms">
            <div className="add-resource-card">
              <b>+</b>
              <span>Share your resource</span>
              <small>Contribute to the library</small>
            </div>
          </Link>
        }
      />
    </>
  );
};

export default Overview;
