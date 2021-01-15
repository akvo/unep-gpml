let maps = require('../static/unep-map.json');
let mapValues = maps.features.map((x, i) => {
    return {
        ...x,
        properties:  {
            name: x.properties.cd !== "XXX" ? x.properties.cd : "disputed-" + i,
            cd: x.properties.name,
        }
    }
});

export const mapSource =  {...maps, features: mapValues};
