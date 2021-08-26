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
      fontFamily: "Open Sans",
      lineHeight: 20,
      fontSize: 16,
      fontWeight: "bold",
    },
    value: {
      fontFamily: "Open Sans",
      fontSize: 15,
      fontWeight: "bold",
      backgroundColor: "#fff",
      opacity: 0.95,
      padding: 8,
      borderRadius: 50,
      width: 25,
      height: 25,
    },
  };
  data = !data ? [] : data;
  data = data.map((x, i) => {
    if (x.name.toLowerCase() === selected) {
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
        itemStyle: {
          color: "#FFB800",
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
          formatter: function (params) {
            const value = params.data.value;
            const name = params.data.name.split(" ");
            let nameTmp = [];
            if (name.length > 2) {
              nameTmp.push(name[0]);
              nameTmp.push(name[1]);
              nameTmp = [nameTmp.join(" ")];
              nameTmp.push(name[2]);
              nameTmp = nameTmp.join("\n");
            } else {
              nameTmp = name.join("\n");
            }
            return `{name|${nameTmp}}\n\n{value|${value}}`;
          },
          show: true,
          fontFamily: "Open Sans",
          position: "inside",
          align: "center",
          verticalAlign: "middle",
          padding: [25, 0],
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
