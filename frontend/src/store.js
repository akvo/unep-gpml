import { languages } from "countries-list";
import { Store } from "pullstate";

const UIStore = new Store({
  tags: {},
  countries: [],
  profile: {},
  organisations: [],
  languages: languages,
});

export { UIStore };
