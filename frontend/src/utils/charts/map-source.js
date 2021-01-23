let maps = require('../static/unep-map-mercator.json');
let mapValues = maps.features.map((x, i) => {
    const disputed = x.properties.cd.split("")[0] === "x";
    return {
        ...x,
        properties:  {
            name: !disputed ? x.properties.cd : "disputed-" + i,
            cd: x.properties.name,
        }
    }
});

export const mapSource =  {...maps, features: mapValues};
