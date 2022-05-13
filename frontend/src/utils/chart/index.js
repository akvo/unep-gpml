import React from "react";
import { Col, Card } from "antd";
import ReactECharts from "echarts-for-react";
import Bar from "./bar";
import Pie from "./pie";
import BarStack from "./bar-stack";
import BarGroup from "./bar-group";
import LineStack from "./line-stack";
import Line from "./line";
import TreeMap from "./tree-map";
import { titleCase } from "../string";

export const generateOptions = ({ type, data }, extra, axis, selected) => {
  switch (type) {
    case "PIE":
      return Pie(data, extra);
    case "DOUGHNUT":
      return Pie(data, extra, true);
    case "BARSTACK":
      return BarStack(data, extra);
    case "BARGROUP":
      return BarGroup(data, extra, axis);
    case "LINE":
      return Line(data, extra);
    case "LINESTACK":
      return LineStack(data, extra);
    case "TREEMAP":
      return TreeMap(data, extra, selected);
    default:
      return Bar(data, extra);
  }
};

const Chart = ({
  type,
  title = "",
  height = 450,
  span = 12,
  data,
  extra = {},
  axis = null,
  onEvents = false,
  selected = false,
  className = "",
}) => {
  data = data.map((x) => ({
    ...x,
    name: x.name,
    var: x.name,
  }));
  const option = generateOptions(
    { type: type, data: data },
    extra,
    axis,
    selected
  );
  return (
    <ReactECharts
      className={className}
      option={option}
      style={{ height: height - 50, width: "100%" }}
      onEvents={onEvents}
    />
  );
};

export default Chart;
