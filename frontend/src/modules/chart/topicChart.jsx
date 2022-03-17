import React, { useState, useEffect } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import api from "../../utils/api";
import { orderBy } from "lodash";
import Chart from "../../utils/chart";

const TopicChart = ({
  height,
  defTopic,
  loadingId,
  popularTags,
  selectedTopic,
  setSelectedTopic,
  sortPopularTopic,
  setSortPopularTopic,
  handlePopularTopicChartClick,
}) => {
  useEffect(() => {
    setSelectedTopic(defTopic);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortPopularTopic]);
  useEffect(() => {
    api
      .get(`/tag/topic/popular`)
      .then((resp) => console.log(resp, "resp"))
      .catch((err) => {
        console.error(err);
      });
  }, []);
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
        if (tag === "climate change") {
          return "Climate Change";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="chart-wrapper">
      {sortPopularTopic.length !== 0 ? (
        <Chart
          key="popular-topic"
          title=""
          type="TREEMAP"
          height={height}
          className="popular-topic-chart"
          data={sortPopularTopic
            .filter((tag) => tag.count > 0)
            .map((x) => {
              return {
                id: x?.id,
                name: x?.topic,
                value: x?.count > 100 ? x?.count : x?.count + 50,
                count: x?.count,
                tag: x?.tag,
              };
            })}
          onEvents={{
            click: (e) => handlePopularTopicChartClick(e),
          }}
          selected={selectedTopic}
        />
      ) : (
        <div id={loadingId}>
          <div className="loading">
            <LoadingOutlined spin /> Loading
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicChart;
