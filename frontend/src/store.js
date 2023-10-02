import { languages } from 'countries-list'
import { Store } from 'pullstate'
import BookIcon from './images/book-open.svg'
import CaseStudiesSvg from './images/folder.svg'
import CapacityBuildingSvg from './images/owl.svg'
import HelpCenterSvg from './images/help.svg'
import IconCommunity from './images/community.svg'
import ExpertIcon from './images/education.svg'
import IconEvent from './images/calendar.svg'
import IconPartner from './images/partners.svg'
import IconForum from './images/engage.svg'
import AnalyticAndStatisticSvg from './images/statistics.svg'
import DataCatalogueSvg from './images/archive.svg'
import GlossarySvg from './images/glossary.svg'
import MapSvg from './images/map.svg'
import ExploreSvg from './images/api.svg'

const geoCoverageTypeOptions = [
  'Global',
  // "Regional",
  'Transnational',
  'National',
  // "Sub-national",
  // "Global with elements in specific areas",
]

const menuList = [
  // {
  //   key: 'Plastic',
  //   children: [
  //     {
  //       key: 'Topics',
  //     },
  //     {
  //       key: 'Basics',
  //     },
  //   ],
  // },
  {
    key: 'Tools',
    children: [
      {
        key: 'Information',
        children: [
          {
            to: '/knowledge/library',
            title: 'Knowledge library',
            subtitle: 'Resources on marine litter and plastic pollution',
            icon: <BookIcon />,
          },
          {
            to: '/knowledge/case-studies',
            title: 'Case studies',
            icon: <CaseStudiesSvg />,
            subtitle: 'Compilation of actions around the world',
            iconClass: 'casestudies',
          },
          {
            to: '/knowledge/capacity-development',
            title: 'Learning center',
            subtitle: 'Learning and capacity development resources',
            icon: <CapacityBuildingSvg />,
            iconClass: 'learning',
          },
          {
            to: '/help-center',
            title: 'Help Center',
            subtitle: 'Support on GPML Digital Platform',
            icon: <HelpCenterSvg />,
          },
        ],
      },
      {
        key: 'Community',
        children: [
          {
            to: '/community',
            title: 'Members',
            iconClass: 'tools-community-icon',
            subtitle: 'Directory of GPML network entities and individuals',
            icon: <IconCommunity />,
          },
          {
            to: '/experts',
            title: 'Experts',
            iconClass: 'tools-experts-icon',
            subtitle: "Tool to find an expert and experts' groups",
            icon: <ExpertIcon />,
          },
          {
            to: '/events',
            title: 'Events',
            subtitle: 'Global events calendar',
            icon: <IconEvent />,
          },
          {
            to: '/partners',
            title: 'Partners',
            iconClass: 'tools-partners-icon',
            subtitle: 'Directory of partners of the GPML Digital Platform',
            icon: <IconPartner />,
          },
          {
            href: 'https://communities.gpmarinelitter.org',
            title: 'Engage',
            subtitle: 'Interactive forum for collaboration',
            icon: <IconForum />,
          },
        ],
      },
      {
        key: 'Data hub',
        children: [
          {
            href: 'https://datahub.gpmarinelitter.org',
            title: 'Analytics & statistics',
            subtitle: 'Metrics to measure progress',
            icon: <AnalyticAndStatisticSvg />,
          },
          {
            href: 'https://unepazecosysadlsstorage.z20.web.core.windows.net/',
            title: 'Data Catalogue',
            subtitle: 'Datasets on plastic pollution and marine litter',
            icon: <DataCatalogueSvg />,
          },
          {
            href: 'https://datahub.gpmarinelitter.org/pages/glossary/',
            title: 'Glossary',
            subtitle: 'Terminology and definitions',
            icon: <GlossarySvg />,
          },
          {
            href: 'https://datahub.gpmarinelitter.org/pages/story_map',
            title: 'Story Maps',
            subtitle: 'Storytelling with custom maps',
            icon: <MapSvg />,
          },
          {
            href: 'https://datahub.gpmarinelitter.org/pages/api-explore',
            title: 'API explore',
            subtitle: 'Web services and APIs',
            icon: <ExploreSvg />,
          },
        ],
      },
    ],
  },
  // {
  //   key: 'Countries',
  //   children: [
  //     {
  //       key: 'Information',
  //     },
  //   ],
  // },
  {
    key: 'About Us',
    children: [
      {
        key: 'The platform',
      },
      {
        key: 'Our Netwrok',
      },
      {
        key: 'Partnership',
      },
      {
        key: 'Contact us',
      },
    ],
  },
]

