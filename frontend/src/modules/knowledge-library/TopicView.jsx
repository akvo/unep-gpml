import React, { useState } from "react";

import TopicChart from "../chart/topicChart";

const TopicView = ({ updateQuery }) => {
  const [sortPopularTopic, setSortPopularTopic] = useState([]);
  const defTopic = sortPopularTopic[0]?.topic?.toLocaleLowerCase();

  const [selectedTopic, setSelectedTopic] = useState(defTopic);

  const isMobileScreen = innerWidth <= 991;

  const popularTags = [
    "plastics",
    "waste management",
    "marine litter",
    "capacity building",
    "product by design",
    "source to sea",
    "climate change",
  ];

  const handlePopularTopicChartClick = (params) => {
    const { name, tag } = params?.data;
    !isMobileScreen && setSelectedTopic(name?.toLowerCase());
    updateQuery("tag", [tag]);
  };

  return (
    <TopicChart
      loadingId="knowledge-library-loading"
      {...{
        defTopic,
        selectedTopic,
        setSelectedTopic,
        popularTags,
        isMobileScreen,
        sortPopularTopic,
        setSortPopularTopic,
        handlePopularTopicChartClick,
      }}
    />
  );
};

export default TopicView;
