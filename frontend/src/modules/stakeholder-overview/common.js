import { useLocation } from "react-router-dom";

const useQuery = () => {
  const srcParams = new URLSearchParams(useLocation().search);
  const ret = {
    topic: [],
    country: [],
    tag: [],
    // get tag() {
    //   return [this.seeking, this.offering].flat();
    // },
    representativeGroup: [],
    geoCoverage: [],
    seeking: [],
    offering: [],
    affiliation: [],
    is_member: [],
    role: [],
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
