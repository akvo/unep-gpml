import React, { useState } from "react";

import Chart from "../../utils/chart";
import { popularTopics } from "../landing/new-home-static-content";
import orderBy from "lodash/orderBy";

const sortPopularTopic = orderBy(
  popularTopics,
  ["count", "topic"],
  ["desc", "desc"]
);

const TopicView = ({ updateQuery }) => {
  const defTopic = sortPopularTopic[0]?.topic?.toLocaleLowerCase();

  const [selectedTopic, setSelectedTopic] = useState(defTopic);

  const isMobileScreen = innerWidth <= 991;

  const handlePopularTopicChartClick = (params) => {
    const { name, tag } = params?.data;
    !isMobileScreen && setSelectedTopic(name.toLowerCase());
    updateQuery("tag", [tag]);
  };
  return (
    <div className="chart-wrapper">
      <Chart
        key="popular-topic"
        title=""
        type="TREEMAP"
        height={window?.innerHeight}
        className="popular-topic-chart"
        data={sortPopularTopic.map((x) => {
          return {
            id: x.id,
            name: x.topic,
            value: x.count > 100 ? x.count : x.count + 50,
            count: x.count,
            tag: x.tag,
          };
        })}
        onEvents={{
          click: (e) => handlePopularTopicChartClick(e),
        }}
        selected={selectedTopic}
      />
    </div>
  );
};

export default TopicView;
