import { Easing, Color, TextStyle, backgroundColor } from "./chart-style.js";
import _ from "lodash";
import uniq from "lodash/uniq";
import sortBy from "lodash/sortBy";

const BarGroup = (data, extra, axis) => {
  if (!data) {
    return {
      title: {
        text: "No Data",
        subtext: "",
        left: "center",
        top: "20px",
        ...TextStyle,
      },
    };
  }
  let yAxis = uniq(data.map((x) => x.group));
  let legends = uniq(data.map((x) => x.name));
  let series = _.chain(data)
    .groupBy("name")
    .map((x, i) => {
      return {
        name: i,
        label: {
          show: true,
          position: "inside",
          textStyle: { ...TextStyle.textStyle, color: "#FFF" },
        },
        type: "bar",
        barWidth: 100 / x.length,
        data: x.map((v) => v.value),
      };
    })
    .value();
  series = sortBy(series, "name");
  let option = {
    ...Color,
    legend: {
      data: sortBy(legends),
      icon: "circle",
      top: "0px",
      left: "center",
      align: "auto",
      orient: "horizontal",
      textStyle: {
        fontFamily: "Open Sans",
        fontWeight: "bold",
        fontSize: 12,
      },
    },
    grid: {
      top: "50px",
      left: "100px",
      right: axis ? "25px" : "auto",
      bottom: axis ? "75px" : "25px",
      borderColor: "#ddd",
      borderWidth: 0.5,
      show: true,
      label: {
        color: "#222",
        fontFamily: "Open Sans",
      },
    },
    tooltip: {
      trigger: "item",
      formatter: "{a}: {c}",
      backgroundColor: "#ffffff",
      ...TextStyle,
    },
    toolbox: { show: false },
    yAxis: [
      {
        data: yAxis,
        type: "category",
        nameLocation: "center",
        axisLine: {
          lineStyle: {
            color: "#ddd",
          },
        },
        axisLabel: {
          fontFamily: "Open Sans",
          fontSize: 12,
          color: "#222",
        },
      },
    ],
    xAxis: {
      name: axis ? axis?.xAxis : "",
      nameLocation: "center",
      nameGap: axis ? 50 : 0,
      type: "value",
      axisLabel: {
        inside: false,
        backgroundColor: "#f2f2f2",
        padding: 5,
        fontFamily: "Open Sans",
        fontSize: 12,
      },
      axisLine: { show: false },
    },
    series: series,
    ...Color,
    ...backgroundColor,
    ...Easing,
    ...extra,
  };
  return option;
};

export default BarGroup;
