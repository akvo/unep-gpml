import { feature } from "topojson-client";

export const mapSource = {
  type: "FeatureCollection",
  features: feature(
    window.__UNEP__MAP__,
    window.__UNEP__MAP__.objects.countries
  ).features,
};
