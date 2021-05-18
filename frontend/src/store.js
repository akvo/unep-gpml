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

const sectorOptions = [
  "Government",
  "Private Sector",
  "Foundations",
  "Scientific and Technological Community and Academia",
  "Non-Governmental Organization (NGO) and other Major Groups and Stakeholder (MGS)",
  "Intergovernmental Organization (IGOs) and Multilateral Processes Actors",
  "Private Citizens",
];

const organisationType = [
  "Government",
  "Private Sector",
  "Academia and Scientific Community",
  "NGO and Major Groups and Stakeholders",
  "IGO and Multilateral Process Actor",
  "Other",
];

const UIStore = new Store({
  tags: {},
  countries: [],
  currencies: [],
  profile: {},
  organisations: [],
  languages: languages,
  geoCoverageTypeOptions: geoCoverageTypeOptions,
  regionOptions: [],
  meaOptions: [],
  organisationType: sectorOptions,
  sectorOptions: sectorOptions,
  highlight: false,
  disclaimer: null,
  loading: true,
});

export { UIStore };
