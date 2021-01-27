import { feature } from "topojson-client"

const features = feature(
    window.__UNEP__MAP__,
    window.__UNEP__MAP__.objects.countries).features.map((x, i) => {
        const disputed = x.properties.ISO3CD.split("")[0] === "x";
        return {
            ...x,
            properties:  {
                name: !disputed ? x.properties.ISO3CD : "disputed-" + i,
                cd: x.properties.name,
            }
        }
});

export const mapSource = {type: "FeatureCollection", features: features};
