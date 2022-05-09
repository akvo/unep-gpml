import React, { useState, useEffect } from "react";
import { orderBy } from "lodash";
import api from "../../utils/api";
import TopicChart from "../chart/topicChart";
import { titleCase } from "../../utils/string";
import TopicBar from "../chart/topicBar";

const TopicView = ({ updateQuery, query }) => {
  const [sortedPopularTopics, setSortedPopularTopics] = useState([]);
  const defTopic = sortedPopularTopics[0]?.topic?.toLocaleLowerCase();
  const [selectedTopic, setSelectedTopic] = useState(null);
  const isMobileScreen = innerWidth <= 991;
  const popularTags = [
    "plastics",
    "waste management",
    "marine litter",
    "capacity building",
    "product by design",
    "source to sea",
  ];

  const handlePopularTopicChartClick = (params) => {
    const { name, tag } = params?.data;
    !isMobileScreen && setSelectedTopic(name?.toLowerCase());
    updateQuery("tag", [tag]);
  };

  const handlePopularTopicBarClick = (e) => {
    const name = e.currentTarget.value;
    setSelectedTopic(name.toLowerCase());
    updateQuery("tag", [name]);
  };

  useEffect(() => {
    const savedTopic = popularTags.filter((item) => {
      if (query.tag.includes(item)) {
        return item;
      }
    });
    if (!selectedTopic && savedTopic.length === 0) {
      setSelectedTopic(defTopic);
    } else {
      setSelectedTopic(savedTopic[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedPopularTopics]);

  useEffect(() => {
    api
      .get(`/tag/topic/popular?tags=${popularTags}&limit=6`)
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
    <>
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
      <TopicBar
        {...{
          selectedTopic,
          setSelectedTopic,
          sortedPopularTopics,
          handlePopularTopicBarClick,
        }}
      />
    </>
  );
};

export default TopicView;
