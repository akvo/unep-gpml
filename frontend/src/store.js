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
    childs: [
      "Legislation, standards, rules",
      "Working with people",
      "Technology and Processes",
      "Monitoring and Analysis",
    ],
  },
  {
    code: "action",
    name: "Action Plan",
    childs: ["Global", "Transnational", "National", "Sub-national"],
  },
  {
    code: "policy",
    name: "Policy",
    childs: [
      "Legislations, Regulations & Standards",
      "Prohibitive Regulations, Bans & Restrictions",
      "Strategies & Action Plans",
      "Economic Instruments",
      "Certification, Licensing and Registration",
      "Policy Guidance and Information",
    ],
  },
  {
    code: "financing",
    name: "Financing Resource",
    childs: [
      "Equity Investment",
      "Venture Capital",
      "Loans",
      "Grants",
      "Blended finance",
      "Multidonor trust fund",
      "Sustainable development bonds, green bonds and blue bonds ",
    ],
  },
  {
    code: "technical",
    name: "Technical Resource",
    childs: [
      "Report & Assessment",
      "Guidance Documents",
      "Rules of Procedure and Mechanism",
      "Tools & Toolkits",
      "Working Document",
      "Educational & Outreach resources",
      "Courses & Trainings",
      "Case studies",
    ],
  },
  {
    code: "eventFlexible",
    name: "Event",
    childs: [
      "Webinars & Seminars",
      "Workshops",
      "Conferences",
      "Challenges & Contests",
      "Courses & Trainings",
      "Awareness Raising",
    ],
  },
  {
    code: "technology",
    name: "Technology",
    childs: [
      "In market",
      "Scale up",
      "Prototype",
      "Pilot",
      "Development",
      "Research",
    ],
  },
  {
    code: "capacity_building",
    name: "Capacity Building",
    childs: [
      "Guidance Documents",
      "Tools & toolkits",
      "Courses & Trainings",
      "Educational & Outreach resources",
      "Initiatives",
      "Events",
      "Financing Resources",
      "Case studies",
    ],
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
