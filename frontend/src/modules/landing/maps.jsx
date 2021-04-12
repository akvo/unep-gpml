import { useState, useEffect } from "react";
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
import { topicNames, tTypes } from "../../utils/misc";

const geoUrl = "/unep-gpml.topo.json";
const colorRange = ["#bbedda", "#a7e1cb", "#92d5bd", "#7dcaaf", "#67bea1"];
const { innerWidth, innerHeight } = window;

const ToolTipContent = ({ data, geo }) => {
  return (
    <div className="map-tooltip">
      <h3>{geo.MAPLAB}</h3>
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

const Legend = ({ data }) => {
  const range = data.map((x, i) => (
    <div
      key={i + 1}
      className="legend"
      style={{ backgroundColor: colorRange[i] }}
    >
      {i === data.length - 1 && "> "}
      {Math.floor(x)} {i !== data.length - 1 && " - " + Math.floor(data[i + 1])}
    </div>
  ));
  return (
    <div className="legends">
      {[
        <div key={0} className="legend" style={{ backgroundColor: "#FFF" }}>
          {"0"} - {Math.floor(data[0])}
        </div>,
        ...range,
      ]}
    </div>
  );
};

const Maps = ({ data, topic, clickEvents, country }) => {
  const [selected, setSelected] = useState(null);
  const [content, setContent] = useState("");
  const [zoom, setZoom] = useState(1);
  const [scale, setScale] = useState(170);
  const [mapPos, setMapPos] = useState({
    left: 0,
    right: innerWidth,
    height: 0,
    width: 0,
  });

  const handleResize = () => {
    const box = document.getElementsByClassName("map-overlay");
    if (box.length === 1) {
      const width = innerWidth - (box[0].offsetLeft * 2 + box[0].offsetWidth);
      const left =
        innerWidth >= 768 && innerWidth <= 991
          ? 23
          : box[0].offsetLeft + box[0].offsetWidth;
      const right =
        innerWidth >= 768 && innerWidth <= 991 ? 50 : box[0].offsetLeft;
      const height =
        innerWidth >= 768 && innerWidth <= 991 ? 500 : box[0].offsetHeight;
      setMapPos({
        left: left,
        right: right,
        height: height,
        width: width,
      });
      if (innerWidth >= 1600) setScale(210);
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
    return v === 0 ? "#fff" : colorScale(v);
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
      <Legend data={colorScale.thresholds()} />
      <div className="map-buttons">
        <Tooltip title="zoom out">
          <Button
            type="secondary"
            icon={<ZoomOutOutlined />}
            onClick={() => {
              zoom > 1 && setZoom(zoom - 0.5);
            }}
            disabled={zoom <= 1}
          />
        </Tooltip>
        <Tooltip title="zoom in">
          <Button
            type="secondary"
            icon={<ZoomInOutlined />}
            onClick={() => {
              setZoom(zoom + 0.5);
            }}
          />
        </Tooltip>
        <Tooltip title="reset zoom">
          <Button
            type="secondary"
            icon={<FullscreenOutlined />}
            onClick={() => {
              setZoom(1);
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
        <ZoomableGroup zoom={zoom}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const curr = data.find(
                  (i) => i.isoCode === geo.properties.MAPCLR
                );

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    stroke="#79B0CC"
                    strokeWidth="0.2"
                    strokeOpacity="0.5"
                    cursor="pointer"
                    fill={
                      country?.isoCode === geo.properties.MAPCLR
                        ? "#84b4cc"
                        : selected
                        ? geo.properties.MAPCLR === selected
                          ? "#84b4cc"
                          : fillColor(curr ? curr[topic] : 0)
                        : fillColor(curr ? curr[topic] : 0)
                    }
                    onMouseEnter={() => {
                      const { MAPLAB, MAPCLR } = geo.properties;
                      setSelected(MAPCLR);
                      setContent(
                        <ToolTipContent data={curr} geo={geo.properties} />
                      );
                    }}
                    onMouseLeave={() => {
                      setContent("");
                      setSelected(null);
                    }}
                    onClick={() => {
                      clickEvents(geo.properties.MAPCLR);
                    }}
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
