import React, { useState, useEffect } from "react";
import { orderBy } from "lodash";
import api from "../../utils/api";
import TopicChart from "../chart/topic-chart";
import TopicBar from "../chart/topic-bar";

const TopicView = ({ updateQuery, query, results, countData }) => {
  const [sortedPopularTopics, setSortedPopularTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const popularTags = [
    "plastics",
    "waste management",
    "marine litter",
    "capacity building",
    "product by design",
    "source to sea",
  ];

  const savedTopic = popularTags.filter((item) => {
    if (query?.tag?.includes(item)) {
      return item;
    }
  });

  const selectedTag = countData.find((item) => item?.topic === selectedTopic);

  const handlePopularTopicChartClick = (params) => {
    const { name, tag } = params?.data;
    setSelectedTopic(name?.toLowerCase());
    updateQuery("tag", [tag]);
  };

  const handlePopularTopicBarClick = (e) => {
    const name = e.currentTarget.value;
    setSelectedTopic(name.toLowerCase());
    updateQuery("tag", [name]);
  };

  useEffect(() => {
    if (!selectedTopic && savedTopic?.length > 0) {
      setSelectedTopic(savedTopic[0]);
    }

    // Reset selection when the filter is clear
    if (savedTopic?.length === 0 && selectedTopic) {
      setSelectedTopic(null);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedTopic]);

  const getPopularTopics = (url) => {
    api
      .get(url)
      .then((resp) => {
        const data = resp?.data.map((item, i) => {
          if (selectedTag?.topic === item?.tag) {
            return {
              id: item?.tag,
              topic: item?.tag,
              tag: item?.tag,
              count: selectedTag?.count || 0,
            };
          } else {
            return {
              id: item?.tag,
              topic: item?.tag,
              tag: item?.tag,
              count: item?.count,
              selectedTag,
            };
          }
        });
        const dataTag = data.map((item) => item?.tag);
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

        const sorted = orderBy(
          [...data, ...nonExistedTopic],
          ["count", "topic"],
          ["desc", "desc"]
        );

        setSortedPopularTopics(sorted);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // Apply when there is a selected topic
  useEffect(() => {
    if (results.length > 0) {
      if (selectedTag && selectedTopic && savedTopic?.length > 0) {
        getPopularTopics(`/tag/topic/popular?tags=${selectedTopic}&limit=6`);
      }
      if (!selectedTopic) {
        getPopularTopics(`/tag/topic/popular`);
      }
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
  }, [selectedTopic, results, selectedTag]);

  return (
    <>
      <TopicChart
        wrapperHeight={"10%"}
        loadingId="knowledge-library-loading"
        {...{
          selectedTopic,
          setSelectedTopic,
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