const icons = {
  action_plan: 'action.svg',
  project: 'initiative.svg',
  policy: 'policy.svg',
  technical_resource: 'technical.svg',
  financing_resource: 'financing.svg',
  technology: 'technology.svg',
  event: 'event-flexible.svg',
}

const placeholder = {
  action_plan: 'action.png',
  project: 'initiative.png',
  policy: 'policy.png',
  technical_resource: 'technical.png',
  financing_resource: 'financing.png',
  technology: 'technology.png',
  event: 'event-flexible.png',
}

const entityRole = ['Owner', 'Implementor', 'Partner', 'Donor']
const individualRole = ['Owner', 'Resource Editor']

const sectorOptions = [
  'Government',
  'Private Sector',
  'Foundations',
  'Scientific and Technological Community and Academia',
  'Non-Governmental Organization (NGO) and other Major Groups and Stakeholder (MGS)',
  'Intergovernmental Organization (IGOs) and Multilateral Processes Actors',
  'Private Citizens',
]

const entitySuggestedTags = [
  'Circularity',
  'Education',
  'Awareness',
  'Awareness-raising',
  'Monitoring',
  'Research',
  'Waste management',
  'Recycling',
  'Technology',
  'Financing',
  'Project development',
  'Legislation',
  'Policy',
  'Sea-based Sources',
  'ALDFG',
  'Microplastics',
  'Microfibers',
  'International Cooperation',
  'Multilateralism',
]

const stakeholderSuggestedTags = [
  'Waste management',
  'Ocean and coast',
  'Freshwater',
  'Biota',
  'Chemicals',
  'Microplastics',
  'Wastewater',
  'Environmental justice',
  'Human health',
  'Gender',
  'Circularity',
  'Data monitoring',
  'Citizen science',
  'Data analysis',
  'Technology and innovation',
  'Capacity building',
  'Financing',
]

const organisationType = [
  'Government',
  'Private Sector',
  'Academia and Scientific Community',
  'NGO and Major Groups and Stakeholders',
  'IGO and Multilateral Process Actor',
  'Other',
]

const representativeGroup = [
  {
    code: 'government',
    name: 'Government',
    childs: ['National', 'State/Provincial', 'Municipal'],
  },
  {
    code: 'private-sector',
    name: 'Private Sector (for-profit)',
    childs: { tags: 'sector' }, // All sectors list from tags group
  },
  {
    code: 'igos',
    name: 'Intergovernmental Organizations (IGOs)',
    childs: null,
  },
  {
    code: 'academia-research',
    name: 'Academia and Research',
    childs: ['Public Institute', 'Privately Owned'],
  },
  {
    code: 'civil-society',
    name: 'Civil Society (not-for-profit)',
    childs: ['Non-Governmental Organization (NGOs)', 'Foundations'],
  },
]

