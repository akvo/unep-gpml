import React from "react";
import Chart from "../../utils/chart";
import { titleCase } from "../../utils/string";

const PieChart = ({ data }) => {
  return (
    <div className="pie-wrapper">
      <Chart
        key="transnational-entities"
        title="UN regional groups of member states"
        type="DOUGHNUT"
        height={350}
        data={data.map((x) => {
          return {
            id: x?.id,
            name: x?.name,
            value: x?.count,
            count: x?.count,
          };
        })}
      />
    </div>
  );
};

export default PieChart;
