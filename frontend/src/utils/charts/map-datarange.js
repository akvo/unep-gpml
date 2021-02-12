const mapDataRange = {
    dataRange: {
        bottom: "30px",
        left: 0,
        padding: 3,
        orient: "horizontal",
        color: ["#35619b", "#2c498b", "#23347c", "#1d2964", "#19204b"],
        itemGap: 3,
        textStyle: {
            fontSize: 12,
            fontWeight:'bold',
            color: "#DDD",
        },
        itemWidth: 60,
        itemHeight: 15,
        borderRadius: 0,
        backgroundColor: "#FFF",
        textGap:-45,
        splitList: [
            { start: 25, label: "Above 25" },
            { start: 20, end: 25 },
            { start: 15, end: 20 },
            { start: 10, end: 15 },
            { start: 1, end: 10 },
            { end: 0, label: "0" }
        ],
    }
};

export default mapDataRange;
