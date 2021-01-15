const mapSource = require('./map-source').mapSource;

const disputed = mapSource.features
    .filter(x => x.properties.name?.startsWith("disputed"))
    .map(x => ({
        name: x.properties.name,
        itemStyle: {
            areaColor: {
                image: document.getElementById('map-area'),
                repeat: 'repeat',
            },
            emphasis: {
                areaColor : {
                    image: document.getElementById('map-area'),
                    repeat: 'repeat',
                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                    shadowBlur: 10
                },
            }
        }
    }));

export default disputed;
