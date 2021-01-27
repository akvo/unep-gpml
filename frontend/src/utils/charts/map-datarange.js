const mapDataRange = {
    markArea: {
        label: {
            show:true,
            distance:5
        }
    },
    dataRange: {
        top: 50,
        right: 10,
        splitList: [
            {start: 25, label: 'Above 25'},
            {start: 20, end: 25},
            {start: 15, end: 20},
            {start: 10, end: 15},
            {start: 1, end: 10},
            {end: 0, label:'0'}
        ],
        color: [
            "#0f5298",
            "#2565ae",
            "#3c99dc",
            "#66d3fa",
            "#d5f3fe",
            "#ddd",
        ]
    },
}

export default mapDataRange;
