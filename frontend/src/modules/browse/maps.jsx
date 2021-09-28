import React, { useState, useEffect, Fragment } from "react";
import {
  ZoomableGroup,
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import { scaleQuantize } from "d3-scale";
import { Tooltip, Button } from "antd";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
} from "@ant-design/icons";
import { PatternLines } from "@vx/pattern";
import { topicNames, tTypes } from "../../utils/misc";

const geoUrl = "/unep-gpml.topo.json";
const lineBoundaries = "/new_country_line_boundaries.geojson";
const colorRange = ["#bbedda", "#a7e1cb", "#92d5bd", "#7dcaaf", "#67bea1"];
const { innerWidth, innerHeight } = window;
const unsettledTerritoryIsoCode = [
  "xJL",
  "xAB",
  "xAC",
  "xJK",
  "xPI",
  "xSI",
  "xSR",
  "xxx",
];

const higlightColor = "#84b4cc";

const ToolTipContent = ({ data, geo }) => {
  return (
    <div key={`${geo.ISO3CD}-tooltip`} className="map-tooltip">
      <h3>{geo.MAP_LABEL}</h3>
      <ul>
        {tTypes.map((topic) => (
          <li key={topic}>
            <span>{topicNames(topic)}</span>
            <b>{data?.[topic] ? data[topic] : 0}</b>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Legend = ({ data, setFilterColor, selected }) => {
  data = Array.from(new Set(data.map((x) => Math.floor(x))));
  data = data.filter((x) => x !== 0);
  const range = data.map((x, i) => (
    <div
      key={`legend-${i + 1}`}
      className={
        "legend" +
        (selected !== null && selected === colorRange[i]
          ? " legend-selected"
          : "")
      }
      onClick={(e) => {
        selected === null
          ? setFilterColor(colorRange[i])
          : selected === colorRange[i]
          ? setFilterColor(null)
          : setFilterColor(colorRange[i]);
      }}
      style={{
        backgroundColor:
          colorRange[i] === selected ? higlightColor : colorRange[i],
      }}
    >
      {i === 0 && x === 1 ? x : i === 0 ? "1 - " + x : data[i - 1] + " - " + x}
    </div>
  ));
  if (data.length) {
    return (
      <div className="legends">
        {[
          <div
            key={"legend-0"}
            className={
              "legend" +
              (selected !== null && selected === "#fff"
                ? " legend-selected"
                : "")
            }
            style={{
              backgroundColor: "#fff" === selected ? higlightColor : "#fff",
            }}
            onClick={(e) => {
              selected === null
                ? setFilterColor("#fff")
                : selected === "#fff"
                ? setFilterColor(null)
                : setFilterColor("#fff");
            }}
          >
            0
          </div>,
          ...range,
          <div
            key={"legend-last"}
            className={
              "legend" +
              (selected !== null && selected === colorRange[range.length]
                ? " legend-selected"
                : "")
            }
            style={{
              backgroundColor:
                colorRange[range.length] === selected
                  ? higlightColor
                  : colorRange[range.length],
            }}
            onClick={(e) => {
              selected === null
                ? setFilterColor(colorRange[range.length])
                : selected === colorRange[range.length]
                ? setFilterColor(null)
                : setFilterColor(colorRange[range.length]);
            }}
          >
            {"> "}
            {data[data.length - 1]}
          </div>,
        ]}
      </div>
    );
  }
  return "";
};

const Maps = ({ data, topic, clickEvents, country }) => {
  const mapMaxZoom = 4;
  const [selected, setSelected] = useState(null);
  const [filterColor, setFilterColor] = useState(null);
  const [content, setContent] = useState("");
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
  const [scale, setScale] = useState(170);
  const [mapPos, setMapPos] = useState({
    left: 0,
    right: innerWidth,
    height: 0,
    width: 0,
  });

  const handleResize = () => {
    const box = document.getElementsByClassName("map-overlay");
    const isMobileScreen = innerWidth <= 991;
    if (box.length === 1) {
      // 0.03 same as .ui.container size on container.scss for each screen size
      const left = isMobileScreen
        ? innerWidth * 0.03
        : box[0].offsetLeft + box[0].offsetWidth;
      const right = isMobileScreen ? innerWidth * 0.03 : box[0].offsetLeft;
      const height = box[0].offsetHeight;
      const width = isMobileScreen
        ? innerWidth - (left + right)
        : innerWidth - (box[0].offsetLeft * 2 + box[0].offsetWidth);
      setMapPos({
        left: left,
        right: right,
        height: height,
        width: width,
      });
      if (innerWidth >= 1600) {
        setScale(210);
      }
    }
  };

  window.addEventListener("resize", handleResize);

  useEffect(() => {
    handleResize();
  }, [data]);

  const domain = data.reduce(
    (acc, curr) => {
      const v = curr[topic];
      const [min, max] = acc;
      return [min, v > max ? v : max];
    },
    [0, 0]
  );

  const colorScale = scaleQuantize().domain(domain).range(colorRange);

  const fillColor = (v) => {
    const color = v === 0 ? "#fff" : colorScale(v);
    if (filterColor !== null) {
      return filterColor === color ? higlightColor : color;
    }
    return color;
  };

  return (
    <div
      style={{
        overflow: "hidden",
        position: "relative",
        width: "auto",
        marginRight: `${mapPos.right}px`,
        marginLeft: `${mapPos.left}px`,
        height: `${mapPos.height}px`,
      }}
    >
      <Legend
        data={colorScale.thresholds()}
        setFilterColor={setFilterColor}
        selected={filterColor}
      />
      <div className="map-buttons">
        <Tooltip title="zoom out">
          <Button
            type="secondary"
            icon={<ZoomOutOutlined />}
            onClick={() => {
              position.zoom > 1 &&
                setPosition({ ...position, zoom: position.zoom - 0.5 });
            }}
            disabled={position.zoom <= 1}
          />
        </Tooltip>
        <Tooltip title="zoom in">
          <Button
            disabled={position.zoom >= mapMaxZoom}
            type="secondary"
            icon={<ZoomInOutlined />}
            onClick={() => {
              setPosition({ ...position, zoom: position.zoom + 0.5 });
            }}
          />
        </Tooltip>
        <Tooltip title="reset zoom">
          <Button
            type="secondary"
            icon={<FullscreenOutlined />}
            onClick={() => {
              setPosition({ coordinates: [0, 0], zoom: 1 });
            }}
          />
        </Tooltip>
      </div>
      <ComposableMap
        data-tip=""
        projection="geoEquirectangular"
        projectionConfig={{ scale: scale }}
        width={mapPos.width}
        height={mapPos.height}
        style={{ position: "absolute" }}
      >
        <ZoomableGroup
          maxZoom={mapMaxZoom}
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={(x) => {
            setPosition(x);
          }}
        >
          <Geographies key="map-geo" geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const curr = data.find(
                  (i) => i.countryId === Number(geo.properties.M49Code)
                );
                const isLake = typeof geo.properties?.ISO3CD === "undefined";
                const isUnsettled = unsettledTerritoryIsoCode.includes(
                  geo.properties.MAP_COLOR
                );
                const isPattern = geo.properties.MAP_COLOR === "xAC";

                let pattern = "";
                if (geo.properties.MAP_COLOR === "CHN") {
                  pattern = (
                    <PatternLines
                      key={`${geo.rsmKey}-pattern`}
                      id="lines"
                      height={2.5}
                      width={2.5}
                      stroke="#cecece"
                      strokeWidth={0.8}
                      background={
                        country?.isoCode === geo.properties.MAP_COLOR
                          ? "#84b4cc"
                          : geo.properties.MAP_COLOR === selected
                          ? "#84b4cc"
                          : fillColor(curr ? curr[topic] : 0)
                      }
                      orientation={["diagonal"]}
                    />
                  );
                }
                return (
                  <Fragment key={`${geo.rsmKey}-geo-fragment`}>
                    {pattern}
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      stroke="#79B0CC"
                      strokeWidth="0.2"
                      strokeOpacity="0.8"
                      cursor={!isLake ? "pointer" : ""}
                      fill={
                        isLake
                          ? "#eaf6fd"
                          : isUnsettled && !isPattern
                          ? "#cecece"
                          : isPattern
                          ? "url(#lines)"
                          : country?.isoCode === geo.properties.MAP_COLOR
                          ? "#84b4cc"
                          : selected
                          ? geo.properties.MAP_COLOR === selected
                            ? "#84b4cc"
                            : fillColor(curr ? curr[topic] : 0)
                          : fillColor(curr ? curr[topic] : 0)
                      }
                      onMouseEnter={() => {
                        const { MAP_LABEL, MAP_COLOR } = geo.properties;
                        if (!isLake && MAP_LABEL !== null) {
                          setSelected(MAP_COLOR);
                          setContent(
                            <ToolTipContent data={curr} geo={geo.properties} />
                          );
                        }
                      }}
                      onMouseLeave={() => {
                        setContent("");
                        setSelected(null);
                      }}
                      onClick={() => {
                        !isLake &&
                          !isUnsettled &&
                          clickEvents(geo.properties.M49Code);
                      }}
                    />
                  </Fragment>
                );
              })
            }
          </Geographies>
          <Geographies key="map-line" geography={lineBoundaries}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isDashed =
                  geo.properties?.Type &&
                  geo.properties?.Type.toLowerCase().includes("dashed");
                const isDotted =
                  geo.properties?.Type &&
                  geo.properties?.Type.toLowerCase().includes("dotted");
                const isContinuous =
                  geo.properties?.ISO3CD &&
                  geo.properties?.ISO3CD === "EGY_SDN";

                return (
                  <Geography
                    key={`${geo.rsmKey}-line`}
                    geography={geo}
                    stroke={isDashed || isDotted ? "#3080a8" : "#79B0CC"}
                    strokeDasharray={
                      isDashed ? "0.5" : isDotted ? "0.2" : "none"
                    }
                    strokeWidth={isDashed ? "0.3" : "0.2"}
                    strokeOpacity={
                      isDashed || isDotted || isContinuous ? "1" : "0.2"
                    }
                    fill="none"
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      <ReactTooltip type="light" className="opaque">
        {content}
      </ReactTooltip>
    </div>
  );
};
export default Maps;
