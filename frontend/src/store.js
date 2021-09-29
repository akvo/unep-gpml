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

const representativeGroup = [
  {
    code: "government",
    name: "Government",
    childs: ["National", "State/Provincial", "Municipal"],
  },
  {
    code: "private-sector",
    name: "Private Sector (for-profit)",
    childs: { tags: "sector" }, // All sectors list from tags group
  },
  {
    code: "igos",
    name: "Intergovernmental Organizations (IGOs)",
    childs: null,
  },
  {
    code: "academia-research",
    name: "Academia & Research",
    childs: ["Public Institute", "Privately Owned"],
  },
  {
    code: "civil-society",
    name: "Civil Society (not-for-profit)",
    childs: ["Non-Governmental Organization (NGOs)", "Foundations"],
  },
];

const UIStore = new Store({
  tags: {},
  countries: [],
  currencies: [],
  profile: {},
  organisations: [],
  nonMemberOrganisations: [],
  languages: languages,
  geoCoverageTypeOptions: geoCoverageTypeOptions,
  regionOptions: [],
  meaOptions: [],
  transnationalOptions: [],
  organisationType: sectorOptions,
  sectorOptions: sectorOptions,
  representativeGroup: representativeGroup,
  landing: null,
  stakeholders: null,
  highlight: false,
  disclaimer: null,
  formStep: {
    signUp: 1,
    initiative: 1,
    actionPlan: 1,
    policy: 1,
    technicalResource: 1,
    financingResource: 1,
    event: 1,
    technology: 1,
  },
  formEdit: {
    signUp: {
      status: "add",
      id: null,
    },
    initiative: {
      status: "add",
      id: null,
    },
    actionPlan: {
      status: "add",
      id: null,
    },
    policy: {
      status: "add",
      id: null,
    },
    technicalResource: {
      status: "add",
      id: null,
    },
    financingResource: {
      status: "add",
      id: null,
    },
    event: {
      status: "add",
      id: null,
    },
    technology: {
      status: "add",
      id: null,
    },
    signUp: {
      status: "add",
      id: null,
    },
  },
});

export { UIStore };
