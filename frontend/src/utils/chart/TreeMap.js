import { Easing, backgroundColor } from "./chart-style.js";

const TreeMap = (data, extra, selected) => {
  let color = [
    "#3AB99F",
    "#3DC1A9",
    "#4DC9B5",
    "#66D0BF",
    "#8CDCCF",
    "#94DED2",
    "#A6E4DA",
    "#D8F3EF",
    "#CCEFEA",
  ];
  let rich = {
    name: {
      fontSize: 15,
      fontWeight: "bold",
    },
    value: {
      fontSize: 13,
      fontWeight: "bold",
      backgroundColor: "#fff",
      opacity: 0.9,
      padding: 8,
      borderRadius: 50,
    },
  };
  data = !data ? [] : data;
  data = data.map((x, i) => {
    if (x.name.toLowerCase() === selected) {
      color[i] = "#FFB800";
      return {
        ...x,
        label: {
          color: "#384E85",
          rich: {
            ...rich,
            value: {
              ...rich.value,
              color: "#FFB800",
            },
          },
        },
      };
    }
    return {
      ...x,
      label: {
        color: "#fff",
        rich: {
          ...rich,
          value: {
            ...rich.value,
            color: "#384E85",
          },
        },
      },
    };
  });
  let option = {
    color: color,
    tooltip: {
      show: false,
      trigger: "item",
      formatter: "{b}",
      padding: 5,
      backgroundColor: "#f2f2f2",
    },
    series: [
      {
        data: data,
        type: "treemap",
        leafDepth: 1,
        roam: false,
        width: "100%",
        height: "100%",
        nodeClick: false,
        colorMappingBy: "index",
        breadcrumb: false,
        label: {
          formatter: ["{name|{b}}", "{value|{c}}"].join("\n\n"),
          show: true,
          fontFamily: "Roboto",
          position: "inside",
          align: "center",
          verticalAlign: "center",
          padding: [50, 0],
        },
      },
    ],
    ...backgroundColor,
    ...Easing,
    ...extra,
  };
  return option;
};

export default TreeMap;
