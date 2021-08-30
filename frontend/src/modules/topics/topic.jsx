import React from "react";
import { Row, Col, Card, Image, Button } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import "./styles.scss";
import imageNotFound from "../../images/image-not-found.png";

import { UIStore } from "../../store";
import isEmpty from "lodash/isEmpty";

const Topic = () => {
  const { tags } = UIStore.useState((s) => s);
  return (
    <div id="topics">
      {/* Featured topic */}
      <div className="section-featured-topic-container">
        <div className="ui container">
          <div className="section-container">
            <h2>Featured Topics</h2>
            <Row className="topic-item-wrapper" gutter={[16, 16]}>
              {isEmpty(tags) || !tags?.topics ? (
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
    return (
      <Col key={`${tag}-${id}`} sm={24} md={12} lg={8}>
        <Card className="topic-item-card" onClick={() => console.log(tag)}>
          <span className="featured-topic-label resource-label">Featured</span>
          <Image size="90%" src={imageNotFound} preview={false} />
          <div className="topic-item-title-wrapper">
            <div className="topic-item-title">{tag}</div>
            <Button className="topic-item-count" shape="circle" type="ghost">
              50
            </Button>
          </div>
        </Card>
      </Col>
    );
  });
};

export default Topic;
