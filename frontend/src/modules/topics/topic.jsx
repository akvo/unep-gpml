import React from "react";
import { Card, Image, Button } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import "./styles.scss";
import imageNotFound from "../../images/image-not-found.png";

import { UIStore } from "../../store";
import isEmpty from "lodash/isEmpty";

const Topic = () => {
  const { tags } = UIStore.useState((s) => s);
  return (
    <div id="topics">
      <div className="ui container">
        {isEmpty(tags) || !tags?.topics ? (
          <h2 className="loading">
            <LoadingOutlined spin /> Loading Topics
          </h2>
        ) : (
          renderTopics(tags.topics)
        )}
      </div>
    </div>
  );
};

const renderTopics = (topics) => {
  return (
    <div className="section-container">
      <h2>Featured Topics</h2>
      <div className="topic-item-wrapper">
        {topics.map((x) => {
          const { id, tag } = x;
          return (
            <Card key={`${tag}-${id}`} className="topic-item-card">
              <Image size="90%" src={imageNotFound} preview={false} />
              <div className="topic-item-title-wrapper">
                <div className="topic-item-title">{tag}</div>
                <Button
                  className="topic-item-count"
                  shape="circle"
                  type="ghost"
                >
                  50
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Topic;
