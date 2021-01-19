const echarts = require('echarts');

const updateCharts = (charts, params, zoom) => {
    let options = charts.getOption();
    let new_series = {
        ...params.option.series[0],
        zoom: zoom,
    }
    options = {...options, series: [new_series]}
    let id = charts.getDom();
    const thecharts = echarts.init(id);
    thecharts.setOption(options);
}

const zoomIn = (params, charts) => {
    let zoom = params.option.series[0].zoom + 1;
    if (zoom > 4) {
        zoom = 4;
    }
    updateCharts(charts, params, zoom)
    return;
}

const zoomOut = (params, charts) => {
    let zoom = params.option.series[0].zoom - 1;
    if (zoom < 0) {
        zoom = 0;
    }
    updateCharts(charts, params, zoom)
    return;
}

const resetZoom = (params, charts) => {
    updateCharts(charts, params, 0)
    return;
}

export {zoomIn, zoomOut, resetZoom};
