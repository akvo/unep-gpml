const echarts = require('echarts');

const mapZoom = (params, charts, zoomType=false) => {
    let new_zoom = params.option.series[0].zoom;
    new_zoom = zoomType === "zoom-in" ? (new_zoom + 1) : (new_zoom - 1);
    new_zoom = new_zoom < 0 ? 0 : (new_zoom > 4 ? 4 : new_zoom);
    new_zoom = !zoomType ? 0 : new_zoom;
    let options = charts.getOption();
    options = {
        ...charts.getOption(),
        series: [{
            ...params.option.series[0],
            zoom: new_zoom
        }]
    }
    console.log(options);
    const thecharts = echarts.init(charts.getDom());
    thecharts.setOption(options);
}

export default mapZoom;
