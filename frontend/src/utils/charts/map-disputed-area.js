const world = require('../static/unep-map.json');

const disputed = world.features
    .filter(x => x.properties.cd === "XXX")
    .map(x => ({
        name: x.properties.name,
        itemStyle: {
            areaColor: {
                image: document.getElementById("map-pattern"),
                repeat: 'repeat',
            },
            emphasis: {
                areaColor : {
                    image: document.getElementById("map-pattern"),
                    repeat: 'repeat',
                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                    shadowBlur: 10
                },
            }
        }
    }));

export default disputed;
