import { orderBy } from "lodash";
import React, { useState, useEffect } from "react";
import api from "../../utils/api";

import TopicChart from "../chart/topicChart";

const TopicView = ({ updateQuery }) => {
  const [sortedPopularTopics, setSortedPopularTopics] = useState([]);
  const defTopic = sortedPopularTopics[0]?.topic?.toLocaleLowerCase();

  const [selectedTopic, setSelectedTopic] = useState(defTopic);

  const isMobileScreen = innerWidth <= 991;

  const handlePopularTopicChartClick = (params) => {
    const { name, tag } = params?.data;
    !isMobileScreen && setSelectedTopic(name?.toLowerCase());
    updateQuery("tag", [tag]);
  };

  useEffect(() => {
    setSelectedTopic(defTopic);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedPopularTopics]);

  useEffect(() => {
    api
      .get(`/tag/topic/popular?limit=13`)
      .then((resp) => {
        const data = resp?.data.map((item, i) => {
          return {
            id: i,
            topic: item?.tag,
            tag: item?.tag,
            count: item?.count,
          };
        });
        const sorted = orderBy(data, ["count", "topic"], ["desc", "desc"]);

        setSortedPopularTopics(sorted);
      })
      .catch((err) => {
        console.error(err);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TopicChart
      wrapperHeight={"10%"}
      loadingId="knowledge-library-loading"
      {...{
        selectedTopic,
        setSelectedTopic,
        isMobileScreen,
        sortedPopularTopics,
        handlePopularTopicChartClick,
      }}
    />
  );
};

export default TopicView;
