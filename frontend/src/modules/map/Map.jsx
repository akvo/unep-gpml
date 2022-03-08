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
  LoadingOutlined,
} from "@ant-design/icons";
import { PatternLines } from "@vx/pattern";
import { topicNames, tTypes } from "../../utils/misc";
import { curr } from "./utils";

import "./map-styles.scss";
import { useHistory } from "react-router-dom";
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

const higlightColor = "#255B87";
const KNOWLEDGE_LIBRARY = "/knowledge-library";
const STAKEHOLDER_OVERVIEW = "/stakeholder-overview";

const ToolTipContent = ({ data, geo, path }) => {
  const dataToDisplay = () => {
    if (path === KNOWLEDGE_LIBRARY) {
      return {
        project: data?.project,
        actionPlan: data?.actionPlan,
        policy: data?.policy,
        technicalResource: data?.technicalResource,
        financingResource: data?.financingResource,
        event: data?.event,
        technology: data?.technology,
      };
    } else {
      return {
        organisation: data?.organisation,
        stakeholder: data?.stakeholder,
      };
    }
  };

  return (
    <div key={`${geo.ISO3CD}-tooltip`} className="map-tooltip">
      <h3>{geo.MAP_LABEL}</h3>
      <ul>
        {tTypes.map((topic) => {
          const dataToDisplayPerPath = () => {
            if (path === KNOWLEDGE_LIBRARY) {
              return topic !== "organisation" && topic !== "stakeholder";
            } else {
              return (
                topic !== "project" &&
                topic !== "policy" &&
                topic !== "actionPlan" &&
                topic !== "financingResource" &&
                topic !== "technicalResource" &&
                topic !== "technology" &&
                topic !== "event"
              );
            }
          };

          return (
            dataToDisplayPerPath() && (
              <li key={topic}>
                <span>{topicNames(topic)}</span>
                <b>{dataToDisplay()?.[topic] ? dataToDisplay()?.[topic] : 0}</b>
              </li>
            )
          );
        })}
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

const Maps = ({
  box,
  query,
  data,
  topic,
  isLoaded,
  clickEvents,
  country,
  multiCountries,
  listVisible,
  isDisplayedList,
  isFilteredCountry,
  multiCountryCountries,
}) => {
  const history = useHistory();
  const path = history?.location?.pathname;
  const mapMaxZoom = 9.2;
  const mapMinZoom = 1.1500000000000024;
  const [selected, setSelected] = useState(null);
  const [filterColor, setFilterColor] = useState(null);
  const [content, setContent] = useState("");

  const [position, setPosition] = useState({
    coordinates: [18.297325014768123, 2.4067378816508587],
    zoom: mapMinZoom,
  });

  const [mapPos, setMapPos] = useState({
    left: 0,
    right: 0,
    height: 0,
    width: 0,
  });

  const handleResize = () => {
    if (box.length) {
      setMapPos({
        left: 0,
        right: 0,
        height: innerHeight + innerHeight / 1.5,
        width: box[0].offsetWidth / 4,
      });
    }
  };

  useEffect(() => {
    handleResize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const domain = data.reduce(
    (acc, curr) => {
      const sumValues = (obj) => Object.values(obj).reduce((a, b) => a + b);
      const values = () => {
        if (path === KNOWLEDGE_LIBRARY) {
          return sumValues({
            actionPlan: curr?.actionPlan,
            event: curr?.event,
            financingResource: curr?.financingResource,
            policy: curr?.policy,
            project: curr?.project,
            technicalResource: curr?.technicalResource,
            technology: curr?.technology,
          });
        }
        if (path === STAKEHOLDER_OVERVIEW) {
          return sumValues({
            organisation: curr?.organisation,
            stakeholder: curr?.stakeholder,
          });
        }
      };

      const [min, max] = acc;
      return [min, values() > max ? values() : max];
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
    <div id="map-landing">
      <div className="landing-container map-container">
        {!isLoaded() && (
          <h2 className="loading" id="map-loader">
            <LoadingOutlined spin /> Loading
          </h2>
        )}
        <div
          style={{
            overflow: "hidden",
            width: "auto",
            height: `${mapPos.height}px`,
          }}
        >
          <Legend
            data={colorScale.thresholds()}
            setFilterColor={setFilterColor}
            selected={filterColor}
            isDisplayedList={isDisplayedList}
          />
          <div
            className="map-buttons"
            style={{ left: listVisible ? "10px" : "330px" }}
          >
            <Tooltip title="zoom out">
              <Button
                type="secondary"
                icon={<ZoomOutOutlined />}
                onClick={() => {
                  position.zoom > mapMinZoom &&
                    setPosition({
                      ...position,
                      zoom: position.zoom - 0.3,
                    });
                }}
                disabled={position.zoom <= mapMinZoom}
              />
            </Tooltip>
            <Tooltip title="zoom in">
              <Button
                disabled={position.zoom >= mapMaxZoom}
                type="secondary"
                icon={<ZoomInOutlined />}
                onClick={() => {
                  setPosition({
                    ...position,
                    zoom: position.zoom + 0.3,
                  });
                }}
              />
            </Tooltip>
            <Tooltip title="reset zoom">
              <Button
                type="secondary"
                icon={<FullscreenOutlined />}
                onClick={() => {
                  setPosition({
                    coordinates: [18.297325014768123, 2.4067378816508587],
                    zoom: mapMinZoom,
                  });
                }}
              />
            </Tooltip>
          </div>
          <ComposableMap
            data-tip=""
            projection="geoEquirectangular"
            style={{ height: "auto" }}
          >
            <ZoomableGroup
              minZoom={mapMinZoom}
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
                    const findData = data.find(
                      (i) => i.countryId === Number(geo.properties.M49Code)
                    );

                    const isLake =
                      typeof geo.properties?.ISO3CD === "undefined";
                    const isUnsettled = unsettledTerritoryIsoCode.includes(
                      geo.properties.MAP_COLOR
                    );
                    const isPattern = geo.properties.MAP_COLOR === "xAC";
                    const isCountrySelected =
                      country?.isoCode === geo.properties.MAP_COLOR ||
                      multiCountries
                        .map((x) => x.isoCode)
                        .includes(geo.properties.MAP_COLOR);

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
                            isCountrySelected
                              ? "#255B87"
                              : geo.properties.MAP_COLOR === selected
                              ? "#255B87"
                              : fillColor(
                                  curr(topic, findData, path)
                                    ? curr(topic, findData, path)
                                    : 0
                                )
                          }
                          orientation={["diagonal"]}
                        />
                      );
                    }

                    // To get all countries in a multicountry selection being highlighted
                    const filterMultiCountry =
                      path === KNOWLEDGE_LIBRARY &&
                      multiCountryCountries.filter((item) => {
                        const transnationalQuery = query?.transnational?.map(
                          (item) => Number(item)
                        );
                        return transnationalQuery?.includes(item?.id);
                      });

                    const multiCountrySelection =
                      path === KNOWLEDGE_LIBRARY &&
                      filterMultiCountry.map((transnational) =>
                        transnational?.countries?.map((country) => country?.id)
                      );

                    const multiselection =
                      path === KNOWLEDGE_LIBRARY &&
                      multiCountrySelection.length !== 0 &&
                      multiCountrySelection.flat();

                    const selectionCondition = () => {
                      const mapProps = Number(geo.properties.M49Code);

                      if (
                        typeof isFilteredCountry === "string" ||
                        typeof isFilteredCountry === "number"
                      ) {
                        return Number(isFilteredCountry) === Number(mapProps);
                      } else {
                        const countryToFilter = isFilteredCountry.map((it) =>
                          Number(it)
                        );

                        return (
                          countryToFilter.includes(mapProps) ||
                          (path === KNOWLEDGE_LIBRARY &&
                            multiselection &&
                            multiselection.includes(mapProps))
                        );
                      }
                    };

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
                              : isCountrySelected
                              ? "#255B87"
                              : selected
                              ? geo.properties.MAP_COLOR === selected ||
                                selectionCondition()
                                ? "#255B87"
                                : fillColor(
                                    curr(topic, findData, path)
                                      ? curr(topic, findData, path)
                                      : 0
                                  )
                              : fillColor(
                                  curr(topic, findData, path)
                                    ? curr(topic, findData, path)
                                    : 0
                                )
                              ? selectionCondition()
                                ? "#255B87"
                                : fillColor(
                                    curr(topic, findData, path)
                                      ? curr(topic, findData, path)
                                      : 0
                                  )
                              : fillColor(
                                  curr(topic, findData, path)
                                    ? curr(topic, findData, path)
                                    : 0
                                )
                          }
                          onMouseEnter={() => {
                            const { MAP_LABEL, MAP_COLOR } = geo.properties;
                            if (!isLake && MAP_LABEL !== null) {
                              setSelected(MAP_COLOR);
                              setContent(
                                <ToolTipContent
                                  data={findData}
                                  geo={geo.properties}
                                  path={path}
                                />
                              );
                            }
                          }}
                          onMouseLeave={() => {
                            setContent("");
                            setSelected(null);
                          }}
                          onClick={() => {
                            if (path === KNOWLEDGE_LIBRARY) {
                              !multiCountrySelection
                                .flat()
                                .includes(Number(geo.properties.M49Code)) &&
                                !isLake &&
                                !isUnsettled &&
                                clickEvents(geo.properties.M49Code);
                            } else {
                              !isLake &&
                                !isUnsettled &&
                                clickEvents(geo.properties.M49Code);
                            }
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
      </div>
    </div>
  );
};
export default Maps;