const mainContentType = [
  {
    code: 'initiative',
    name: 'Initiative',
    examples: [
      {
        title: 'Sustainable Industrial Zone Development',
        link: 'https://digital.gpmarinelitter.org/initiative/10031',
      },
      {
        title: 'Environmentally Sound Management and Destruction of PCBs',
        link: 'https://digital.gpmarinelitter.org/initiative/10033',
      },
      {
        title: 'Plastic Waste Management',
        link: 'https://digital.gpmarinelitter.org/initiative/10078',
      },
      {
        title: 'Make Lome Plastic Free',
        link: 'https://digital.gpmarinelitter.org/initiative/10149',
      },
      {
        title: 'SB 270: Statewide Bag Ban',
        link: 'https://digital.gpmarinelitter.org/initiative/10145',
      },
      {
        title: 'California Ocean Litter Prevention Strategy',
        link: 'https://digital.gpmarinelitter.org/initiative/10177',
      },
    ],
    childs: [
      {
        title: 'Legislation, standards, rules',
        tags: ['initiatives', 'policy', 'legislation', 'standards'],
        des:
          'Agreeing new or changing rules or standards that others should comply with, new regulation, agreements, policies, economic instruments etc. including voluntary commitments).',
      },
      {
        title: 'Working with people',
        tags: ['initiatives', 'working with people', 'capacity development'],
        des:
          'Encouraging or enabling others, e.g., education, training, communication, awareness raising, behaviour change programmes',
      },
      {
        title: 'Technology and Processes',
        tags: ['initiatives', 'technology and processes'],
        des:
          'New technical developments/innovation, e.g., research and development, new product design, new materials, processes etc., changes in practice, operations, environmental management and planning.',
      },
      {
        title: 'Monitoring and Analysis',
        tags: ['initiatives', 'monitoring and analysis'],
        des:
          'Collecting evidence around plastic discharge to the ocean/waterways, e.g., monitoring, analysis',
      },
    ],
    desc:
      'These include a wide range of actions from legislation, behaviour change initiatives, education, training, events, new technologies, monitoring and analysis initiatives and science Initiatives. Existing actions and initiatives have been collected via an online survey for voluntary inputs and narrative submissions. Initiatives are linked to a Dashboard.',
  },
  {
    code: 'action',
    name: 'Action Plan',
    examples: [
      {
        title:
          'PAME, Regional Action Plan on Marine Litter in the Arctic (May 2021)',
        link: 'https://digital.gpmarinelitter.org/action-plan/10017',
      },
      {
        title: 'HELCOM Regional action plan on marine litter',
        link: 'https://digital.gpmarinelitter.org/action-plan/122',
      },
      {
        title: 'Gulf of Mexico Alliance Regional Action Plan',
        link: 'https://digital.gpmarinelitter.org/action-plan/260',
      },
      {
        title:
          'ASEAN Regional Action Plan for Combating Marine Debris in the ASEAN Member States (2021 – 2025)',
        link: 'https://digital.gpmarinelitter.org/action-plan/10008',
      },
      {
        title: 'COBSEA Regional Action Plan on Marine Litter 2019',
        link: 'https://digital.gpmarinelitter.org/action-plan/196',
      },
      {
        title: 'Marine Litter in the Black Sea Region',
        link: 'https://digital.gpmarinelitter.org/action-plan/194',
      },
    ],
    childs: [
      {
        title: 'Global Action Plan',
        tags: ['action plan', 'global'],
        des: 'Worldwide Coverage',
      },
      {
        title: 'Transnational Action Plan',
        tags: ['action plan', 'transnational'],
        des: 'Covers two or more countries',
      },
      {
        title: 'National Action Plan',
        tags: ['action plan', 'national'],
        des: 'Covers an entire country',
      },
      {
        title: 'Sub-national Action Plan',
        tags: ['action plan', 'sub-national'],
        des: 'Covers part of a country e.g, city, or federal state',
      },
    ],
    desc:
      'An action plan is a detailed plan outlining actions needed to reach one or more goals. Alternatively, it can be defined as a sequence of steps that must be taken, or activities that must be performed well, for a strategy to succeed. Development of action plans is required under many multilateral environmental agreements to facilitate implementation.',
  },
  {
    code: 'policy',
    name: 'Policy',
    examples: [
      {
        title: 'The National Environmental Act - Order No. 2034/33',
        link: 'https://digital.gpmarinelitter.org/policy/10539',
      },
      {
        title: 'The Act to Prevent Pollution from Ships',
        link: 'https://digital.gpmarinelitter.org/policy/10531',
      },
      {
        title: 'Sub-Decree No. 168 on the management of plastic bags',
        link: 'https://digital.gpmarinelitter.org/policy/10524',
      },
    ],
    childs: [
      {
        title: 'Legislations, Regulations & Standards',
        tags: ['policy', 'legislations, regulations & standards'],
        des:
          'Measures taken by governmental units to influence people by means of formulated rules and directives which mandate receivers act in accordance with what is ordered in these rules or directives.',
      },
      {
        title: 'Prohibitive Regulations, Bans & Restrictions',
        tags: ['policy', 'legislations, regulations & standards'],
        des:
          'Rules of an obligatory nature that are negative, disallowing certain phenomena or actions.',
      },
      {
        title: 'Strategies & Action Plans',
        tags: ['policy', 'strategies & action plans'],
        des:
          'Decisions designed to create favorable impact on key factors to create a desired outcome.',
      },
      {
        title: 'Economic Instruments',
        tags: ['policy', 'economic instruments'],
        des:
          'Incentive measures bring about an intended behaviour or outcome as an alternative to command and control measures - legal codes and prescriptions.',
      },
      {
        title: 'Certification, Licensing and Registration',
        tags: ['policy', 'certification, licensing, and registration'],
        des:
          'Process of checking, verifying, and attaining general information about the abilityl to comply with the standard. ',
      },
      {
        title: 'Policy Guidance and Information',
        tags: ['policy', 'policy guidance'],
        des:
          'Help and advice provided on a set of ideas or plans that is used as a basis for making decisions, especially in politics, economics, or business.',
      },
    ],
    desc:
      'Policy documents defined here as official (and occasionally unofficial translations of) documents that include public-facing laws and amendments, statutes, ordinances, management plans, executive orders, agreements, treaties, and memorandums of understanding, among others written and adopted by government entities, demonstrating an intent to reduce plastic pollution at varying stages of the plastics lifecycle.',
  },
  {
    code: 'financing',
    name: 'Financing Resource',
    examples: [
      {
        title:
          'Sustainable Development Bond on Sustainable Use of Oceans and Coastal Areas (“Blue Economy”)',
        link: 'https://digital.gpmarinelitter.org/financing-resource/50',
      },
      {
        title:
          'Project to tackle marine litter and plastic pollution in Southeast Asia (SEA)',
        link: 'https://digital.gpmarinelitter.org/financing-resource/56',
      },
      {
        title: 'Global Partnership on Marine Litter',
        link: 'https://digital.gpmarinelitter.org/financing-resource/58',
      },
      {
        title: 'AI for Earth Grant',
        link: 'https://digital.gpmarinelitter.org/financing-resource/71',
      },
      {
        title:
          'Norwegian Development Programme to Combat Marine Litter and Microplastics',
        link: 'https://digital.gpmarinelitter.org/financing-resource/248',
      },
      {
        title: 'Global Plastics Action Partnership (GPAP)',
        link: 'https://digital.gpmarinelitter.org/financing-resource/37',
      },
    ],
    childs: [
      {
        title: 'Equity Investment',
        tags: ['financing resources', 'equity investment'],
        des: 'Money that is invested in a company in the form of shares.',
      },
      {
        title: 'Venture Capital',
        tags: ['financing resources', 'venture capital'],
        des:
          'Money that is invested or is available for investment in a new company, especially one that involves risk.',
      },
      {
        title: 'Loans',
        tags: ['financing resources', 'loans'],
        des:
          'An amount of money that is borrowed, often from a bank, and has to be paid back, usually with an extra charge for borrowing.',
      },
      {
        title: 'Grants',
        tags: ['financing resources', 'grants'],
        des:
          'An amount of money that a government or other institution gives to an individual or to an organization for a particular purpose. ',
      },
      {
        title: 'Blended finance',
        tags: ['financing resources', 'blended finance'],
        des:
          'The strategic use of development finance for the mobilisation of additional finance towards sustainable development.',
      },
      {
        title: 'Multidonor trust fund',
        tags: ['financing resources', 'multidonor trust fund'],
        des:
          'A type of pooled funding involving multiple UN organisations and designed to receive contributions from donors to support specific national, regional or global results.',
      },
      {
        title: 'Sustainable development bonds, green bonds and blue bonds',
        tags: [
          'financing resources',
          'sustainable development bonds, green bonds, and blue bonds',
        ],
        des:
          'Debt securities issued by private or public entities to finance activities or projects linked to sustainable development, green goals, or ocean goals.',
      },
    ],
    desc:
      'Organizations or programmes providing financial support to entities tackling marine plastic litter. Such support includes grants, investment, and loans, among others.',
  },
  {
    code: 'technical',
    name: 'Technical Resource',
    examples: [
      {
        title: 'Plastic Pollution Calculator',
        link: 'https://digital.gpmarinelitter.org/technical-resource/138',
      },
      {
        title:
          'Harmonization of Microplastics Monitoring Methodologies in the Ocean',
        link: 'https://digital.gpmarinelitter.org/technical-resource/10007',
      },
      {
        title:
          'Guidelines For The Monitoring And Assessment Of Plastic Litter In The Ocean',
        link: 'https://digital.gpmarinelitter.org/technical-resource/10024',
      },
      {
        title: 'Marine Litter Vital Graphics',
        link: 'https://digital.gpmarinelitter.org/technical-resource/109',
      },
      {
        title:
          'Study on industry involvement in the integrated approach to financing the sound management of chemicals and waste, prepared by the SAICM Secretariat',
        link: 'https://digital.gpmarinelitter.org/technical-resource/10033',
      },
      {
        title: 'Harm caused by Marine Litter',
        link: 'https://digital.gpmarinelitter.org/technical-resource/250',
      },
    ],
    childs: [
      {
        title: 'Report & Assessment',
        tags: ['technical resources', 'report & assessment'],
        des:
          'A textual document made that present focused, salient content to a specific audience but is not limited to assessment reports, evaluation report, annual report, progress/quadrennial assessment report.',
      },
      {
        title: 'Guidance Documents',
        tags: ['technical resources', 'guidance documents'],
        des:
          'A document that gives advice or help on how to do or understand something.',
      },
      {
        title: 'Rules of Procedure and Mechanism',
        tags: ['technical resources', 'rules of procedure and mechanism'],
        des:
          'A natural or established process by which something takes place or is brought about.',
      },
      {
        title: 'Tools & Toolkits',
        tags: ['technical resources', 'tools & toolkits'],
        des:
          'A resource or set of resources that helps you to do a particular activity.',
      },
      {
        title: 'Working Document',
        tags: ['technical resources', 'working document'],
        des:
          'A type of technical report that is a work in progress, a preliminary form of a possible future document.',
      },
      {
        title: 'Educational & Outreach resources',
        tags: ['technical resources', 'educational & outreach resources'],
        des:
          'Any resource – including print and non-print materials and online/open-access resources – which supports and enhances, directly or indirectly, learning, teaching and awareness raising.',
      },
      {
        title: 'Courses & Trainings',
        tags: ['technical resources', 'courses & trainings'],
        des:
          'Unit of instruction comprising a sequence of educational activities in a particular field or range of related fields of education.',
      },
      {
        title: 'Case studies',
        tags: ['technical resources', 'case study'],
        des:
          'Initiatives or projects that can be used as an example to show general principles.',
      },
    ],
    desc:
      'Resources and mechanisms collected through research based on publicly available information. Examples of technical resources range from pilot projects, policy recommendations, assessments, calculation model and tools, operational and technical guidelines, toolkits for decision-makers, best practices, manuals and more.',
  },
  {
    code: 'event_flexible',
    name: 'Event',
    examples: [
      {
        title: 'SEA of Solutions 2021',
        link: 'https://digital.gpmarinelitter.org/event/10028',
      },
      {
        title: 'Glasgow Climate Change Conference',
        link: 'https://digital.gpmarinelitter.org/event/28',
      },
      {
        title: 'G-STIC Conference Second Edition',
        link: 'https://digital.gpmarinelitter.org/event/33',
      },
      {
        title: 'Reef Futures Symposium',
        link: 'https://digital.gpmarinelitter.org/event/30',
      },
      {
        title: 'Unleashing marine robots for good',
        link: 'https://digital.gpmarinelitter.org/event/10040',
      },
      {
        title:
          'Action for the Oceans – Youth leaders raising awareness for the Oceans, together!',
        link: 'https://digital.gpmarinelitter.org/event/36',
      },
    ],
    childs: [
      {
        title: 'Webinars & Seminars',
        tags: ['events', 'webinars & seminars'],
        des:
          'An online or face-to-face meeting of people to discuss and/or perform practical work in a subject or activity',
      },
      {
        title: 'Workshops',
        tags: ['events', 'workshops'],
        des:
          'A meeting of people to discuss and/or perform practical work in a subject or activity',
      },
      {
        title: 'Conferences',
        tags: ['events', 'conferences'],
        des:
          'Meetings, often lasting a few days, organized on a particular subject or to bring together people who have a common interest to exchange ideas and discuss issues, especially important public issues. ',
      },
      {
        title: 'Challenges & Contests ',
        tags: ['events', 'challenges & contests'],
        des:
          'An activity done by a number of people or organizations, each of which is trying to do better than all of the others',
      },
      {
        title: 'Courses & Trainings',
        tags: ['events', 'courses & trainings'],
        des:
          'Unit of instruction comprising a sequence of educational activities in a particular field or range of related fields of education. ',
      },
      {
        title: 'Awareness Raising',
        tags: ['events', 'awareness raising'],
        des:
          'Awareness-raising is a process that seeks to inform and educate people about a topic or issue with the intention of influencing their attitudes, behaviours and beliefs towards the achievement of a defined purpose or goal.1 It can mobilize the power of public opinion in support of an issue and thereby influence the political will of decision makers.2 There are multiple awareness-raising strategies, methods and tools that can be used to convey and spread messages, and to gather the support necessary to influence public opinion. ',
      },
    ],
    desc:
      'Upcoming capacity development activities and events on marine litter, plastic pollution and related topics.',
  },
  {
    code: 'technology',
    name: 'Technology',
    examples: [
      {
        title: 'Waste Free Oceans',
        link: 'https://digital.gpmarinelitter.org/technology/56',
      },
      {
        title:
          'Ellipsis: Machine learning and aerial imagery to identify, map, and track plastic waste',
        link: 'https://digital.gpmarinelitter.org/technology/58',
      },
      {
        title:
          'Fishing for Litter: Ocean cleaning project that involves fishermen who collect debris during fishing activities',
        link: 'https://digital.gpmarinelitter.org/technology/59',
      },
      {
        title:
          'Plastic Odyssey: The Expedition Around The World To Fight Against Plastic Pollution',
        link: 'https://digital.gpmarinelitter.org/technology/64',
      },
      {
        title:
          'SeaChange: Converting ocean plastics to inert, non-toxic glass safe for marine life',
        link: 'https://digital.gpmarinelitter.org/technology/66',
      },
      {
        title:
          'The 3R Initiative: Credit-based market system to encourage plastic recycling and recovery',
        link: 'https://digital.gpmarinelitter.org/technology/75',
      },
    ],
    childs: [
      {
        title: 'In market',
        tags: ['technology', 'in market'],
        des:
          'Within the geographical area that the provider offers the service',
      },
      {
        title: 'Scale up',
        tags: ['technology', 'scale up'],
        des:
          'Involves obtaining a faster server with more powerful processors and more memory. This solution uses less network hardware, and consumes less power; but ultimately, for many platforms may only provide a short-term fix, especially if continued growth is expected',
      },
      {
        title: 'Prototype',
        tags: ['technology', 'prototype'],
        des:
          'Is the first complete solution to the original challenge. The first “prototype” is the first time all parts of a solution are tested together. It is the first time that the inter-dependencies of all components can be tested, analyzed, and refined. ',
      },
      {
        title: 'Pilot',
        tags: ['technology', 'pilot'],
        des:
          'A solution that is to be tested on a small scale that is seen to be complete in its own right. Piloting can also be seen as the pre-scale phase of a new approach that focuses on quality, validation, time, cost, adverse events, and initial short-term impact.',
      },
      {
        title: 'Development',
        tags: ['technology', 'development'],
        des:
          'The systematic use of scientific, technical, economic, and commercial knowledge to meet specific business objectives or requirements.',
      },
      {
        title: 'Research',
        tags: ['technology', 'research'],
        des:
          'Creation of new knowledge and/or the use of existing knowledge in a new and creative way to generate new concepts, methodologies and understandings.',
      },
    ],
    desc:
      'A collection of technology solutions and of environmentally sound technologies, which identifies commercial solutions for the prevention of marine litter following a lifecycle approach, from source to sea, with a focus on both land-based and near-shore (litter capturing) technologies. Environmentally sound technologies, sections explaining alternative materials, chemical recycling, additives etc.',
  },
  {
    code: 'capacity_building',
    name: 'Capacity Development',
    examples: [
      {
        title: 'Our Coast is Dying',
        link: 'https://digital.gpmarinelitter.org/initiative/10150',
      },
      {
        title: 'Massive Open Online Course (MOOC) on Marine Litter',
        link: 'https://digital.gpmarinelitter.org/technical-resource/149',
      },
      {
        title: 'Raising Awareness Amongst Students',
        link: 'https://digital.gpmarinelitter.org/initiative/10151',
      },
      {
        title: 'Ocean Innovation Challenge',
        link: 'https://digital.gpmarinelitter.org/initiative/10063',
      },
      {
        title:
          'Action for the Oceans – Youth leaders raising awareness for the Oceans, together!',
        link: 'https://digital.gpmarinelitter.org/event/36',
      },
      {
        title:
          'Preparing a Waste Management Plan - A Methodological Guidance Note',
        link: 'https://digital.gpmarinelitter.org/technical-resource/84',
      },
    ],
    childs: [
      {
        title: 'Guidance Documents',
        des:
          'A document that gives advice or help on how to do or understand something.',
      },
      {
        title: 'Tools & Toolkits',
        des:
          'A resource or set of resources that helps you to do a particular activity.',
      },
      {
        title: 'Courses & Trainings',
        des:
          'Unit of instruction comprising a sequence of educational activities in a particular field or range of related fields of education.',
      },
      {
        title: 'Educational & Outreach resources',
        des:
          'Any resource – including print and non-print materials and online/open-access resources – which supports and enhances, directly or indirectly, learning, teaching and awareness raising.',
      },
      {
        title: 'Initiatives',
        des:
          'These include a wide range of actions from legislation, behaviour change initiatives, education, training, events, new technologies, monitoring and analysis initiatives and science Initiatives. Existing actions and initiatives have been collected via an online survey for voluntary inputs and narrative submissions. Initiatives are linked to a Dashboard.',
      },
      {
        title: 'Events',
        des: 'Upcoming trainings, capacity development activities and events.',
      },
      {
        title: 'Financing Resources',
        des:
          'Organizations or programmes providing financial support to entities tackling marine plastic litter. Such support includes grants, investment, and loans, among others.',
      },
      {
        title: 'Case studies',
        des:
          'Initiatives or projects that can be used as an example to show general principles.',
      },
    ],
    desc:
      'The definition of capacity development is broad. It is a holistic enterprise, encompassing a multitude of activities. It means building abilities, relationships and values that will enable organisations, groups and individuals to improve their performance and achieve their development objectives. It includes strengthening the processes, systems and rules that influence collective and individual behaviour and performance in all development endeavours. And it means enhancing people’s technical ability and willingness to play new developmental roles and adapt to new demands and situations.',
  },
]

