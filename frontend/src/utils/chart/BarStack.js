import { Easing, Color, TextStyle, backgroundColor } from "./chart-style.js";
import uniq from "lodash/uniq";
import _ from "lodash";

const BarStack = (data, extra) => {
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
  /* Custom Calculation */
  data = data.map((x) => {
    let val = x.value;
    if (val && x.var === "total_prod_cost") {
      val = 0 - val;
    }
    const net_income = data.find(
      (d) => d.var === "net_income" && d.group === x.group
    );
    if (val && x.var === "revenue" && net_income) {
      val = val - net_income.value;
    }
    return {
      ...x,
      value: val,
      actual_value: x.value,
    };
  });
  let living_income_benchmark = data.filter((x) => x.var === "living_income");
  /* End Custom Calculation */

  let xAxis = uniq(data.map((x) => x.group));
  let legends = uniq(data.map((x) => x.name));
  let series = _.chain(data)
    .filter((x) => x.var !== "living_income")
    .groupBy("name")
    .map((x, i) => {
      return {
        name: i,
        label: {
          show: true,
          position: "inside",
          formatter: (a) => {
            const curr = x.find((g) => g.group === a.name);
            if (curr.name === "Revenues from main crop" && curr?.actual_value) {
              return curr.actual_value;
            }
            if (curr.name === "Total Production Cost") {
              return -a.value;
            }
            return a.value;
          },
          textStyle: {
            color: "#FFF",
            fontFamily: "Open Sans",
            fontSize: "1rem",
            fontWeight: "bold",
          },
        },
        barWidth: 150,
        stack: "t",
        type: "bar",
        data: x.map((v) => v.value),
      };
    })
    .value();
  let guide = [];
  if (living_income_benchmark.length) {
    guide = living_income_benchmark.map((x, i) => {
      return {
        type: "line",
        markLine: {
          lineStyle: {
            type: "dashed",
            color: "red",
          },
          symbol: "circle",
          label: {
            show: true,
            position: i > 0 ? "insideMiddleBottom" : "insideStartTop",
            backgroundColor: "#f2f2f2",
            formatter: "{custom|{b}}",
            padding: 5,
            elipsis: "break",
            rich: {
              custom: {
                align: "center",
              },
            },
          },
          data: [{ name: `Living income @ ${x.group}`, yAxis: x.value }],
        },
      };
    });
  }
  let option = {
    ...Color,
    legend: {
      data: legends,
      icon: "circle",
      left: "center",
      itemGap: 10,
      align: "auto",
      orient: "horizontal",
      textStyle: {
        fontFamily: "Open Sans",
        fontWeight: "normal",
        fontSize: 12,
        marginLeft: 20,
      },
    },
    grid: {
      top: 50,
      left: "auto",
      right: "auto",
      bottom: "25px",
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
      formatter: (f) => {
        if (f.seriesName === "Revenues from main crop") {
          let revenue = data.find(
            (x) => x.var === "revenue" && x.group === f.name
          );
          return `${f.name}<br/>${f.seriesName}:<b>${revenue.actual_value}</b>`;
        }
        if (f?.seriesName) {
          return `${f.name}<br/>${f.seriesName}:<b>${f.value}</b>`;
        }
        return `${f.name}:<b>${f.value}</b>`;
      },
      backgroundColor: "#ffffff",
      ...TextStyle,
    },
    toolbox: { show: false },
    yAxis: [
      {
        type: "value",
        axisLabel: {
          inside: true,
          backgroundColor: "#f2f2f2",
          padding: 5,
          fontFamily: "Open Sans",
          fontSize: 12,
        },
        axisLine: {
          show: true,
        },
        minorTick: {
          show: true,
        },
        minorSplitLine: {
          show: true,
        },
      },
    ],
    xAxis: {
      data: xAxis,
      type: "category",
      axisLine: {
        lineStyle: {
          type: "dashed",
        },
        show: true,
      },
      axisLabel: {
        fontFamily: "Open Sans",
        fontSize: 12,
        color: "#222",
      },
    },
    series: [...series, ...guide],
    ...Color,
    ...backgroundColor,
    ...Easing,
    ...extra,
  };
  return option;
};

export default BarStack;
