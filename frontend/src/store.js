import { languages } from "countries-list";
import { Store } from "pullstate";

const geoCoverageTypeOptions = [
  "Global",
  "Regional",
  "National",
  "Sub-national",
  "Transnational",
  "Global with elements in specific areas",
];

const regionOptions = [
  "Africa",
  "Asia and the Pacific",
  "East Asia",
  "Europe",
  "Latin America and Carribean",
  "North America",
  "West Asia",
];

const UIStore = new Store({
  tags: {},
  countries: [],
  currencies: [],
  profile: {},
  organisations: [],
  languages: languages,
  geoCoverageTypeOptions: geoCoverageTypeOptions,
  regionOptions: regionOptions,
  formData: {},
});

export { UIStore };
