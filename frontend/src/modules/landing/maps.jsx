import echarts from "echarts";
import React, { useEffect, useState } from "react";
import ReactEcharts from "echarts-for-react";
import Chart from "../../utils/charts";
import cloneDeep from "lodash/cloneDeep";
require("../../utils/charts/map-init.js");

const colors = [
  "#bbedda",
  "#a7e1cb",
  "#92d5bd",
  "#7dcaaf",
  "#67bea1",
  "#50b293",
  "#35a785",
  "#039B78",
];

const generateSteps = (arr, leftPos) => {
  const datarange = cloneDeep(Chart.Opt.Maps.DataRange);
  if (arr.length === 0) {
    return false;
  }
  arr = arr.map((x) => x.value);
  const asc = (arr) => arr.sort((a, b) => a - b);
  const quantile = (arr, q) => {
    const sorted = asc(arr);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    return sorted[base + 1] !== undefined
      ? sorted[base] + rest * sorted[base + 1] - sorted[base]
      : sorted[base];
  };
  const bottom = quantile(arr, 0.2);
  const step = (quantile(arr, 1) - bottom) / 5;
  const log10 = Math.ceil(
    Math.round((100 * Math.log(step)) / Math.log(10)) / 100
  );
  const max = Math.round(bottom + step * 3, step, Math.pow(10, log10));
  let steps = [
    Math.round(bottom, step, Math.pow(10, log10)),
    Math.round(bottom + step, step, Math.pow(10, log10)),
    Math.round(bottom + step * 2, step, Math.pow(10, log10)),
    max,
  ];
  steps = steps.map((x, i) => {
    if (x < 1) {
      return false;
    }
    if (steps[i - 1] === 1) {
      return { start: 0, end: x };
    }
    if (i === 0) {
      return { start: 1, end: x };
    }
    const start = steps[i - 1];
    return { start: start || 1, end: x };
  });
  steps = [...steps.filter((x) => x), { start: max, label: `${max}  >` }];
  steps = steps.map((x, i) => ({ symbol: "rect", color: colors[i], ...x }));
  datarange.dataRange.splitList = steps;
  datarange.dataRange.left = leftPos + 10;
  return datarange;
};

const generateOptions = (title, subtitle, data, tooltip, mapPos, init) => {
  let steps = data.length > 1 ? generateSteps(data, mapPos.left) : {};
  if (data.length === 1) {
    data = [
      {
        name: data[0].name,
        itemStyle: { areaColor: "#84b4cc" },
      },
    ];
  }
  const toolbox = {
    ...Chart.Opt.Maps.ToolBox.toolbox,
    left: mapPos.left + 10,
    top: 0,
  };
  return {
    title: {
      text: title,
      left: "center",
      top: "20px",
      subtext: subtitle,
      ...Chart.Style.Text,
    },
    tooltip: Chart.Opt.Maps.ToolTip(tooltip),
    backgroundColor: "#EAF6FD",
    legend: { show: false },
    series:
      mapPos.left === 0
        ? []
        : [
            {
              name: title || "echart",
              type: "map",
              roam: "move",
              left: `${mapPos.left + 10}px`,
              right: `${mapPos.right - 10}px`,
              top: window.__UNEP__MAP__TOP + 10,
              map: "unep-map",
              aspectScale: 1,
              zoom: window.__UNEP__MAP__ZOOM,
              zLevel: 0,
              label: { show: false },
              symbolSyze: 0,
              emphasis: { label: { show: false } },
              itemStyle: {
                zlevel: 0,
                areaColor: "#fff",
                borderColor: "#79B0CC",
                emphasis: {
                  areaColor: "#84b4cc",
                  borderColor: "#FFFFFF",
                },
              },
              center: [0, 0],
              data: [...data, ...Chart.Opt.Maps.DisputedArea],
              showLegendSymbol: data.length === 1,
              animation: true,
              animationDelay: 1,
            },
          ],
    toolbox: toolbox,
    ...steps,
    ...Chart.Style.Text,
  };
};

const Maps = ({ dependency, title, subtitle, data, clickEvents, tooltip }) => {
  const { innerWidth, innerHeight } = window;
  const [mapPos, setMapPos] = useState({
    left: 0,
    right: innerWidth,
    height: 0,
  });
  const [option, setMapOption] = useState({});
  const [refMap, setRefMap] = useState(false);

  const handleResize = () => {
    const box = document.getElementsByClassName("map-overlay");
    if (box.length === 1) {
      const left =
        innerWidth >= 768 && innerWidth <= 991
          ? 20
          : box[0].offsetLeft + box[0].offsetWidth;
      const height =
        innerWidth >= 768 && innerWidth <= 991 ? 500 : box[0].offsetHeight;
      setMapPos({
        left: left,
        right: box[0].offsetLeft,
        height: height,
      });
    }
  };

  useEffect(() => {
    handleResize();
  }, [dependency]);

  window.addEventListener("resize", handleResize);

  const options = generateOptions(title, subtitle, data, tooltip, mapPos, true);

  const updateData = (props, add = false) => {
    const ref = refMap.getEchartsInstance();
    const opt = ref.getOption();
    let updated = data.map((x) => ({ ...x, selected: false }));
    if (data && add) {
      updated = data.map((x) => {
        if (props.data.sameIsoCodes.includes(x.name)) {
          return { ...x, selected: true };
        }
        return x;
      });
    }
    ref.setOption({ ...opt, series: [{ ...opt.series[0], data: updated }] });
  };

  const onMouseOut = (props) => {
    updateData(props);
  };

  const onMouseOver = (props) => {
    updateData(props, true);
  };

  return mapPos ? (
    <ReactEcharts
      ref={(e) => setRefMap(e)}
      className="fade-in worldmap"
      option={options}
      notMerge={true}
      style={{ height: `${mapPos.height}px`, width: "100%" }}
      lazyUpdate={false}
      onEvents={{
        click: clickEvents,
        mouseover: onMouseOver,
        mouseout: onMouseOut,
      }}
    />
  ) : (
    ""
  );
};

export default Maps;
