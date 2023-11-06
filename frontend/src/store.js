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
import { t, msg } from '@lingui/macro'
import { i18n } from '@lingui/core'

const geoCoverageTypeOptions = ['Global', 'Transnational', 'National']

const menuList = [
  {
    key: msg`Plastic`,
    id: 'Plastic',
    children: [
      {
        key: msg`Topics`,
        id: 'Topics',
      },
      {
        key: msg`Basics`,
        id: 'Basics',
      },
    ],
  },
  {
    key: msg`Tools`,
    id: 'Tools',
    children: [
      {
        key: msg`Information`,
        id: 'Information',
        children: [
          {
            to: '/knowledge/library',
            title: msg`Knowledge library`,
            subtitle: msg`Resources on marine litter and plastic pollution`,
            icon: <BookIcon />,
          },
          {
            to: '/knowledge/case-studies',
            title: msg`Case studies`,
            icon: <CaseStudiesSvg />,
            subtitle: msg`Compilation of actions around the world`,
            iconClass: 'casestudies',
          },
          {
            to: '/knowledge/capacity-development',
            title: msg`Learning center`,
            subtitle: msg`Learning and capacity development resources`,
            icon: <CapacityBuildingSvg />,
            iconClass: 'learning',
          },
          {
            to: '/help-center',
            title: msg`Help Center`,
            subtitle: msg`Support on GPML Digital Platform`,
            icon: <HelpCenterSvg />,
          },
        ],
      },
      {
        key: msg`Community`,
        id: 'Community',
        children: [
          {
            title: msg`Forum`,
            to: '/forum',
            subtitle: msg`Interactive forum for collaboration`,
            icon: <IconForum />,
          },
          {
            to: '/community',
            title: msg`Members`,
            iconClass: 'tools-community-icon',
            subtitle: msg`Directory of GPML network entities and individuals`,
            icon: <IconCommunity />,
          },
          {
            to: '/experts',
            title: msg`Experts`,
            iconClass: 'tools-experts-icon',
            subtitle: msg`Tool to find an expert and experts' groups`,
            icon: <ExpertIcon />,
          },
          {
            to: '/events',
            title: msg`Events`,
            subtitle: msg`Global events calendar`,
            icon: <IconEvent />,
          },
          {
            to: '/partners',
            title: msg`Partners`,
            iconClass: 'tools-partners-icon',
            subtitle: msg`Directory of partners of the GPML Digital Platform`,
            icon: <IconPartner />,
          },
        ],
      },
      {
        key: msg`Data hub`,
        id: 'Data hub',
        children: [
          {
            href: 'https://datahub.gpmarinelitter.org',
            title: msg`Analytics & statistics`,
            subtitle: msg`Metrics to measure progress`,
            icon: <AnalyticAndStatisticSvg />,
          },
          {
            href: 'https://unepazecosysadlsstorage.z20.web.core.windows.net/',
            title: msg`Data Catalogue`,
            subtitle: msg`Datasets on plastic pollution and marine litter`,
            icon: <DataCatalogueSvg />,
          },
          {
            href: 'https://datahub.gpmarinelitter.org/pages/glossary/',
            title: msg`Glossary`,
            subtitle: msg`Terminology and definitions`,
            icon: <GlossarySvg />,
          },
          {
            href: 'https://datahub.gpmarinelitter.org/pages/story_map',
            title: msg`Story Maps`,
            subtitle: msg`Storytelling with custom maps`,
            icon: <MapSvg />,
          },
          {
            href: 'https://datahub.gpmarinelitter.org/pages/api-explore',
            title: msg`API explore`,
            subtitle: msg`Web services and APIs`,
            icon: <ExploreSvg />,
          },
        ],
      },
    ],
  },
  {
    key: msg`About Us`,
    id: 'About Us',
    children: [
      {
        key: msg`The platform`,
        id: 'The platform',
      },
      {
        key: msg`Our Network`,
        id: 'Our Network',
      },
      {
        key: msg`Partnership`,
        id: 'Partnership',
        type: 'button',
        link: '',
        text: msg`Go to GPML`,
      },
      {
        key: msg`Contact us`,
        id: 'Contact us',
        type: 'button',
        link: '',
        text: msg`Contact us`,
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

const entityRole = [`Owner`, `Implementor`, `Partner`, `Donor`]
const individualRole = [`Owner`, `Resource Editor`]

const sectorOptions = [
  `Government`,
  `Private Sector`,
  `Foundations`,
  `Scientific and Technological Community and Academia`,
  `Non-Governmental Organization (NGO) and other Major Groups and Stakeholder (MGS)`,
  `Intergovernmental Organization (IGOs) and Multilateral Processes Actors`,
  `Private Citizens`,
]

const entitySuggestedTags = [
  t`Circularity`,
  t`Education`,
  t`Awareness`,
  t`Awareness-raising`,
  t`Monitoring`,
  t`Research`,
  t`Waste management`,
  t`Recycling`,
  t`Technology`,
  t`Financing`,
  t`Project development`,
  t`Legislation`,
  t`Policy`,
  t`Sea-based Sources`,
  t`ALDFG`,
  t`Microplastics`,
  t`Microfibers`,
  t`International Cooperation`,
  t`Multilateralism`,
]

const stakeholderSuggestedTags = [
  t`Waste management`,
  t`Ocean and coast`,
  t`Freshwater`,
  t`Biota`,
  t`Chemicals`,
  t`Microplastics`,
  t`Wastewater`,
  t`Environmental justice`,
  t`Human health`,
  t`Gender`,
  t`Circularity`,
  t`Data monitoring`,
  t`Citizen science`,
  t`Data analysis`,
  t`Technology and innovation`,
  t`Capacity building`,
  t`Financing`,
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
    name: `Government`,
    childs: [`National`, `State/Provincial`, `Municipal`],
  },
  {
    code: 'private-sector',
    name: `Private Sector (for-profit)`,
    childs: { tags: 'sector' }, // All sectors list from tags group
  },
  {
    code: 'igos',
    name: `Intergovernmental Organizations (IGOs)`,
    childs: null,
  },
  {
    code: 'academia-research',
    name: `Academia and Research`,
    childs: [`Public Institute`, `Privately Owned`],
  },
  {
    code: 'civil-society',
    name: `Civil Society (not-for-profit)`,
    childs: [`Non-Governmental Organization (NGOs)`, `Foundations`],
  },
]

const mainContentType = [
  {
    code: 'initiative',
    name: t`Initiative`,
    examples: [
      {
        title: t`Sustainable Industrial Zone Development`,
        link: 'https://digital.gpmarinelitter.org/initiative/10031',
      },
      {
        title: t`Environmentally Sound Management and Destruction of PCBs`,
        link: 'https://digital.gpmarinelitter.org/initiative/10033',
      },
      {
        title: t`Plastic Waste Management`,
        link: 'https://digital.gpmarinelitter.org/initiative/10078',
      },
      {
        title: t`Make Lome Plastic Free`,
        link: 'https://digital.gpmarinelitter.org/initiative/10149',
      },
      {
        title: t`SB 270: Statewide Bag Ban`,
        link: 'https://digital.gpmarinelitter.org/initiative/10145',
      },
      {
        title: t`California Ocean Litter Prevention Strategy`,
        link: 'https://digital.gpmarinelitter.org/initiative/10177',
      },
    ],
    childs: [
      {
        title: `Legislation, standards, rules`,
        tags: ['initiatives', 'policy', 'legislation', 'standards'],
        des: t`Agreeing new or changing rules or standards that others should comply with, new regulation, agreements, policies, economic instruments etc. including voluntary commitments).`,
      },
      {
        title: t`Working with people`,
        tags: ['initiatives', 'working with people', 'capacity development'],
        des: t`Encouraging or enabling others, e.g., education, training, communication, awareness raising, behaviour change programmes`,
      },
      {
        title: t`Technology and Processes`,
        tags: ['initiatives', 'technology and processes'],
        des: t`New technical developments/innovation, e.g., research and development, new product design, new materials, processes etc., changes in practice, operations, environmental management and planning.`,
      },
      {
        title: t`Monitoring and Analysis`,
        tags: ['initiatives', 'monitoring and analysis'],
        des: t`Collecting evidence around plastic discharge to the ocean/waterways, e.g., monitoring, analysis`,
      },
    ],
    desc: t`These include a wide range of actions from legislation, behaviour change initiatives, education, training, events, new technologies, monitoring and analysis initiatives and science Initiatives. Existing actions and initiatives have been collected via an online survey for voluntary inputs and narrative submissions. Initiatives are linked to a Dashboard.`,
  },
  {
    code: 'action',
    name: t`Action Plan`,
    examples: [
      {
        title: t`PAME, Regional Action Plan on Marine Litter in the Arctic (May 2021)`,
        link: 'https://digital.gpmarinelitter.org/action-plan/10017',
      },
      {
        title: t`HELCOM Regional action plan on marine litter`,
        link: 'https://digital.gpmarinelitter.org/action-plan/122',
      },
      {
        title: t`Gulf of Mexico Alliance Regional Action Plan`,
        link: 'https://digital.gpmarinelitter.org/action-plan/260',
      },
      {
        title: t`ASEAN Regional Action Plan for Combating Marine Debris in the ASEAN Member States (2021 – 2025)`,
        link: 'https://digital.gpmarinelitter.org/action-plan/10008',
      },
      {
        title: t`COBSEA Regional Action Plan on Marine Litter 2019`,
        link: 'https://digital.gpmarinelitter.org/action-plan/196',
      },
      {
        title: t`Marine Litter in the Black Sea Region`,
        link: 'https://digital.gpmarinelitter.org/action-plan/194',
      },
    ],
    childs: [
      {
        title: `Global Action Plan`,
        tags: ['action plan', 'global'],
        des: t`Worldwide Coverage`,
      },
      {
        title: t`Transnational Action Plan`,
        tags: ['action plan', 'transnational'],
        des: t`Covers two or more countries`,
      },
      {
        title: t`National Action Plan`,
        tags: ['action plan', 'national'],
        des: t`Covers an entire country`,
      },
      {
        title: t`Sub-national Action Plan`,
        tags: ['action plan', 'sub-national'],
        des: t`Covers part of a country e.g, city, or federal state`,
      },
    ],
    desc: t`An action plan is a detailed plan outlining actions needed to reach one or more goals. Alternatively, it can be defined as a sequence of steps that must be taken, or activities that must be performed well, for a strategy to succeed. Development of action plans is required under many multilateral environmental agreements to facilitate implementation.`,
  },
  {
    code: 'policy',
    name: t`Policy`,
    examples: [
      {
        title: t`The National Environmental Act - Order No. 2034/33`,
        link: 'https://digital.gpmarinelitter.org/policy/10539',
      },
      {
        title: t`The Act to Prevent Pollution from Ships`,
        link: 'https://digital.gpmarinelitter.org/policy/10531',
      },
      {
        title: t`Sub-Decree No. 168 on the management of plastic bags`,
        link: 'https://digital.gpmarinelitter.org/policy/10524',
      },
    ],
    childs: [
      {
        title: t`Legislations, Regulations & Standards`,
        tags: ['policy', 'legislations, regulations & standards'],
        des: t`Measures taken by governmental units to influence people by means of formulated rules and directives which mandate receivers act in accordance with what is ordered in these rules or directives.`,
      },
      {
        title: t`Prohibitive Regulations, Bans & Restrictions`,
        tags: ['policy', 'legislations, regulations & standards'],
        des: t`Rules of an obligatory nature that are negative, disallowing certain phenomena or actions.`,
      },
      {
        title: t`Strategies & Action Plans`,
        tags: ['policy', 'strategies & action plans'],
        des: t`Decisions designed to create favorable impact on key factors to create a desired outcome.`,
      },
      {
        title: t`Economic Instruments`,
        tags: ['policy', 'economic instruments'],
        des: t`Incentive measures bring about an intended behaviour or outcome as an alternative to command and control measures - legal codes and prescriptions.`,
      },
      {
        title: t`Certification, Licensing and Registration`,
        tags: ['policy', 'certification, licensing, and registration'],
        des: t`Process of checking, verifying, and attaining general information about the abilityl to comply with the standard. `,
      },
      {
        title: t`Policy Guidance and Information`,
        tags: ['policy', 'policy guidance'],
        des: t`Help and advice provided on a set of ideas or plans that is used as a basis for making decisions, especially in politics, economics, or business.`,
      },
    ],
    desc: t`Policy documents defined here as official (and occasionally unofficial translations of) documents that include public-facing laws and amendments, statutes, ordinances, management plans, executive orders, agreements, treaties, and memorandums of understanding, among others written and adopted by government entities, demonstrating an intent to reduce plastic pollution at varying stages of the plastics lifecycle.`,
  },
  {
    code: 'financing',
    name: t`Financing Resource`,
    examples: [
      {
        title: t`Sustainable Development Bond on Sustainable Use of Oceans and Coastal Areas (“Blue Economy”)`,
        link: 'https://digital.gpmarinelitter.org/financing-resource/50',
      },
      {
        title: t`Project to tackle marine litter and plastic pollution in Southeast Asia (SEA)`,
        link: 'https://digital.gpmarinelitter.org/financing-resource/56',
      },
      {
        title: t`Global Partnership on Marine Litter`,
        link: 'https://digital.gpmarinelitter.org/financing-resource/58',
      },
      {
        title: t`AI for Earth Grant`,
        link: 'https://digital.gpmarinelitter.org/financing-resource/71',
      },
      {
        title: t`Norwegian Development Programme to Combat Marine Litter and Microplastics`,
        link: 'https://digital.gpmarinelitter.org/financing-resource/248',
      },
      {
        title: t`Global Plastics Action Partnership (GPAP)`,
        link: 'https://digital.gpmarinelitter.org/financing-resource/37',
      },
    ],
    childs: [
      {
        title: t`Equity Investment`,
        tags: ['financing resources', 'equity investment'],
        des: t`Money that is invested in a company in the form of shares.`,
      },
      {
        title: t`Venture Capital`,
        tags: ['financing resources', 'venture capital'],
        des: t`Money that is invested or is available for investment in a new company, especially one that involves risk.`,
      },
      {
        title: t`Loans`,
        tags: ['financing resources', 'loans'],
        des: t`An amount of money that is borrowed, often from a bank, and has to be paid back, usually with an extra charge for borrowing.`,
      },
      {
        title: t`Grants`,
        tags: ['financing resources', 'grants'],
        des: t`An amount of money that a government or other institution gives to an individual or to an organization for a particular purpose. `,
      },
      {
        title: t`Blended finance`,
        tags: ['financing resources', 'blended finance'],
        des: t`The strategic use of development finance for the mobilisation of additional finance towards sustainable development.`,
      },
      {
        title: t`Multidonor trust fund`,
        tags: ['financing resources', 'multidonor trust fund'],
        des: t`A type of pooled funding involving multiple UN organisations and designed to receive contributions from donors to support specific national, regional or global results.`,
      },
      {
        title: t`Sustainable development bonds, green bonds and blue bonds`,
        tags: [
          'financing resources',
          'sustainable development bonds, green bonds, and blue bonds',
        ],
        des: t`Debt securities issued by private or public entities to finance activities or projects linked to sustainable development, green goals, or ocean goals.`,
      },
    ],
    desc: t`Organizations or programmes providing financial support to entities tackling marine plastic litter. Such support includes grants, investment, and loans, among others.`,
  },
  {
    code: 'technical',
    name: t`Technical Resource`,
    examples: [
      {
        title: t`Plastic Pollution Calculator`,
        link: 'https://digital.gpmarinelitter.org/technical-resource/138',
      },
      {
        title: t`Harmonization of Microplastics Monitoring Methodologies in the Ocean`,
        link: 'https://digital.gpmarinelitter.org/technical-resource/10007',
      },
      {
        title: t`Guidelines For The Monitoring And Assessment Of Plastic Litter In The Ocean`,
        link: 'https://digital.gpmarinelitter.org/technical-resource/10024',
      },
      {
        title: t`Marine Litter Vital Graphics`,
        link: 'https://digital.gpmarinelitter.org/technical-resource/109',
      },
      {
        title: t`Study on industry involvement in the integrated approach to financing the sound management of chemicals and waste, prepared by the SAICM Secretariat`,
        link: 'https://digital.gpmarinelitter.org/technical-resource/10033',
      },
      {
        title: t`Harm caused by Marine Litter`,
        link: 'https://digital.gpmarinelitter.org/technical-resource/250',
      },
    ],
    childs: [
      {
        title: t`Report & Assessment`,
        tags: ['technical resources', 'report & assessment'],
        des: t`A textual document made that present focused, salient content to a specific audience but is not limited to assessment reports, evaluation report, annual report, progress/quadrennial assessment report.`,
      },
      {
        title: t`Guidance Documents`,
        tags: ['technical resources', 'guidance documents'],
        des: t`A document that gives advice or help on how to do or understand something.`,
      },
      {
        title: t`Rules of Procedure and Mechanism`,
        tags: ['technical resources', 'rules of procedure and mechanism'],
        des: t`A natural or established process by which something takes place or is brought about.`,
      },
      {
        title: t`Tools & Toolkits`,
        tags: ['technical resources', 'tools & toolkits'],
        des: t`A resource or set of resources that helps you to do a particular activity.`,
      },
      {
        title: t`Working Document`,
        tags: ['technical resources', 'working document'],
        des: t`A type of technical report that is a work in progress, a preliminary form of a possible future document.`,
      },
      {
        title: t`Educational & Outreach resources`,
        tags: ['technical resources', 'educational & outreach resources'],
        des: t`Any resource – including print and non-print materials and online/open-access resources – which supports and enhances, directly or indirectly, learning, teaching and awareness raising.`,
      },
      {
        title: t`Courses & Trainings`,
        tags: ['technical resources', 'courses & trainings'],
        des: t`Unit of instruction comprising a sequence of educational activities in a particular field or range of related fields of education.`,
      },
      {
        title: t`Case studies`,
        tags: ['technical resources', 'case study'],
        des: t`Initiatives or projects that can be used as an example to show general principles.`,
      },
    ],
    desc: t`Resources and mechanisms collected through research based on publicly available information. Examples of technical resources range from pilot projects, policy recommendations, assessments, calculation model and tools, operational and technical guidelines, toolkits for decision-makers, best practices, manuals and more.`,
  },
  {
    code: 'event_flexible',
    name: t`Event`,
    examples: [
      {
        title: t`SEA of Solutions 2021`,
        link: 'https://digital.gpmarinelitter.org/event/10028',
      },
      {
        title: t`Glasgow Climate Change Conference`,
        link: 'https://digital.gpmarinelitter.org/event/28',
      },
      {
        title: t`G-STIC Conference Second Edition`,
        link: 'https://digital.gpmarinelitter.org/event/33',
      },
      {
        title: t`Reef Futures Symposium`,
        link: 'https://digital.gpmarinelitter.org/event/30',
      },
      {
        title: t`Unleashing marine robots for good`,
        link: 'https://digital.gpmarinelitter.org/event/10040',
      },
      {
        title: t`Action for the Oceans – Youth leaders raising awareness for the Oceans, together!`,
        link: 'https://digital.gpmarinelitter.org/event/36',
      },
    ],
    childs: [
      {
        title: t`Webinars & Seminars`,
        tags: ['events', 'webinars & seminars'],
        des: t`An online or face-to-face meeting of people to discuss and/or perform practical work in a subject or activity`,
      },
      {
        title: t`Workshops`,
        tags: ['events', 'workshops'],
        des: t`A meeting of people to discuss and/or perform practical work in a subject or activity`,
      },
      {
        title: t`Conferences`,
        tags: ['events', 'conferences'],
        des: t`Meetings, often lasting a few days, organized on a particular subject or to bring together people who have a common interest to exchange ideas and discuss issues, especially important public issues. `,
      },
      {
        title: t`Challenges & Contests`,
        tags: ['events', 'challenges & contests'],
        des: t`An activity done by a number of people or organizations, each of which is trying to do better than all of the others`,
      },
      {
        title: t`Courses & Trainings`,
        tags: ['events', 'courses & trainings'],
        des: t`Unit of instruction comprising a sequence of educational activities in a particular field or range of related fields of education.`,
      },
      {
        title: t`Awareness Raising`,
        tags: ['events', 'awareness raising'],
        des: t`Awareness-raising is a process that seeks to inform and educate people about a topic or issue with the intention of influencing their attitudes, behaviours and beliefs towards the achievement of a defined purpose or goal.1 It can mobilize the power of public opinion in support of an issue and thereby influence the political will of decision makers.2 There are multiple awareness-raising strategies, methods and tools that can be used to convey and spread messages, and to gather the support necessary to influence public opinion.`,
      },
    ],
    desc: t`Upcoming capacity development activities and events on marine litter, plastic pollution and related topics.`,
  },
  {
    code: 'technology',
    name: t`Technology`,
    examples: [
      {
        title: t`Waste Free Oceans`,
        link: 'https://digital.gpmarinelitter.org/technology/56',
      },
      {
        title: t`Ellipsis: Machine learning and aerial imagery to identify, map, and track plastic waste`,
        link: 'https://digital.gpmarinelitter.org/technology/58',
      },
      {
        title: t`Fishing for Litter: Ocean cleaning project that involves fishermen who collect debris during fishing activities`,
        link: 'https://digital.gpmarinelitter.org/technology/59',
      },
      {
        title: t`Plastic Odyssey: The Expedition Around The World To Fight Against Plastic Pollution`,
        link: 'https://digital.gpmarinelitter.org/technology/64',
      },
      {
        title: t`SeaChange: Converting ocean plastics to inert, non-toxic glass safe for marine life`,
        link: 'https://digital.gpmarinelitter.org/technology/66',
      },
      {
        title: t`The 3R Initiative: Credit-based market system to encourage plastic recycling and recovery`,
        link: 'https://digital.gpmarinelitter.org/technology/75',
      },
    ],
    childs: [
      {
        title: t`In market`,
        tags: ['technology', 'in market'],
        des: t`Within the geographical area that the provider offers the service`,
      },
      {
        title: t`Scale up`,
        tags: ['technology', 'scale up'],
        des: t`Involves obtaining a faster server with more powerful processors and more memory. This solution uses less network hardware, and consumes less power; but ultimately, for many platforms may only provide a short-term fix, especially if continued growth is expected`,
      },
      {
        title: t`Prototype`,
        tags: ['technology', 'prototype'],
        des: t`Is the first complete solution to the original challenge. The first “prototype” is the first time all parts of a solution are tested together. It is the first time that the inter-dependencies of all components can be tested, analyzed, and refined.`,
      },
      {
        title: t`Pilot`,
        tags: ['technology', 'pilot'],
        des: t`A solution that is to be tested on a small scale that is seen to be complete in its own right. Piloting can also be seen as the pre-scale phase of a new approach that focuses on quality, validation, time, cost, adverse events, and initial short-term impact.`,
      },
      {
        title: t`Development`,
        tags: ['technology', 'development'],
        des: t`The systematic use of scientific, technical, economic, and commercial knowledge to meet specific business objectives or requirements.`,
      },
      {
        title: t`Research`,
        tags: ['technology', 'research'],
        des: t`Creation of new knowledge and/or the use of existing knowledge in a new and creative way to generate new concepts, methodologies and understandings.`,
      },
    ],
    desc: t`A collection of technology solutions and of environmentally sound technologies, which identifies commercial solutions for the prevention of marine litter following a lifecycle approach, from source to sea, with a focus on both land-based and near-shore (litter capturing) technologies. Environmentally sound technologies, sections explaining alternative materials, chemical recycling, additives etc.`,
  },
  {
    code: 'capacity_building',
    name: t`Capacity Development`,
    examples: [
      {
        title: t`Our Coast is Dying`,
        link: 'https://digital.gpmarinelitter.org/initiative/10150',
      },
      {
        title: t`Massive Open Online Course (MOOC) on Marine Litter`,
        link: 'https://digital.gpmarinelitter.org/technical-resource/149',
      },
      {
        title: t`Raising Awareness Amongst Students`,
        link: 'https://digital.gpmarinelitter.org/initiative/10151',
      },
      {
        title: t`Ocean Innovation Challenge`,
        link: 'https://digital.gpmarinelitter.org/initiative/10063',
      },
      {
        title: t`Action for the Oceans – Youth leaders raising awareness for the Oceans, together!`,
        link: 'https://digital.gpmarinelitter.org/event/36',
      },
      {
        title: t`Preparing a Waste Management Plan - A Methodological Guidance Note`,
        link: 'https://digital.gpmarinelitter.org/technical-resource/84',
      },
    ],
    childs: [
      {
        title: t`Guidance Documents`,
        des: t`A document that gives advice or help on how to do or understand something.`,
      },
      {
        title: t`Tools & Toolkits`,
        des: t`A resource or set of resources that helps you to do a particular activity.`,
      },
      {
        title: t`Courses & Trainings`,
        des: t`Unit of instruction comprising a sequence of educational activities in a particular field or range of related fields of education.`,
      },
      {
        title: t`Educational & Outreach resources`,
        des: t`Any resource – including print and non-print materials and online/open-access resources – which supports and enhances, directly or indirectly, learning, teaching and awareness raising.`,
      },
      {
        title: t`Initiatives`,
        des: t`These include a wide range of actions from legislation, behaviour change initiatives, education, training, events, new technologies, monitoring and analysis initiatives and science Initiatives. Existing actions and initiatives have been collected via an online survey for voluntary inputs and narrative submissions. Initiatives are linked to a Dashboard.`,
      },
      {
        title: t`Events`,
        des: t`Upcoming trainings, capacity development activities and events.`,
      },
      {
        title: t`Financing Resources`,
        des: t`Organizations or programmes providing financial support to entities tackling marine plastic litter. Such support includes grants, investment, and loans, among others.`,
      },
      {
        title: t`Case studies`,
        des: t`Initiatives or projects that can be used as an example to show general principles.`,
      },
    ],
    desc: t`The definition of capacity development is broad. It is a holistic enterprise, encompassing a multitude of activities. It means building abilities, relationships and values that will enable organisations, groups and individuals to improve their performance and achieve their development objectives. It includes strengthening the processes, systems and rules that influence collective and individual behaviour and performance in all development endeavours. And it means enhancing people’s technical ability and willingness to play new developmental roles and adapt to new demands and situations.`,
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

const ChatStore = new Store({
  myForums: [],
  isLoggedIn: false,
})

export { UIStore, ChatStore }
