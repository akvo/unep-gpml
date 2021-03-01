import { mapSource } from "./map-source";
const disputed = mapSource.features
  .filter((x) => x.properties.name?.startsWith("disputed"))
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
