import { LoadingOutlined } from "@ant-design/icons";
import { orderBy } from "lodash";
import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import Chart from "../../utils/chart";
// import TopicChart from "../chart/topicChart";

const TopicView = ({ updateQuery, query }) => {
  const [sortedPopularTopics, setSortedPopularTopics] = useState([]);
  const [sortPopularTopic, setSortPopularTopic] = useState([]);
  const defTopic = sortPopularTopic[0]?.topic?.toLocaleLowerCase();
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
  console.log("selectedTopic::::::", selectedTopic);
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
  }, [sortPopularTopic]);

  useEffect(() => {
    const tagsFetch = popularTags.map((tag, i) => {
      const topicName = () => {
        if (tag === "plastics") {
          return "Plastics";
        }
        if (tag === "waste management") {
          return "Waste Management";
        }
        if (tag === "marine litter") {
          return "Marine Litter";
        }

        if (tag === "capacity building") {
          return "Capacity Building";
        }
        if (tag === "product by design") {
          return "Product by Design";
        }

        if (tag === "source to sea") {
          return "Source to Sea";
        }
      };
      return api
        .get(`/browse?tag=${tag}`)
        .then((resp) => ({
          id: i,
          items: resp?.data?.results,
          topic: topicName(),
          tag,
          count: resp?.data?.counts
            .filter((count) => count.topic !== "gpml_member_entities")
            .reduce((curr, val) => curr + val?.count || 0, 0),
          summary: resp.data.counts.filter(
            (count) => count.topic !== "gpml_member_entities"
          ),
        }))
        .catch((err) => {
          console.error(err);
        });
    });

    const tagResults = Promise.all(tagsFetch).then((results) => {
      const sortedPopularTopics = orderBy(
        results,
        ["count", "topic"],
        ["desc", "desc"]
      );
      setSortPopularTopic(sortedPopularTopics);
    });
  }, []);

  // useEffect(() => {
  //   api
  //     .get(`/tag/topic/popular?limit=6`)
  //     .then((resp) => {
  //       const data = resp?.data.map((item, i) => {
  //         return {
  //           id: i,
  //           topic: item?.tag,
  //           tag: item?.tag,
  //           count: item?.count,
  //         };
  //       });
  //       const sorted = orderBy(data, ["count", "topic"], ["desc", "desc"]);

  //       setSortedPopularTopics(sorted);
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //     });

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    // <TopicChart
    //   wrapperHeight={"10%"}
    //   loadingId="knowledge-library-loading"
    //   {...{
    //     selectedTopic,
    //     setSelectedTopic,
    //     isMobileScreen,
    //     sortedPopularTopics,
    //     handlePopularTopicChartClick,
    //   }}
    // />
    <div className="chart-wrapper" style={{ height: "10%" }}>
      {sortPopularTopic.length !== 0 ? (
        <Chart
          key="popular-topic"
          title=""
          type="TREEMAP"
          height={675}
          className="popular-topic-chart"
          data={sortPopularTopic
            .filter((tag) => tag.count > 0)
            .map((x) => {
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
      ) : (
        <div id={"knowledge-library-loading"}>
          <div className="loading">
            <LoadingOutlined spin /> Loading
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicView;