const UIStore = new Store({
  tags: {},
  countries: [],
  currencies: [],
  relatedResource: [],
  profile: {},
  organisations: [],
  nonMemberOrganisations: [],
  community: [],
  languages: languages,
  geoCoverageTypeOptions: geoCoverageTypeOptions,
  entityRoleOptions: entityRole,
  individualRoleOptions: individualRole,
  regionOptions: [],
  meaOptions: [],
  transnationalOptions: [],
  organisationType: sectorOptions,
  sectorOptions: sectorOptions,
  representativeGroup: representativeGroup,
  entitySuggestedTags: entitySuggestedTags,
  stakeholderSuggestedTags: stakeholderSuggestedTags,
  mainContentType: mainContentType,
  icons: icons,
  placeholder: placeholder,
  menuList: menuList,
  selectedMainContentType: 'initiative',
  landing: {},
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
    stakeholder: 1,
  },
  formEdit: {
    signUp: {
      status: 'add',
      id: null,
    },
    flexible: {
      status: 'add',
      id: null,
    },
    initiative: {
      status: 'add',
      id: null,
    },
    actionPlan: {
      status: 'add',
      id: null,
    },
    policy: {
      status: 'add',
      id: null,
    },
    technicalResource: {
      status: 'add',
      id: null,
    },
    financingResource: {
      status: 'add',
      id: null,
    },
    event: {
      status: 'add',
      id: null,
    },
    technology: {
      status: 'add',
      id: null,
    },
    entity: {
      status: 'add',
      id: null,
    },
  },
})

export { UIStore }
