import { languages } from "countries-list";
import { Store } from "pullstate";

const geoCoverageTypeOptions = [
  "Global",
  // "Regional",
  "Transnational",
  "National",
  // "Sub-national",
  // "Global with elements in specific areas",
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

const mainContentType = [
  {
    code: "initiative",
    name: "Initiative",
    childs: [],
  },
  {
    code: "actionPlan",
    name: "Action Plan",
    childs: [],
  },
  {
    code: "policy",
    name: "Policy",
    childs: [],
  },
  {
    code: "financingResource",
    name: "Financing Resource",
    childs: [],
  },
  {
    code: "technicalResource",
    name: "Technical Resource",
    childs: [],
  },
  {
    code: "event",
    name: "Event",
    childs: [],
  },
  {
    code: "technology",
    name: "Technology",
    childs: [],
  },
  {
    code: "capacityBuilding",
    name: "Capacity Building",
    childs: [],
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
  mainContentType: mainContentType,
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
    entity: 1,
  },
  formEdit: {
    signUp: {
      status: "add",
      id: null,
    },
    flexible: {
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
    entity: {
      status: "add",
      id: null,
    },
  },
});

export { UIStore };
