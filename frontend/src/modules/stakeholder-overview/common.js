import { useLocation } from "react-router-dom";

const useQuery = () => {
  const srcParams = new URLSearchParams(useLocation().search);
  const ret = {
    country: [],
    topic: [],

    tag: [],
    representativeGroup: [],
    geoCoverage: [],

    seeking: [],
    offering: [],
    q: "",
    is_member: [],
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
