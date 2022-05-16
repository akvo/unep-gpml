import React from "react";
import { LoadingOutlined } from "@ant-design/icons";
import Chart from "../../utils/chart";
import { titleCase } from "../../utils/string";

const TopicChart = ({
  height,
  wrapperHeight,
  loadingId,
  selectedTopic,
  sortedPopularTopics,
  handlePopularTopicChartClick,
}) => {
  return (
    <div
      className="chart-wrapper"
      style={{ width: "100%", height: wrapperHeight }}
    >
      {sortedPopularTopics.length !== 0 ? (
        <Chart
          key="popular-topic"
          title=""
          type="TREEMAP"
          height={height}
          className="popular-topic-chart"
          data={sortedPopularTopics.map((x) => {
            return {
              id: x?.id,
              name: titleCase(x?.topic),
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
