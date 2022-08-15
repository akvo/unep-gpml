import React, { useState, useEffect, Fragment } from "react";
import "./map-styles.scss";
import ReactTooltip from "react-tooltip";
import { LoadingOutlined, DownOutlined } from "@ant-design/icons";
import MapChart from "./map-chart";

export const KNOWLEDGE_LIBRARY = "/knowledge/library";
export const KNOWLEDGE_LIB = "/knowledge/lib";
export const KNOWLEDGE_LIB_OVERVIEW = "/knowledge/lib/overview";
export const STAKEHOLDER_OVERVIEW = "/connect/community";
export const EXPERTS = "/connect/experts";

const Maps = ({
  box,
  query,
  data,
  isLoaded,
  clickEvents,
  countData,
  stakeholderCount,
  multiCountries,
  listVisible,
  isDisplayedList,
  isFilteredCountry,
  multiCountryCountries,
  useVerticalLegend = false,
  countryGroupCounts,
  useTooltips = true,
  showLegend = false,
  zoom,
  path,
}) => {
  const [tooltipContent, setTooltipContent] = useState("");

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
          }}
        >
          <MapChart
            {...{
              useTooltips,
              setTooltipContent,
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
            }}
          />
          {useTooltips && (
            <ReactTooltip type="light" className="opaque map-tooltip-wrapper">
              {tooltipContent}
            </ReactTooltip>
          )}
        </div>
      </div>
    </div>
  );
};

export default Maps;
