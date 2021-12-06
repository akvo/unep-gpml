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
    desc:
      "These include a wide range of actions from legislation, behaviour change initiatives, education, training, events, new technologies, monitoring and analysis initiatives and science Initiatives. Existing actions and initiatives have been collected via an online survey for voluntary inputs and narrative submissions. Initiatives are linked to a Dashboard.",
  },
  {
    code: "action",
    name: "Action Plan",
    childs: ["Global", "Transnational", "National", "Sub-national"],
    desc:
      "An action plan is a detailed plan outlining actions needed to reach one or more goals. Alternatively, it can be defined as a sequence of steps that must be taken, or activities that must be performed well, for a strategy to succeed. Development of action plans is required under many multilateral environmental agreements to facilitate implementation.",
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
    desc:
      "Policy documents defined here as official (and occasionally unofficial translations of) documents that include public-facing laws and amendments, statutes, ordinances, management plans, executive orders, agreements, treaties, and memorandums of understanding, among others written and adopted by government entities, demonstrating an intent to reduce plastic pollution at varying stages of the plastics lifecycle.",
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
    desc:
      "Organizations or programmes providing financial support to entities tackling marine plastic litter. Such support includes grants, investment, and loans, among others.",
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
    desc:
      "Resources and mechanisms collected through research based on publicly available information. Examples of technical resources range from pilot projects, policy recommendations, assessments, calculation model and tools, operational and technical guidelines, toolkits for decision-makers, best practices, manuals and more.",
  },
  {
    code: "event_flexible",
    name: "Event",
    childs: [
      "Webinars & Seminars",
      "Workshops",
      "Conferences",
      "Challenges & Contests",
      "Courses & Trainings",
      "Awareness Raising",
    ],
    desc:
      "Upcoming capacity building activities and events on marine litter, plastic pollution and related topics.",
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
    desc:
      "A collection of technology solutions and of environmentally sound technologies, which identifies commercial solutions for the prevention of marine litter following a lifecycle approach, from source to sea, with a focus on both land-based and near-shore (litter capturing) technologies. Environmentally sound technologies, sections explaining alternative materials, chemical recycling, additives etc.",
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
    desc:
      "The definition of capacity building is broad. It is a holistic enterprise, encompassing a multitude of activities. It means building abilities, relationships and values that will enable organisations, groups and individuals to improve their performance and achieve their development objectives. It includes strengthening the processes, systems and rules that influence collective and individual behaviour and performance in all development endeavours. And it means enhancing people’s technical ability and willingness to play new developmental roles and adapt to new demands and situations.",
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
  selectedMainContentType: "initiative",
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
