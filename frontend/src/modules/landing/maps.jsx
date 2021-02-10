import React, {useEffect, useState} from 'react';
import ReactEcharts from 'echarts-for-react';
import Chart from '../../utils/charts'
import cloneDeep from 'lodash/cloneDeep';
require("../../utils/charts/map-init.js");

const colors = ["#52aacb", "#4891bb", "#3e78ab", "#35619b", "#2c498b", "#23347c", "#1d2964", "#19204b"];

const generateSteps = (arr) => {
    const datarange = cloneDeep(Chart.Opt.Maps.DataRange);
    if (arr.length === 0) {
        return false;
    }
    arr = arr.map(x => x.value);
    const asc = arr => arr.sort((a, b) => a - b);
    const quantile = (arr, q) => {
        const sorted = asc(arr);
        const pos = (sorted.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        return sorted[base + 1] !== undefined
            ? (sorted[base] + rest * (sorted[base + 1]) - sorted[base])
            : sorted[base];
    };
    const bottom = quantile(arr, .2);
    const step = ((quantile(arr, 1)) - bottom) / 5;
    const log10 = Math.ceil(Math.round(100*Math.log(step)/Math.log(10))/100);
    const max = Math.round(bottom + (step * 3), step, Math.pow(10,log10))
    let steps = [
        Math.round(bottom, step, Math.pow(10,log10)),
        Math.round(bottom + (step), step, Math.pow(10,log10)),
        Math.round(bottom + (step * 2), step, Math.pow(10,log10)),
        max,
    ];
    steps = steps.map((x, i) => {
        if (x < 1) {
            return false;
        }
        if (steps[i - 1] === 1) {
            return {start: 0, end: x}
        }
        if (i === 0) {
            return {start: 1, end: x}
        }
        const start = steps[i - 1];
        return {start: start || 1, end: x}
    });
    steps = [...steps.filter(x => x), {start: max, label: `${max}  >`}];
    steps = steps.map((x,i) => (
        {symbol:'rect', color:colors[i],...x}
    ))
    datarange.dataRange.splitList = steps;
    return datarange;
}

const generateOptions = ({title, subtitle, data, tooltip, mapLeft}) => {
    const steps = data.length > 1 ? generateSteps(data) : {};
    return {
        title: {
            text: title,
            left: 'center',
            top: '20px',
            subtext: subtitle,
            ...Chart.Style.Text
        },
        tooltip: Chart.Opt.Maps.ToolTip(tooltip),
        backgroundColor: '#EAF6FD',
        legend: {show: false},
        series: mapLeft === 0 ? [] : [{
            name: title,
            type: 'map',
            roam: 'move',
            left: `${mapLeft}px`,
            right: 0,
            top: window.__UNEP__MAP__TOP,
            map: 'unep-map',
            aspectScale: 1,
            zoom: window.__UNEP__MAP__ZOOM,
            z: 0,
            zLevel: 0,
            label: {show:false},
            symbolSyze: 0,
            emphasis: {label: {show: false}},
            itemStyle: {
                zlevel: 0,
                areaColor: '#fff',
                borderColor: '#79B0CC',
                emphasis: {
                  areaColor: "#1890ff",
                }
            },
            center: [0, 0],
            data: [...data, ...Chart.Opt.Maps.DisputedArea],
            showLegendSymbol: data.length === 1,
            animation:true,
            animationDelay: 1
        }],
        ...steps,
        ...Chart.Opt.Maps.ToolBox,
        ...Chart.Style.Text}
}


const Maps = ({
    dependency,
    title,
    subtitle,
    data,
    clickEvents,
    tooltip,
    custom={},
}) => {
    const [mapLeft, setMapLeft] = useState(0);
    const handleResize = () => {
        const box = document.getElementsByClassName("map-overlay");
        if (box.length === 1) {
            setMapLeft(box[0].offsetLeft + box[0].offsetWidth)
        }
    }

    useEffect(() => {
        handleResize();
    },[dependency])

    window.addEventListener('resize', handleResize)
    data = data.filter(x => x.value !== 0);
    const options = generateOptions({title, subtitle, data, tooltip, mapLeft});

    return (
        <ReactEcharts
          className="fade-in worldmap"
          option={{...options,...custom}}
          notMerge={true}
          style={{height: (mapLeft > 300 ? '700px' : '600px'), width:'100%'}}
          lazyUpdate={true}
          onEvents={{click: clickEvents}}
        />
    )
}

export default Maps;
