import { useLocation } from "react-router-dom";

const useQuery = () => {
  const srcParams = new URLSearchParams(useLocation().search);
  const ret = {
    country: [],
    transnational: [],
    topic: [],
    tag: [],
    startDate: [],
    endDate: [],
    transnational: [],
    // sector: [],
    // goal: [],
    representativeGroup: [],
    // geoCoverage: [],
    // language: [],
    // rating: [],
    q: "",
  };
  for (var key of srcParams.keys()) {
    ret[key] = srcParams
      .get(key)
      .split(",")
      .filter((it) => it !== "");
  }
  return ret;
};

export { useQuery };
