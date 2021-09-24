import {
  Easing,
  backgroundColor,
  Color,
  singleColor,
  fontFamily,
} from "./chart-style.js";

const TreeMap = (data, extra, selected) => {
  console.log(window.innerWidth);
  const { blue, yellow, white } = singleColor;
  const itemStyle = {
    borderColor: white,
    borderWidth: 2,
  };
  let rich = {
    name: {
      ...fontFamily,
      lineHeight: 15,
      fontSize: 12,
      fontWeight: "bold",
    },
    value: {
      ...fontFamily,
      fontSize: 12,
      fontWeight: "bold",
      backgroundColor: white,
      opacity: 0.95,
      padding: 10,
      borderRadius: 50,
      width: 15,
      height: 15,
    },
  };
  data = !data ? [] : data;
  data = data.map((x, i) => {
    if (x.name.toLowerCase() === selected) {
      return {
        ...x,
        label: {
          color: blue,
          rich: {
            ...rich,
            value: {
              ...rich.value,
              color: yellow,
            },
          },
        },
        itemStyle: {
          color: yellow,
          ...itemStyle,
        },
      };
    }
    return {
      ...x,
      label: {
        color: white,
        rich: {
          ...rich,
          value: {
            ...rich.value,
            color: blue,
          },
        },
      },
      itemStyle: {
        ...itemStyle,
      },
    };
  });
  let option = {
    ...Color,
    tooltip: {
      show: false,
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
        squareRatio:
          0.5 * (0.5 + Math.sqrt(window.innerWidth / window.innerHeight)),
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
          ...fontFamily,
          position: "inside",
          align: "center",
          verticalAlign: "middle",
          padding: [18, 0],
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
