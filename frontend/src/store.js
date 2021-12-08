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
      {
        title: "Legislation, standards, rules",
        des:
          "Agreeing new or changing rules or standards that others should comply with, new regulation, agreements, policies, economic instruments etc. including voluntary commitments).",
      },
      {
        title: "Working with people",
        des:
          "Encouraging or enabling others, e.g., education, training, communication, awareness raising, behaviour change programmes",
      },
      {
        title: "Technology and Processes",
        des:
          "New technical developments/innovation, e.g., research and development, new product design, new materials, processes etc., changes in practice, operations, environmental management and planning.",
      },
      {
        title: "Monitoring and Analysis",
        des:
          "Collecting evidence around plastic discharge to the ocean/waterways, e.g., monitoring, analysis",
      },
    ],
    desc:
      "These include a wide range of actions from legislation, behaviour change initiatives, education, training, events, new technologies, monitoring and analysis initiatives and science Initiatives. Existing actions and initiatives have been collected via an online survey for voluntary inputs and narrative submissions. Initiatives are linked to a Dashboard.",
  },
  {
    code: "action",
    name: "Action Plan",
    childs: [
      { title: "Global", des: "Worldwide Coverage" },
      { title: "Transnational", des: "Covers two or more countries" },
      { title: "National", des: "Covers an entire country" },
      {
        title: "Sub-national",
        des: "Covers part of a country e.g, city, or federal state",
      },
    ],
    desc:
      "An action plan is a detailed plan outlining actions needed to reach one or more goals. Alternatively, it can be defined as a sequence of steps that must be taken, or activities that must be performed well, for a strategy to succeed. Development of action plans is required under many multilateral environmental agreements to facilitate implementation.",
  },
  {
    code: "policy",
    name: "Policy",
    childs: [
      {
        title: "Legislations, Regulations & Standards",
        des:
          "Measures taken by governmental units to influence people by means of formulated rules and directives which mandate receivers act in accordance with what is ordered in these rules or directives.",
      },
      {
        title: "Prohibitive Regulations, Bans & Restrictions",
        des:
          "Rules of an obligatory nature that are negative, disallowing certain phenomena or actions.",
      },
      {
        title: "Strategies & Action Plans",
        des:
          "Decisions designed to create favorable impact on key factors to create a desired outcome.",
      },
      {
        title: "Economic Instruments",
        des:
          "Incentive measures bring about an intended behaviour or outcome as an alternative to command and control measures - legal codes and prescriptions.",
      },
      {
        title: "Certification, Licensing and Registration",
        des:
          "Process of checking, verifying, and attaining general information about the abilityl to comply with the standard. ",
      },
      {
        title: "Policy Guidance and Information",
        des:
          "Help and advice provided on a set of ideas or plans that is used as a basis for making decisions, especially in politics, economics, or business.",
      },
    ],
    desc:
      "Policy documents defined here as official (and occasionally unofficial translations of) documents that include public-facing laws and amendments, statutes, ordinances, management plans, executive orders, agreements, treaties, and memorandums of understanding, among others written and adopted by government entities, demonstrating an intent to reduce plastic pollution at varying stages of the plastics lifecycle.",
  },
  {
    code: "financing",
    name: "Financing Resource",
    childs: [
      {
        title: "Equity Investment",
        des: "Money that is invested in a company in the form of shares.",
      },
      {
        title: "Venture Capital",
        des:
          "Money that is invested or is available for investment in a new company, especially one that involves risk.",
      },
      {
        title: "Loans",
        des:
          "An amount of money that is borrowed, often from a bank, and has to be paid back, usually with an extra charge for borrowing.",
      },
      {
        title: "Grants",
        des:
          "An amount of money that a government or other institution gives to an individual or to an organization for a particular purpose. ",
      },
      {
        title: "Blended finance",
        des:
          "The strategic use of development finance for the mobilisation of additional finance towards sustainable development.",
      },
      {
        title: "Multidonor trust fund",
        des:
          "A type of pooled funding involving multiple UN organisations and designed to receive contributions from donors to support specific national, regional or global results.",
      },
      {
        title: "Sustainable development bonds, green bonds and blue bonds",
        des:
          "Debt securities issued by private or public entities to finance activities or projects linked to sustainable development, green goals, or ocean goals.",
      },
    ],
    desc:
      "Organizations or programmes providing financial support to entities tackling marine plastic litter. Such support includes grants, investment, and loans, among others.",
  },
  {
    code: "technical",
    name: "Technical Resource",
    childs: [
      {
        title: "Report & Assessment",
        des:
          "A textual document made that present focused, salient content to a specific audience but is not limited to assessment reports, evaluation report, annual report, progress/quadrennial assessment report.",
      },
      {
        title: "Guidance Documents",
        des:
          "A document that gives advice or help on how to do or understand something.",
      },
      {
        title: "Rules of Procedure and Mechanism",
        des:
          "A natural or established process by which something takes place or is brought about.",
      },
      {
        title: "Tools & Toolkits",
        des:
          "A resource or set of resources that helps you to do a particular activity.",
      },
      {
        title: "Working Document",
        des:
          "A type of technical report that is a work in progress, a preliminary form of a possible future document.",
      },
      {
        title: "Educational & Outreach resources",
        des:
          "Any resource – including print and non-print materials and online/open-access resources – which supports and enhances, directly or indirectly, learning, teaching and awareness raising.",
      },
      {
        title: "Courses & Trainings",
        des:
          "Unit of instruction comprising a sequence of educational activities in a particular field or range of related fields of education.",
      },
      {
        title: "Case studies",
        des:
          "Initiatives or projects that can be used as an example to show general principles.",
      },
    ],
    desc:
      "Resources and mechanisms collected through research based on publicly available information. Examples of technical resources range from pilot projects, policy recommendations, assessments, calculation model and tools, operational and technical guidelines, toolkits for decision-makers, best practices, manuals and more.",
  },
  {
    code: "event_flexible",
    name: "Event",
    childs: [
      {
        title: "Webinars & Seminars",
        des:
          "An online or face-to-face meeting of people to discuss and/or perform practical work in a subject or activity",
      },
      {
        title: "Workshops",
        des:
          "A meeting of people to discuss and/or perform practical work in a subject or activity",
      },
      {
        title: "Conferences",
        des:
          "Meetings, often lasting a few days, organized on a particular subject or to bring together people who have a common interest to exchange ideas and discuss issues, especially important public issues. ",
      },
      {
        title: "Challenges & Contests ",
        des:
          "An activity done by a number of people or organizations, each of which is trying to do better than all of the others",
      },
      {
        title: "Courses & Trainings",
        des:
          "Unit of instruction comprising a sequence of educational activities in a particular field or range of related fields of education. ",
      },
      {
        title: "Awareness Raising",
        des:
          "Awareness-raising is a process that seeks to inform and educate people about a topic or issue with the intention of influencing their attitudes, behaviours and beliefs towards the achievement of a defined purpose or goal.1 It can mobilize the power of public opinion in support of an issue and thereby influence the political will of decision makers.2 There are multiple awareness-raising strategies, methods and tools that can be used to convey and spread messages, and to gather the support necessary to influence public opinion. ",
      },
    ],
    desc:
      "Upcoming capacity building activities and events on marine litter, plastic pollution and related topics.",
  },
  {
    code: "technology",
    name: "Technology",
    childs: [
      {
        title: "In market",
        des:
          "Within the geographical area that the provider offers the service",
      },
      {
        title: "Scale up",
        des:
          "Involves obtaining a faster server with more powerful processors and more memory. This solution uses less network hardware, and consumes less power; but ultimately, for many platforms may only provide a short-term fix, especially if continued growth is expected",
      },
      {
        title: "Prototype",
        des:
          "s the first complete solution to the original challenge. The first “prototype” is the first time all parts of a solution are tested together. It is the first time that the inter-dependencies of all components can be tested, analyzed, and refined. ",
      },
      {
        title: "Pilot",
        des:
          "A solution that is to be tested on a small scale that is seen to be complete in its own right. Piloting can also be seen as the pre-scale phase of a new approach that focuses on quality, validation, time, cost, adverse events, and initial short-term impact.",
      },
      {
        title: "Development",
        des:
          "The systematic use of scientific, technical, economic, and commercial knowledge to meet specific business objectives or requirements.",
      },
      {
        title: "Research",
        des:
          "Creation of new knowledge and/or the use of existing knowledge in a new and creative way to generate new concepts, methodologies and understandings.",
      },
    ],
    desc:
      "A collection of technology solutions and of environmentally sound technologies, which identifies commercial solutions for the prevention of marine litter following a lifecycle approach, from source to sea, with a focus on both land-based and near-shore (litter capturing) technologies. Environmentally sound technologies, sections explaining alternative materials, chemical recycling, additives etc.",
  },
  {
    code: "capacity_building",
    name: "Capacity Building",
    childs: [
      {
        title: "Guidance Documents",
        des:
          "A document that gives advice or help on how to do or understand something.",
      },
      {
        title: "Tools & toolkits",
        des:
          "A resource or set of resources that helps you to do a particular activity.",
      },
      {
        title: "Courses & Trainings",
        des:
          "Unit of instruction comprising a sequence of educational activities in a particular field or range of related fields of education.",
      },
      {
        title: "Educational & Outreach resources",
        des:
          "Any resource – including print and non-print materials and online/open-access resources – which supports and enhances, directly or indirectly, learning, teaching and awareness raising.",
      },
      {
        title: "Initiatives",
        des:
          "These include a wide range of actions from legislation, behaviour change initiatives, education, training, events, new technologies, monitoring and analysis initiatives and science Initiatives. Existing actions and initiatives have been collected via an online survey for voluntary inputs and narrative submissions. Initiatives are linked to a Dashboard.",
      },
      {
        title: "Events",
        des: "Upcoming trainings, capacity building activities and events.",
      },
      {
        title: "Financing Resources",
        des:
          "Organizations or programmes providing financial support to entities tackling marine plastic litter. Such support includes grants, investment, and loans, among others.",
      },
      {
        title: "Case studies",
        des:
          "Initiatives or projects that can be used as an example to show general principles.",
      },
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
