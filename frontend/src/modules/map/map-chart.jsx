import React, { useState, useEffect, memo } from "react";
import {
  ZoomableGroup,
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { scaleQuantize } from "d3-scale";
import { geoCentroid } from "d3-geo";
import { Tooltip, Button } from "antd";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  DoubleRightOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { PatternLines } from "@vx/pattern";
import classNames from "classnames";
import { useHistory } from "react-router-dom";
import { isEmpty } from "lodash";

import { topicNames, tTypes } from "../../utils/misc";
import { curr, snakeToCamel } from "./utils";
import { UIStore } from "../../store";
import VerticalLegend from "./vertical-legend";
import { useDeviceSize } from "../landing/landing";

const geoUrl = "/unep-gpml.topo.json";
const colorRange = ["#bbedda", "#a7e1cb", "#92d5bd", "#7dcaaf", "#67bea1"];

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

const KNOWLEDGE_LIBRARY = "knowledge";
const STAKEHOLDER_OVERVIEW = "community";
const EXPERTS = "experts";

const MapChart = ({
  useTooltips,
  countData,
  stakeholderCount,
  box,
  isFilteredCountry,
  data,
  query,
  multiCountries,
  multiCountryCountries,
  clickEvents,
  setTooltipContent,
  listVisible,
  useVerticalLegend,
  isDisplayedList,
  countryGroupCounts,
  showLegend,
  zoom,
  path,
}) => {
  const { countries } = UIStore.useState((s) => ({
    countries: s.countries,
  }));

  const [width, height] = useDeviceSize();
  const history = useHistory();
  const mapMaxZoom = 9.2;
  const mapMinZoom = 1.1500000000000024;
  const [selected, setSelected] = useState(null);

  const [filterColor, setFilterColor] = useState(null);
  const [countryToSelect, setCountryToSelect] = useState([]);
  const [isShownLegend, setIsShownLegend] = useState(true);

  const resourceCount =
    path === KNOWLEDGE_LIBRARY &&
    countData.filter(
      (data) =>
        data.topic !== "gpml_member_entities" &&
        data.topic !== "capacity_building" &&
        data.topic !== "capacity building" &&
        data.topic !== "plastics" &&
        data.topic !== "waste management" &&
        data.topic !== "marine litter" &&
        data.topic !== "capacity building" &&
        data.topic !== "product by design" &&
        data.topic !== "source to sea"
    );

  const existingStakeholders =
    path === STAKEHOLDER_OVERVIEW &&
    stakeholderCount.existingStakeholder.map((data) => data?.networkType);

  const existingResources =
    path === KNOWLEDGE_LIBRARY ? resourceCount.map((data) => data.topic) : [];
  const existingData =
    path === KNOWLEDGE_LIBRARY
      ? existingResources
      : path === STAKEHOLDER_OVERVIEW
      ? existingStakeholders
      : path === EXPERTS
      ? ["experts"]
      : [];

  const country =
    !isEmpty(countries) &&
    countries.find((x) => {
      if (countryToSelect?.includes(x.id)) {
        return x;
      }
    });

  const [position, setPosition] = useState({
    coordinates: [18.297325014768123, 2.4067378816508587],
    zoom: mapMinZoom,
  });

  const viewport = width;

  const [mapPos, setMapPos] = useState({
    left: 0,
    right: 0,
    height: 0,
    width: 0,
  });

  useEffect(() => {
    viewport <= 511 &&
      setPosition({
        coordinates: [19.59386998380555, 14.140313719606274],
        zoom: 4.010087901870494,
      });
  }, [viewport]);

  const handleResize = () => {
    if (box.length) {
      setMapPos({
        left: 0,
        right: 0,
        height: height + height / 1.5,
        width: box[0].offsetWidth / 4,
      });
    }
  };
  useEffect(() => {
    setCountryToSelect(isFilteredCountry?.map((x) => Number(x)));
  }, [isFilteredCountry]);

  useEffect(() => {
    handleResize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const domain = data.reduce(
    (acc, curr) => {
      const sumValues = (obj) => Object.values(obj).reduce((a, b) => a + b);

      // Get properties based on filter
      const values = () => {
        const properties = existingData.map(snakeToCamel);

        const propsToSum = properties.reduce((acc, currs, index) => {
          const currProp = properties[index];

          acc[currProp] = curr.counts?.[currProp];

          if (currProp === "initiative") {
            return { ...acc, initiative: curr.counts?.["initiative"] || 0 };
          } else {
            return acc;
          }
        }, {});

        if (properties.length > 0) {
          return sumValues(propsToSum);
        } else {
          if (path === "/knowledge/library") {
            return sumValues({
              actionPlan: curr?.counts?.actionPlan,
              event: curr?.counts?.event,
              financingResource: curr?.counts?.financingResource,
              policy: curr?.counts?.policy,
              project: curr?.counts?.project,
              technicalResource: curr?.counts?.technicalResource,
              technology: curr?.counts?.technology,
              initiative: curr?.counts?.initiative || 0,
            });
          }
          if (path === "/connect/community") {
            return sumValues({
              stakeholder: curr?.counts?.stakeholder,
              organisation: curr?.counts?.organisation,
            });
          }
        }
      };

      const [min, max] = acc;
      return [
        min,
        values() > max
          ? values()
          : max === 2 || max === 1
          ? max + 0.5
          : max === 3
          ? max + 0.75
          : max,
      ];
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
  const legendTitle =
    path === KNOWLEDGE_LIBRARY
      ? "Total resources per country"
      : path === STAKEHOLDER_OVERVIEW
      ? "Total stakeholders per country"
      : "Total experts per country";
  return (
    <>
      {showLegend && (
        <div className="map-a11y">
          <div
            className="map-buttons"
            style={{ left: listVisible ? "10px" : "330px" }}
          >
            <Tooltip placement="left" title="zoom out">
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
            <Tooltip placement="left" title="zoom in">
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
            <Tooltip placement="left" title="reset zoom">
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
          <div
            className={classNames("legend-wrapper", {
              vertical: useVerticalLegend,
            })}
          >
            {isShownLegend && path !== EXPERTS && (
              <>
                {useVerticalLegend ? (
                  existingData.length !== 0 ? (
                    <VerticalLegend
                      data={colorScale.thresholds().sort((a, b) => b - a)}
                      contents={data}
                      setFilterColor={setFilterColor}
                      selected={filterColor}
                      isDisplayedList={isDisplayedList}
                      title={legendTitle}
                      path={path}
                      existingData={existingData}
                      countData={countData}
                      countryGroupCounts={countryGroupCounts}
                      stakeholderCount={stakeholderCount}
                    />
                  ) : (
                    <div className="no-legend-warning">No legend</div>
                  )
                ) : (
                  <Legend
                    data={colorScale.thresholds()}
                    setFilterColor={setFilterColor}
                    selected={filterColor}
                    isDisplayedList={isDisplayedList}
                  />
                )}
              </>
            )}
            <Tooltip placement="bottom" title={isShownLegend ? "Hide" : "Show"}>
              <Button
                className="legend-button"
                onClick={() => setIsShownLegend(!isShownLegend)}
              >
                {isShownLegend ? (
                  <DoubleRightOutlined />
                ) : (
                  <UnorderedListOutlined />
                )}
              </Button>
            </Tooltip>
          </div>
        </div>
      )}
      <ComposableMap data-tip="">
        <ZoomableGroup
          minZoom={mapMinZoom}
          maxZoom={mapMaxZoom}
          zoom={zoom ? zoom : position.zoom}
          center={position.coordinates}
          onMoveEnd={(x) => {
            setPosition(x);
          }}
          filterZoomEvent={(evt) => {
            return evt.type === "wheel" ? false : true;
          }}
        >
          <Geographies key="map-geo" geography={geoUrl}>
            {({ geographies }) => (
              <>
                {geographies.map((geo) => {
                  const findData = data?.find(
                    (i) => i?.countryId === Number(geo.properties.M49Code)
                  );

                  const isLake = typeof geo.properties?.ISO3CD === "undefined";
                  const isUnsettled = unsettledTerritoryIsoCode?.includes(
                    geo.properties.MAP_COLOR
                  );
                  const isPattern = geo.properties.MAP_COLOR === "xAC";
                  const isCountrySelected =
                    country?.isoCode === geo.properties.MAP_COLOR ||
                    multiCountries
                      ?.map((x) => x.isoCode)
                      .includes(geo.properties.MAP_COLOR);

                  // To get all countries in a multicountry selection being highlighted
                  const filterMultiCountry = multiCountryCountries?.filter(
                    (item) => {
                      const transnationalQuery = query?.transnational?.map(
                        (item) => Number(item)
                      );
                      return transnationalQuery?.includes(item?.id);
                    }
                  );

                  const multiCountrySelection = filterMultiCountry?.map(
                    (transnational) =>
                      transnational?.countries?.map((country) => country?.id)
                  );

                  const multiselection =
                    multiCountrySelection?.length !== 0 &&
                    multiCountrySelection?.flat();

                  const selectionCondition = () => {
                    const mapProps = Number(geo.properties.M49Code);

                    if (
                      typeof isFilteredCountry === "string" ||
                      typeof isFilteredCountry === "number"
                    ) {
                      return Number(isFilteredCountry) === Number(mapProps);
                    } else {
                      const countryToFilter = isFilteredCountry?.map((it) =>
                        Number(it)
                      );
                      return (
                        countryToFilter?.includes(mapProps) ||
                        (multiselection && multiselection.includes(mapProps))
                      );
                    }
                  };

                  return (
                    <Geography
                      key={geo.rsmKey}
                      className={!isLake && "svg-country"}
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
                          : geo.properties.M49Code === selected
                          ? "rgba(255, 184, 0, 0.65)"
                          : selectionCondition()
                          ? "#255B87"
                          : fillColor(
                              curr(findData?.counts, path, existingData)
                                ? curr(findData?.counts, path, existingData)
                                : 0
                            )
                      }
                      onMouseEnter={() => {
                        const { MAP_LABEL, M49Code } = geo.properties;
                        if (useTooltips && !isLake && MAP_LABEL !== null) {
                          if (path === STAKEHOLDER_OVERVIEW) {
                            setTooltipContent(
                              <StakeholderTooltipContent
                                data={findData}
                                geo={geo.properties}
                                existingStakeholders={existingStakeholders}
                                query={query}
                              />
                            );
                          }
                          if (path === KNOWLEDGE_LIBRARY) {
                            setTooltipContent(
                              <KnowledgeLibraryToolTipContent
                                data={findData}
                                geo={geo.properties}
                                existingResources={existingResources}
                                query={query}
                              />
                            );
                          }

                          if (path === EXPERTS) {
                            setTooltipContent(
                              <ExpertsTooltipContent
                                data={findData}
                                geo={geo.properties}
                                existingStakeholders={existingStakeholders}
                                query={query}
                              />
                            );
                          }
                        }
                      }}
                      onMouseLeave={() => {
                        if (useTooltips) {
                          setTooltipContent("");
                        }
                        // setSelected(null);
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
                  );
                })}
              </>
            )}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </>
  );
};

const StakeholderTooltipContent = ({
  data,
  geo,
  existingStakeholders,
  query,
}) => {
  const dataToDisplay = () => {
    return {
      organisation: data?.counts?.organisation,
      stakeholder: data?.counts?.stakeholder,
      nonMemberOrganisation: data?.counts?.nonMemberOrganisation,
    };
  };

  const transnationalData = () => {
    return {
      organisation: data?.transnationalCounts?.organisation,
      stakeholder: data?.transnationalCounts?.stakeholder,
      nonMemberOrganisation: data?.transnationalCounts?.nonMemberOrganisation,
    };
  };

  const transnationalMaxValue = Math.max
    .apply(null, Object.values(transnationalData()))
    .toString();

  const characterLength = transnationalMaxValue?.length;

  const stakeholderToDisplay =
    existingStakeholders?.length > 0
      ? existingStakeholders
      : query?.networkType;

  return (
    <div
      key={`${geo.ISO3CD}-tooltip`}
      style={{ paddingRight: `${(characterLength || 1) * 9}px` }}
      className="map-tooltip"
    >
      <h3>{geo.MAP_LABEL}</h3>
      <div className="tooltip-table">
        <div className="table-head">
          <div>
            <b className="stakeholder-type">Type</b>
          </div>
        </div>
        <div>
          {stakeholderToDisplay?.length === 0 ? (
            <>
              <div className="table-row">
                <div className="tooltip-topic">Entity</div>
                <div>
                  <div className="entity-row">
                    <b className="entity-type">GPML Members</b>
                    <div className="tooltip-count-wrapper">
                      <b className="tooltip-counts">
                        {dataToDisplay()?.["organisation"]
                          ? dataToDisplay()?.["organisation"]
                          : 0}
                      </b>
                    </div>
                  </div>
                  <div className="entity-row">
                    <b className="entity-type">GPML Non-Members</b>
                    <div className="tooltip-count-wrapper">
                      <b className="tooltip-counts">
                        {transnationalData()?.["nonMemberOrganisation"]
                          ? transnationalData()?.["nonMemberOrganisation"]
                          : 0}
                      </b>
                    </div>
                  </div>
                </div>
              </div>
              <div className="table-row">
                <div className="tooltip-topic">Individuals</div>

                <div className="tooltip-count-wrapper">
                  <b className="tooltip-counts">
                    {dataToDisplay()?.["stakeholder"]}
                  </b>
                </div>
              </div>
            </>
          ) : (
            <>
              {stakeholderToDisplay?.includes("organisation") && (
                <div className="table-row">
                  <div className="tooltip-topic">Entity</div>
                  <div>
                    <div className="entity-row">
                      <b className="entity-type">GPML Members</b>
                      <div className="tooltip-count-wrapper">
                        <b className="tooltip-counts">
                          {dataToDisplay()?.["organisation"]
                            ? dataToDisplay()?.["organisation"]
                            : 0}
                        </b>
                      </div>
                    </div>
                    <div className="entity-row">
                      <b className="entity-type">GPML Non-Members</b>
                      <div className="tooltip-count-wrapper">
                        <b className="tooltip-counts">
                          {transnationalData()?.["nonMemberOrganisation"]
                            ? transnationalData()?.["nonMemberOrganisation"]
                            : 0}
                        </b>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {stakeholderToDisplay?.includes("stakeholder") && (
                <div className="table-row">
                  <div className="tooltip-topic">Individuals</div>

                  <div className="tooltip-count-wrapper">
                    <b className="tooltip-counts">
                      {dataToDisplay()?.["stakeholder"]}
                    </b>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const KnowledgeLibraryToolTipContent = ({
  data,
  geo,
  existingResources,
  query,
}) => {
  const dataToDisplay = () => {
    return {
      initiative:
        (data?.counts?.initiative || 0) + (data?.counts?.initiative || 0),
      actionPlan: data?.counts?.actionPlan,
      policy: data?.counts?.policy,
      technicalResource: data?.counts?.technicalResource,
      financingResource: data?.counts?.financingResource,
      event: data?.counts?.event,
      technology: data?.counts?.technology,
    };
  };

  const transnationalData = () => {
    return {
      initiative:
        (data?.transnationalCounts?.project || 0) +
        (data?.transnationalCounts?.initiative || 0),
      actionPlan: data?.transnationalCounts?.actionPlan,
      policy: data?.transnationalCounts?.policy,
      technicalResource: data?.transnationalCounts?.technicalResource,
      financingResource: data?.transnationalCounts?.financingResource,
      event: data?.transnationalCounts?.event,
      technology: data?.transnationalCounts?.technology,
    };
  };

  const transnationalMaxValue = Math.max
    .apply(null, Object.values(transnationalData()))
    .toString();

  const characterLength = transnationalMaxValue?.length;

  const resourceToShow =
    existingResources?.length > 0 ? existingResources : query?.topic;

  return (
    <div
      key={`${geo.ISO3CD}-tooltip`}
      style={{ paddingRight: `${(characterLength || 1) * 9}px` }}
      className="map-tooltip"
    >
      <h3>{geo.MAP_LABEL}</h3>
      <table className="tooltip-table">
        <thead>
          <tr>
            <th>Resource</th>
            <th>National</th>
            <th style={{ paddingLeft: "10px" }}>Transnational</th>
          </tr>
        </thead>
        <tbody>
          {tTypes.map((topic) => {
            const dataToDisplayPerPath = () => {
              return (
                topic !== "organisation" &&
                topic !== "stakeholder" &&
                topic !== "capacity_building" &&
                topic !== "plastics" &&
                topic !== "waste management" &&
                topic !== "marine litter" &&
                topic !== "capacity building" &&
                topic !== "product by design" &&
                topic !== "source to sea"
              );
            };

            const tooltipChecker = () => {
              if (topic === "actionPlan") {
                return "action_plan";
              } else if (topic === "technicalResource") {
                return "technical_resource";
              } else if (topic === "financingResource") {
                return "financing_resource";
              } else {
                return topic;
              }
            };

            return dataToDisplayPerPath() && resourceToShow?.length === 0 ? (
              <tr key={topic}>
                <td className="tooltip-topic">{topicNames(topic)}</td>
                <td className="tooltip-count-wrapper">
                  <b className="tooltip-counts">
                    {dataToDisplay()?.[topic] ? dataToDisplay()?.[topic] : 0}
                  </b>
                </td>

                <td className="tooltip-count-wrapper">
                  <b className="tooltip-counts">
                    {transnationalData()?.[topic]
                      ? transnationalData()?.[topic]
                      : 0}
                  </b>
                </td>
              </tr>
            ) : (
              resourceToShow?.includes(tooltipChecker()) && (
                <tr key={topic}>
                  <td className="tooltip-topic">{topicNames(topic)}</td>
                  <td className="tooltip-count-wrapper">
                    <b className="tooltip-counts">
                      {dataToDisplay()?.[topic] ? dataToDisplay()?.[topic] : 0}
                    </b>
                  </td>

                  <td className="tooltip-count-wrapper">
                    <b className="tooltip-counts">
                      {transnationalData()?.[topic]
                        ? transnationalData()?.[topic]
                        : 0}
                    </b>
                  </td>
                </tr>
              )
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const ExpertsTooltipContent = ({ data, geo }) => {
  return (
    <div
      key={`${geo.ISO3CD}-tooltip`}
      style={{ paddingRight: "16px" }}
      className="map-tooltip"
    >
      <h3>{geo.MAP_LABEL}</h3>
      <div className="entity-row">
        <b className="entity-type">Experts</b>
        <div className="tooltip-count-wrapper">
          <b className="tooltip-counts">
            {data?.counts?.experts ? data?.counts?.experts : 0}
          </b>
        </div>
      </div>
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
  return <div className="no-legend-warning">No legend</div>;
};

export default memo(MapChart);
