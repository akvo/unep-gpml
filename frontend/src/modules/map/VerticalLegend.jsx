import React from "react";
import { Card } from "antd";
import { colorRange, higlightColor } from "./config";

const VerticalLegend = ({ data, setFilterColor, selected }) => {
  data = Array.from(new Set(data.map((x) => Math.floor(x))));
  data = data.filter((x) => x !== 0);
  const range = data.map((x, i) => (
    <div key={`legend-${i + 1}`} style={{ display: "flex" }}>
      <div
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
          width: 20,
          padding: "0px 8px",
          marginRight: 8,
          cursor: "pointer",
        }}
      />
      {data[i - 1] ? `${x} - ${data[i - 1]}` : `> ${x}`}
    </div>
  ));
  if (data.length) {
    return (
      <Card>
        {[
          ...range,
          <div key={"legend-0"} style={{ display: "flex" }}>
            <div
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
                width: 20,
                padding: "0px 8px",
                marginRight: 8,
                cursor: "pointer",
              }}
              onClick={(e) => {
                selected === null
                  ? setFilterColor(colorRange[range.length])
                  : selected === colorRange[range.length]
                  ? setFilterColor(null)
                  : setFilterColor(colorRange[range.length]);
              }}
            />
            {`1 - ${data[data.length - 1]}`}
          </div>,
          <div key={"legend-last"} style={{ display: "flex" }}>
            <div
              className={
                "legend" +
                (selected !== null && selected === "#fff"
                  ? " legend-selected"
                  : "")
              }
              style={{
                backgroundColor: "#fff" === selected ? higlightColor : "#fff",
                width: 20,
                padding: "0px 8px",
                marginRight: 8,
                border: "1px solid rgba(0,0,0,.06)",
                cursor: "pointer",
              }}
              onClick={(e) => {
                selected === null
                  ? setFilterColor("#fff")
                  : selected === "#fff"
                  ? setFilterColor(null)
                  : setFilterColor("#fff");
              }}
            />
            0
          </div>,
        ]}
      </Card>
    );
  }
  return <div className="no-legend-warning">No legend</div>;
};

export default VerticalLegend;
