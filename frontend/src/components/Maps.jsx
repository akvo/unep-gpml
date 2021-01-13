import React from 'react';
import ReactEcharts from 'echarts-for-react';
import Chart from '../utils/charts'
require("../utils/charts/map-init.js");

const generateOptions = ({title, subtitle, data, tooltip}) => ({
    title: {
        text: title,
        left: 'center',
        top: '20px',
        subtext: subtitle,
        ...Chart.Style.Text
    },
    tooltip: Chart.Opt.Maps.ToolTip(tooltip),
    backgroundColor: '#EAF6FD',
    legend: { show: false },
    series: [{
        name: title,
        type: 'map',
        roam: 'move',
        map: 'unep-map',
        aspectScale: 1,
        emphasis: {
            label: {
                show: false,
            }
        },
        zoom: 1,
        itemStyle: {
            areaColor: '#fff',
            borderColor: '#79B0CC',
            emphasis: {
              areaColor: "#26AE60",
                // shadowColor: 'rgba(0, 0, 0, 0.5)',
                // shadowBlur: 10
            }
        },
        data: [...data, ...Chart.Opt.Maps.DisputedArea],
    }],
    ...Chart.Opt.Maps.ToolBox,
    ...Chart.Style.Text,
    ...Chart.Style.Color
})

const Maps = ({
    title,
    subtitle,
    data,
    clickEvents,
    tooltip,
    custom={},
}) => {
    data = data.filter(x => x.value !== 0);
    const options = generateOptions({title, subtitle, data, tooltip});
    options.legend.show = false
    return (
        <ReactEcharts
          className="worldmap"
          option={{...options,...custom}}
          notMerge={true}
          style={{height: '600px', width:'100%'}}
          lazyUpdate={true}
          onEvents={{click: clickEvents}}
        />
    )
}

export default Maps;
