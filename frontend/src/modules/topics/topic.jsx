import React from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Image, Button } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import "./styles.scss";
import imageNotFound from "../../images/image-not-found.png";

import { UIStore } from "../../store";
import isEmpty from "lodash/isEmpty";
import sumBy from "lodash/sumBy";
import api from "../../utils/api";

const Topic = () => {
  const tags = UIStore.useState((s) => s.tags);

  const isLoaded = () => Boolean(!isEmpty(tags));

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
    const tagName = tag.includes("-") ? tag.split("-").join(" ") : tag;

    return (
      <Col key={`${tag}-${id}`} sm={24} md={12} lg={8}>
        <Link
          to={{
            pathname: "/browse",
            search: `?tag=${tag}`,
          }}
        >
          <Card className="topic-item-card">
            <span className="featured-topic-label resource-label">
              Featured
            </span>
            <Image size="90%" src={imageNotFound} preview={false} />
            <div className="topic-item-title-wrapper">
              <div className="topic-item-title">{tagName}</div>
              <Button className="topic-item-count" shape="circle" type="ghost">
                10
              </Button>
            </div>
          </Card>
        </Link>
      </Col>
    );
  });
};

export default Topic;
