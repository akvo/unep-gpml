import mapIcons from  './map-icons';
import disputed from './map-disputed-area';
import {zoomIn, zoomOut, resetZoom } from './map-zoom';
import mapDataRange from './map-datarange';
import mapToolTip from './map-tooltip';

const Chart = {
    Opt: {
        Maps: {
            ToolTip: mapToolTip,
            ToolBox: {
                toolbox: {
                    show: true,
                    orient: "horizontal",
                    top: 30,
                    right: 60,
                    zlevel: 2,
                    feature: {
                        myTool1: {
                            title: "Zoom In",
                            icon: mapIcons.zoomIn,
                            onclick: (params, charts) => {
                                zoomIn(params, charts);
                            },
                        },
                        myTool2: {
                            title: "Zoom Out",
                            icon: mapIcons.zoomOut,
                            onclick: (params, charts) => {
                                zoomOut(params, charts);
                            },
                        },
                        myTool3: {
                            title: "Reset Zoom",
                            icon: mapIcons.reset,
                            onclick: function(params, charts) {
                                resetZoom(params, charts)
                            },
                        }
                    },
                    backgroundColor: "#FFF"
                }
            },
            DisputedArea: disputed,
            DataRange: mapDataRange,
        }
    },
    Style: {
        Text: {
            textStyle: {
                color: "#222",
                fontFamily: "sans-serif",
            }
        },
        Colors:{
            color: [
                "#00adef",
                "#e21836",
                "#f68e1f",
                "#ec008b",
                "#07bbc1",
                "#006eb6",
                "#87c440",
                "#40ae49",
                "#FFE800"
            ]
        }
    }
}

export default Chart;
