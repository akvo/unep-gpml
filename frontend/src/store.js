import { languages } from "countries-list";
import { Store } from "pullstate";

const UIStore = new Store({
  tags: {},
  countries: [],
  currencies: [],
  profile: {},
  organisations: [],
  languages: languages,
  formData: {},
});

export { UIStore };
