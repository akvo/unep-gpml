import {
  Color,
  Easing,
  Legend,
  TextStyle,
  backgroundColor,
  PieChartColor,
} from "./chart-style.js";
import sumBy from "lodash/sumBy";

const Pie = (data, extra, Doughnut = false) => {
  data = !data ? [] : data;
  let total = { name: "total", value: 0 };
  let labels = [];
  if (data.length > 0) {
    data = data.map((x) => {
      let n = x.name.split("(")[0];
      if (x.name.toLowerCase() === "pending") {
        return {
          ...x,
          name: n,
          itemStyle: {
            color: "transparent",
            borderType: "dashed",
            borderColor: "#000",
          },
        };
      }
      return {
        ...x,
        name: n,
      };
    });
    // filter value < 0
    data = data.filter((x) => x.value >= 0);
    labels = data.map((x) => x.name);
    total = {
      ...total,
      value: sumBy(data, "value"),
    };
  }
  let rose = {};
  const { textStyle } = TextStyle;
  let option = {
    tooltip: {
      show: true,
      trigger: "item",
      formatter: "{b}",
      padding: 5,
      position: "top",
      backgroundColor: "#f2f2f2",
      textStyle: {
        ...textStyle,
        fontSize: 12,
      },
    },
    series: [
      {
        name: "main",
        type: "pie",
        right: "center",
        radius: Doughnut ? ["0%", "100%"] : ["50%", "100%"],
        top: "130px",
        // top: "30px",
        label: {
          normal: {
            formatter: function (params) {
              if (params.percent >= 0) {
                return Math.round(params.percent) + "%";
              }
              return "";
            },
            show: true,
            position: Doughnut ? "inner" : "outside",
            padding: 5,
            borderRadius: 100,
            backgroundColor: Doughnut ? "rgba(0,0,0,.5)" : "rgba(0,0,0,.3)",
            textStyle: {
              ...textStyle,
              color: "#fff",
            },
          },
          emphasis: {
            position: "center",
            show: true,
            padding: 5,
            borderRadius: 100,
            backgroundColor: "#f2f2f2",
            textStyle: textStyle,
          },
        },
        labelLine: {
          normal: {
            show: true,
          },
        },
        data: data,
        ...rose,
      },
      {
        data: [total],
        type: "pie",
        right: "center",
        radius: Doughnut ? ["0%", "0%"] : ["0%", "40%"],
        color: ["#f1f1f5"],
        top: "30px",
        label: {
          normal: {
            formatter: function (params) {
              let values = params.data.value;
              return `Total\n${values}`;
            },
            show: !Doughnut,
            position: "center",
            textStyle: {
              ...textStyle,
              fontSize: 16,
              backgroundColor: "transparent",
              padding: 0,
              borderRadius: 0,
              fontWeight: "bold",
              color: "#333433",
            },
          },
        },
      },
    ],
    legend: {
      data: labels.filter((l) => l.toLowerCase() !== "pending"),
      ...Legend,
      orient:
        labels.includes("Pending") || labels.includes("Achieved")
          ? "horizontal"
          : "vertical",
      x:
        labels.includes("Pending") || labels.includes("Achieved")
          ? "center"
          : "left",
      y: "top",
    },
    // ...Color,
    ...PieChartColor,
    ...backgroundColor,
    ...Easing,
    ...extra,
  };
  return option;
};

export default Pie;
