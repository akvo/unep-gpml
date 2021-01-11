import mapIcons from  './map-icons';
import disputed from './map-disputed-area';
import mapZoom from './map-zoom';
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
                    left: "right",
                    top: "top",
                    feature: {
                        myTool1: {
                            show: true,
                            title: "Zoom In",
                            icon: mapIcons.zoomIn,
                            onclick: (params, charts) => {
                                mapZoom(params, charts, "zoom-in");
                            },
                        },
                        myTool2: {
                            show: true,
                            title: "Zoom Out",
                            icon: mapIcons.zoomOut,
                            onclick: (params, charts) => {
                                mapZoom(params, charts, "zoom-out");
                            },
                        },
                        myTool3: {
                            show: true,
                            title: "Reset Zoom",
                            icon: mapIcons.reset,
                            onclick: function(params, charts) {
                                mapZoom(params, charts);
                            },
                        }
                    }
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
