import { useLocation } from "react-router-dom";
import { Store } from "pullstate";

const useQuery = () => {
  const srcParams = new URLSearchParams(useLocation().search);
  const ret = {
    country: [],
    transnational: [],
    topic: [],
    tag: [],
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

const filterState = new Store({
  resourceType: [],
  bookmark: [],
  location: {
    country: [],
    multiCountry: [],
  },
  tags: [],
  sectors: [],
  goals: [],
  representativeGroup: [],
  geoCoverage: [],
  language: [],
  entities: [],
  rating: [],
  date: {
    startDate: null,
    endDate: null,
  },
});

export { useQuery, filterState };
