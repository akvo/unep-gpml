import { mapSource } from "./map-source";

export const disputedId = [
  266,
  267,
  273,
  274,
  275,
  277,
  278,
  279,
  280,
  281,
  282,
  283,
  286,
];

const disputed = mapSource.features
  .filter((x) => disputedId.includes(x.properties.name))
  .map((x) => ({
    name: x.properties.name,
    itemStyle: {
      areaColor: "#DDD",
      emphasis: {
        areaColor: "#DDD",
      },
    },
  }));

export default disputed;
