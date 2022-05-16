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

  const savedTopic = popularTags.filter((item) => {
    if (query.tag.includes(item)) {
      return item;
    }
  });

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
    if (!selectedTopic && savedTopic.length > 0) {
      setSelectedTopic(defTopic);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedPopularTopics]);

  const getPopularTopics = (url) => {
    api
      .get(url)
      .then((resp) => {
        const data = resp?.data.map((item, i) => {
          return {
            id: item?.tag,
            topic: item?.tag,
            tag: item?.tag,
            count: item?.count,
          };
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

  useEffect(() => {
    if (selectedTopic || savedTopic.length > 0) {
      getPopularTopics(
        `/tag/topic/popular?tags=${selectedTopic || savedTopic}&limit=6`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic]);

  useEffect(() => {
    if (savedTopic.length === 0) {
      getPopularTopics(`/tag/topic/popular`);
    }

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
