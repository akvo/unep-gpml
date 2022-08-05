import React, { useState, useEffect } from "react";
import TopicChart from "../chart/topic-chart";
import TopicBar from "../chart/topic-bar";

const TopicView = ({
  updateQuery,
  query,
  results,
  countData,
  fetch,
  loading,
  initialCountData,
}) => {
  const [sortedPopularTopics, setSortedPopularTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [data, setData] = useState([]);
  const popularTags = [
    "plastics",
    "waste management",
    "marine litter",
    "capacity building",
    "product by design",
    "source to sea",
  ];

  useEffect(() => {
    if (data.length === 0) {
      setData(countData);
    }
    if (!selectedTopic) {
      setData(initialCountData);
    }
  }, [data, initialCountData, countData, query, selectedTopic, loading]);

  useEffect(() => {
    if (query.hasOwnProperty("tag")) {
      updateQuery("tag", [], true);
    }
  }, [query]);

  const savedTopic = popularTags.filter((item) => {
    if (query?.tag?.includes(item)) {
      return item;
    }
  });

  const topics = data
    .filter(
      (item) =>
        item.topic === "plastics" ||
        item.topic === "waste management" ||
        item.topic === "marine litter" ||
        item.topic === "capacity building" ||
        item.topic === "product by design" ||
        item.topic === "source to sea"
    )
    .map((item) => {
      return {
        id: item?.topic,
        topic: item?.topic,
        tag: item?.topic,
        count: item?.count,
      };
    });

  const dataTag = topics.map((item) => item?.tag);

  const nonExistedTopic = popularTags
    .filter((item) => !dataTag.includes(item))
    .map((x) => {
      return {
        id: x,
        topic: x,
        tag: x,
        count: 0,
      };
    });

  const allTopics = [...nonExistedTopic, topics].flat();

  const handlePopularTopicChartClick = (params) => {
    if (selectedTopic) {
      updateQuery("tag", [], fetch);
      setSelectedTopic(
        params?.data.name?.toLowerCase() === selectedTopic
          ? null
          : params?.data.name?.toLowerCase()
      );
    } else {
      const { name, tag } = params?.data;
      setSelectedTopic(name?.toLowerCase());
      updateQuery("tag", [tag], fetch);
    }
  };

  useEffect(() => {
    if (!selectedTopic && savedTopic?.length > 0) {
      setSelectedTopic(savedTopic[0]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedTopic]);

  // Apply when there is a selected topic
  useEffect(() => {
    if (results.length > 0) {
      setSortedPopularTopics(allTopics);
    } else {
      const topics = popularTags.map((topic) => {
        return {
          id: topic,
          topic: topic,
          tag: topic,
          count: 0,
        };
      });
      setSortedPopularTopics(topics);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic, results, data]);

  return (
    <>
      <TopicChart
        {...{
          selectedTopic,
          setSelectedTopic,
          sortedPopularTopics,
          handlePopularTopicChartClick,
        }}
      />
    </>
  );
};

export default TopicView;
