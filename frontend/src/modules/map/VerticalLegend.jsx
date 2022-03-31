import React from "react";
import { Card, Typography } from "antd";
import { colorRange, higlightColor } from "./config";

const { Text } = Typography;

const VerticalLegend = ({ data, setFilterColor, selected, title }) => {
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
        background: colorRange[i] === selected ? higlightColor : "transparent",
      }}
    />
  ));

  if (data.length) {
    return (
      <Card style={{ width: 300 }}>
        <div className="title">{title && <Text strong>{title}</Text>}</div>
        <div
          style={{
            background: `linear-gradient(180deg, rgba(103,190,161,1) 10%, rgba(255,255,255,1) 90%)`,
            width: 20,
            // minHeight: 132,
            float: "left",
          }}
        >
          {[
            ...range,
            <div
              key={"legend-0"}
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
                    : "transparent",
              }}
              onClick={(e) => {
                selected === null
                  ? setFilterColor(colorRange[range.length])
                  : selected === colorRange[range.length]
                  ? setFilterColor(null)
                  : setFilterColor(colorRange[range.length]);
              }}
            />,
            <div
              key={"legend-last"}
              className={
                "legend" +
                (selected !== null && selected === "#fff"
                  ? " legend-selected"
                  : "")
              }
              style={{
                backgroundColor:
                  "#fff" === selected ? higlightColor : "transparent",
              }}
              onClick={(e) => {
                selected === null
                  ? setFilterColor("#fff")
                  : selected === "#fff"
                  ? setFilterColor(null)
                  : setFilterColor("#fff");
              }}
            />,
          ]}
        </div>
        <div style={{ float: "left" }}>
          {data.map((x, i) => (
            <div key={i} className="legend label">
              <Text>{data[i - 1] ? `${x} - ${data[i - 1]}` : `> ${x}`}</Text>
            </div>
          ))}
          <div className="legend label">
            <Text>{`1 - ${data[data.length - 1]}`}</Text>
          </div>
          <div className="legend label">
            <Text>0</Text>
          </div>
        </div>
      </Card>
    );
  }
  return <div className="no-legend-warning">No legend</div>;
};

export default VerticalLegend;
