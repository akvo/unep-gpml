import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Image, Button } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import "./styles.scss";
import imageNotFound from "../../images/image-not-found.png";
import TopicImages from "./topic-images";

import { UIStore } from "../../store";
import isEmpty from "lodash/isEmpty";

const Topic = ({ filters, setFilters }) => {
  const tags = UIStore.useState((s) => s.tags);

  const isLoaded = () => Boolean(!isEmpty(tags));

  useEffect(() => {
    filters && setFilters(null);
  }, [filters, setFilters]);

  return (
    <div id="topics">
      {/* Featured topic */}
      <div className="section-featured-topic-container">
        <div className="ui container">
          <div className="section-container">
            <h2>Featured Topics</h2>
            <Row className="topic-item-wrapper" gutter={[16, 16]}>
              {!isLoaded() || !tags?.topics ? (
                <h2 className="loading">
                  <LoadingOutlined spin /> Loading...
                </h2>
              ) : (
                renderTopics(tags.topics)
              )}
            </Row>
          </div>
        </div>
      </div>
      {/* All topic */}
      <div className="section-all-topic-container"></div>
    </div>
  );
};

const renderTopics = (topics) => {
  return topics.map((x) => {
    const { id, tag } = x;
    const image = TopicImages.find((x) => x.tag === tag)?.image;

    return (
      <Col
        key={`${tag}-${id}`}
        className="topic-item-col"
        sm={24}
        md={12}
        lg={8}
      >
        <Link
          to={{
            pathname: "/knowledge-library",
            search: `?tag=${tag}`,
          }}
        >
          <Card className="topic-item-card">
            <span className="featured-topic-label resource-label">
              Featured
            </span>
            <Image
              className="topic-item-image"
              width="100%"
              src={image || imageNotFound}
              preview={false}
            />
            <div className="topic-item-title-wrapper">
              <div className="topic-item-title">{tag}</div>
              {/* Uncoment this if count ready
              <Button className="topic-item-count" shape="circle" type="ghost">
                10
              </Button> */}
            </div>
          </Card>
        </Link>
      </Col>
    );
  });
};

export default Topic;
