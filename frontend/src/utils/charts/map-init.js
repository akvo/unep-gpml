(function (root, factory) {
  if (typeof exports === "object" && typeof exports.nodeName !== "string") {
    // CommonJS
    factory(exports, require("echarts"));
  } else {
    // Browser globals
    factory({}, root.echarts);
  }
})(this, function (exports, echarts) {
  var log = function (msg) {
    if (typeof console !== "undefined") {
      console && console.error && console.error(msg);
    }
  };
  if (!echarts) {
    log("ECharts is not Loaded");
    return;
  }
  if (!echarts.registerMap) {
    log("ECharts Map is not loaded");
    return;
  }
  echarts.registerMap("unep-map", require("./map-source").mapSource);
});
