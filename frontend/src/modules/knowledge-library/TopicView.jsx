import React, { useState } from "react";

import TopicChart from "../chart/topicChart";

const TopicView = ({ updateQuery }) => {
  const [sortPopularTopic, setSortPopularTopic] = useState([]);
  const defTopic = sortPopularTopic[0]?.topic?.toLocaleLowerCase();

  const [selectedTopic, setSelectedTopic] = useState(defTopic);

  const isMobileScreen = innerWidth <= 991;

  const handlePopularTopicChartClick = (params) => {
    const { name, tag } = params?.data;
    !isMobileScreen && setSelectedTopic(name.toLowerCase());
    updateQuery("tag", [tag]);
  };

  return (
    <TopicChart
      {...{
        defTopic,
        selectedTopic,
        setSelectedTopic,
        isMobileScreen,
        sortPopularTopic,
        setSortPopularTopic,
        handlePopularTopicChartClick,
      }}
    />
  );
};

export default TopicView;
