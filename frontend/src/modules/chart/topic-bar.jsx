import React from "react";
import { titleCase } from "../../utils/string";
import "./style.module.scss";

const TopicBar = ({
  selectedTopic,
  setSelectedTopic,
  sortedPopularTopics,
  handlePopularTopicBarClick,
}) => {
  return (
    <div className="topic-bar-wrapper">
      {sortedPopularTopics.map((x) => {
        return (
          <button
            className="topic-bar"
            key={x?.id}
            value={x?.topic}
            onClick={(e) => handlePopularTopicBarClick(e)}
            style={{
              backgroundColor:
                x?.topic.toLocaleLowerCase() === selectedTopic
                  ? "#FFB800"
                  : "#039B78",
            }}
          >
            <span className="bar-count">{x?.count}</span>
            <div>{titleCase(x?.topic)}</div>
          </button>
        );
      })}
    </div>
  );
};

export default TopicBar;
