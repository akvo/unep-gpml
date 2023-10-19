import { UIStore } from '../../store'
const {
  geoCoverageTypeOptions,
  languages,
  entityRoleOptions,
  individualRoleOptions,
} = UIStore.currentState
import { t } from '@lingui/macro'

import { newGeoCoverageFormat } from '../../utils/geo'

const sdgsOptions = [
  {
    goal: 1,
    name: t`No Poverty`,
  },
  {
    goal: 2,
    name: t`Zero Hunger`,
  },
  {
    goal: 3,
    name: t`Good Health and Well-being`,
  },
  {
    goal: 4,
    name: t`Quality Education`,
  },
  {
    goal: 5,
    name: t`Gender Equality`,
  },
  {
    goal: 6,
    name: t`Clean Water and Sanitation`,
  },
  {
    goal: 7,
    name: t`Affordable and Clean Energy`,
  },
  {
    goal: 8,
    name: t`Decent Jobs and Economic Growth`,
  },
  {
    goal: 9,
    name: t`Industry, Innovation and Infrastructure`,
  },
  {
    goal: 10,
    name: t`Reduced Inequalities`,
  },
  {
    goal: 11,
    name: t`Sustainable Cities and Communities`,
  },
  {
    goal: 12,
    name: t`Responsible Consumption and Production`,
  },
  {
    goal: 13,
    name: t`Climate Action`,
  },
  {
    goal: 14,
    name: t`Life Below Water`,
  },
  {
    goal: 15,
    name: t`Life on Land`,
  },
  {
    goal: 16,
    name: t`Peace and Justice - Strong Institutions`,
  },
  {
    goal: 17,
    name: t`Partnerships for the Goals`,
  },
]

export const schema = {
  initiative: {
    type: 'object',
    version: '2',
    label: 'initiative',
    properties: {
      S4: {
        title: '',
        type: 'object',
        depend: {
          id: 'tabs',
          value: ['S4'],
        },
        properties: {
          S4_G1: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 0,
            },
            required: ['title', 'summary', 'url'],
            properties: {
              title: {
                title: t`Title`,
                type: 'string',
              },
              summary: {
                title: t`Description`,
                type: 'string',
              },
              url: {
                title: t`URL`,
                type: 'string',
                format: 'url',
              },
            },
          },
          S4_G2: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 1,
            },
            required: [
              'geoCoverageType',
              'S4_G2_24.4',
              'S4_G2_24.3',
              'S4_G2_24.2',
              'geoCoverageValueSubnational',
            ],
            properties: {
              geoCoverageType: {
                title: t`Select Geo-Coverage Type`,
                type: 'string',
                enum: ['global', 'transnational', 'national', 'sub-national'],
                enumNames: [
                  t`Global`,
                  t`Transnational`,
                  t`National`,
                  t`Subnational`,
                ],
              },
              'S4_G2_24.3': {
                title: t`GEO COVERAGE (Transnational)`,
                type: 'string',
                enum: [],
                enumNames: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['transnational'],
                },
              },
              'S4_G2_24.4': {
                title: t`GEO COVERAGE (Countries)`,
                type: 'string',
                enum: [],
                enumNames: [],
                depend: {
                  id: 'S4_G2_24.3',
                  value: ['-1'],
                },
              },
              'S4_G2_24.2': {
                title: t`National`,
                type: 'string',
                enum: [],
                enumNames: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['national'],
                },
              },
              geoCoverageValueSubnational: {
                title: t`Select a country`,
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['sub-national'],
                },
              },
              geoCoverageCountryStates: {
                title: t`State`,
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['sub-national'],
                },
              },
            },
          },
          S4_G3: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 2,
            },
            required: ['tags'],
            properties: {
              tags: {
                title: t`Tags`,
                enum: [],
              },
            },
          },
          S4_G4: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 3,
            },
            required: [],
            properties: {
              image: {
                title: t`Banner`,
                type: 'string',
                format: 'data-url',
              },
              thumbnail: {
                title: t`Thumbnail (300x400)`,
                type: 'string',
                format: 'data-url',
              },
            },
          },
          S4_G5: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 4,
            },
            required: [],
            properties: {
              entity: {
                title: t`Entity connection`,
                description: 'entity',
                custom: 'entity',
                type: 'array',
                items: {
                  title: '',
                  type: 'object',
                  required: ['role', 'entity'],
                  properties: {
                    role: {
                      title: t`Entity role`,
                      enum: entityRoleOptions.map((x) => x.toLowerCase()),
                      enumNames: entityRoleOptions,
                    },
                    entity: {
                      title: 'Entity',
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual: {
                title: t`Individual connection`,
                description: 'individual',
                custom: 'stakeholder',
                type: 'array',
                items: {
                  title: '',
                  type: 'object',
                  required: ['role', 'stakeholder'],
                  properties: {
                    role: {
                      title: t`User role`,
                      enum: individualRoleOptions.map((x) =>
                        x !== 'Resource Editor'
                          ? x.toLowerCase()
                          : x.toLowerCase().replace(/ /g, '_')
                      ),
                      enumNames: individualRoleOptions,
                    },
                    stakeholder: {
                      title: t`Indvidual`,
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
            },
          },
          S4_G6: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 5,
            },
            properties: {
              info: {
                title: t`Info And Docs`,
                type: 'string',
              },
              related: {
                title: t`Related Resource`,
                enum: [],
                enumNames: [],
              },
            },
          },
        },
      },
      S5: {
        title: '',
        type: 'object',
        depend: {
          id: 'tabs',
          value: ['S5'],
        },
        properties: {
          S5_G1: {
            title: '',
            type: 'object',
            required: [],
            properties: {
              S5_G1_4: {
                title: t`What is the MAIN focus of the initiative? (Please tick ALL that apply).`,
                type: 'array',
                dependency: [
                  {
                    value: ['4-0'],
                    questions: ['S5_G1_4.1.1', 'S5_G1_4.1.2'],
                  },
                  {
                    value: ['4-1'],
                    questions: ['S5_G1_4.2.1', 'S5_G1_4.2.2'],
                  },
                  {
                    value: ['4-2'],
                    questions: ['S5_G1_4.3.1', 'S5_G1_4.3.2'],
                  },
                  {
                    value: ['4-3'],
                    questions: [
                      'S5_G1_4.4.1',
                      'S5_G1_4.4.2',
                      'S5_G1_4.4.3',
                      'S5_G1_4.4.4',
                      'S5_G1_4.4.5',
                    ],
                  },
                ],
                items: {
                  enum: ['4-0', '4-1', '4-2', '4-3'],
                  enumNames: [
                    t`LEGISLATION, STANDARDS, RULES (e.g., agreeing new or changing rules or standards that others should comply with, new regulation, agreements, policies, economic instruments etc. including voluntary commitments).`,
                    t`WORKING WITH PEOPLE (encouraging or enabling others, e.g., education, training, communication, awareness raising, behaviour change programmes).`,
                    t`TECHNOLOGY and PROCESSES (new technical developments/innovation, e.g., research and development, new product design, new materials, processes etc., changes in practice, operations, environmental management and planning).`,
                    t`MONITORING and ANALYSIS (collecting evidence around plastic discharge to the ocean/waterways, e.g., monitoring, analysis).`,
                  ],
                },
                uniqueItems: true,
              },
              'S5_G1_4.1.1': {
                title: t`Legislation, Standards and Rules. You have selected legislation, standards and rules as the type of initiative. What did the initiative specifically involve? (Please tick ALL that apply):`,
                type: 'array',
                dependency: [
                  {
                    value: ['4.1.1-10'],
                    questions: ['S5_G1_4.1.2'],
                  },
                ],
                depend: {
                  id: 'S5_G1_4',
                  value: ['4-0'],
                },
                items: {
                  enum: [
                    '4.1.1-0',
                    '4.1.1-1',
                    '4.1.1-2',
                    '4.1.1-3',
                    '4.1.1-4',
                    '4.1.1-5',
                    '4.1.1-6',
                    '4.1.1-7',
                    '4.1.1-8',
                    '4.1.1-9',
                    '4.1.1-10',
                  ],
                  enumNames: [
                    t`Official agreements`,
                    t`Policy change or development`,
                    t`High-level strategy`,
                    t`Legislation or regulations`,
                    t`Voluntary commitments`,
                    t`New standard(s) or guideline(s)`,
                    t`Change in taxes/subsidies`,
                    t`Subsidy/financial incentives`,
                    t`Ban(s)`,
                    t`Package of measures combining incentives and infrastructure (e.g. deposit reward schemes)`,
                    t`Other`,
                  ],
                },
                uniqueItems: true,
              },
              'S5_G1_4.1.2': {
                title: t`If you selected "Other", please specify`,
                type: 'string',
                depend: {
                  id: 'S5_G1_4.1.1',
                  value: ['4.1.1-10'],
                },
              },
              'S5_G1_4.2.1': {
                title: t`Working with People. You have chosen working with people as the type of initiative. What did the initiative specifically involve? (Please tick ALL that apply):`,
                type: 'array',
                dependency: [
                  {
                    value: ['4.2.1-18'],
                    questions: ['S5_G1_4.2.2'],
                  },
                ],
                depend: {
                  id: 'S5_G1_4',
                  value: ['4-1'],
                },
                items: {
                  enum: [
                    '4.2.1-0',
                    '4.2.1-1',
                    '4.2.1-2',
                    '4.2.1-3',
                    '4.2.1-4',
                    '4.2.1-5',
                    '4.2.1-6',
                    '4.2.1-7',
                    '4.2.1-8',
                    '4.2.1-9',
                    '4.2.1-10',
                    '4.2.1-11',
                    '4.2.1-12',
                    '4.2.1-13',
                    '4.2.1-14',
                    '4.2.1-15',
                    '4.2.1-16',
                    '4.2.1-17',
                    '4.2.1-18',
                  ],
                  enumNames: [
                    t`Awareness raising and behaviour change`,
                    t`Education/Training`,
                    t`Workshops`,
                    t`Conferences`,
                    t`Information campaign`,
                    t`Behaviour change campaign/programme`,
                    t`Community engagement`,
                    t`Stakeholder engagement`,
                    t`Citizen science`,
                    t`Curriculum development`,
                    t`Professional skills training`,
                    t`Other training programmes`,
                    t`Life-long learning`,
                    t`Institutional development`,
                    t`Primary school`,
                    t`Secondary school`,
                    t`Tertiary higher education`,
                    t`Creative/arts event/exhibition`,
                    t`Other`,
                  ],
                },
                uniqueItems: true,
              },
              'S5_G1_4.2.2': {
                title: t`If you selected "Other", please specify:`,
                type: 'string',
                depend: {
                  id: 'S5_G1_4.2.1',
                  value: ['4.2.1-18'],
                },
              },
              'S5_G1_4.3.1': {
                title: t`Technology and Processes. You have chosen technology and processes as the type of initiative. What did the initiative specifically involve? (Please tick ALL that apply):`,
                type: 'array',
                dependency: [
                  {
                    value: ['4.3.1-21'],
                    questions: ['S5_G1_4.3.2'],
                  },
                ],
                depend: {
                  id: 'S5_G1_4',
                  value: ['4-2'],
                },
                items: {
                  enum: [
                    '4.3.1-0',
                    '4.3.1-1',
                    '4.3.1-2',
                    '4.3.1-3',
                    '4.3.1-4',
                    '4.3.1-5',
                    '4.3.1-6',
                    '4.3.1-7',
                    '4.3.1-8',
                    '4.3.1-9',
                    '4.3.1-10',
                    '4.3.1-11',
                    '4.3.1-12',
                    '4.3.1-13',
                    '4.3.1-14',
                    '4.3.1-15',
                    '4.3.1-16',
                    '4.3.1-17',
                    '4.3.1-18',
                    '4.3.1-19',
                    '4.3.1-20',
                    '4.3.1-21',
                  ],
                  enumNames: [
                    t`New product design`,
                    t`Change in service provision`,
                    t`Environmental social planning`,
                    t`Change in practice`,
                    t`Change in operations`,
                    t`Industrial or production standard`,
                    t`Different environmental management of land-based environments`,
                    t`Different environmental management of aquatic environments`,
                    t`Research and Development`,
                    t`New infrastructure`,
                    t`The use of compostable plastic`,
                    t`The use of bio-based plastic`,
                    t`The use of biodegradable plastic`,
                    t`Reducing the environmental impact`,
                    t`Developing a new material`,
                    t`Developing a new process`,
                    t`Manufacturing and production`,
                    t`Standards`,
                    t`Waste management`,
                    t`Compostable plastic`,
                    t`Bio-based plastic or bio-degradable plastic`,
                    t`Other`,
                  ],
                },
                uniqueItems: true,
              },
              'S5_G1_4.3.2': {
                title: t`If you selected "Other", please specify:`,
                type: 'string',
                depend: {
                  id: 'S5_G1_4.3.1',
                  value: ['4.3.1-21'],
                },
              },
              'S5_G1_4.4.1': {
                title: t`Monitoring and Analysis. You have chosen monitoring and analysis as the type of initiatives. What did the initiative specifically involve? (Please tick ALL that apply):`,
                type: 'array',
                dependency: [
                  {
                    value: ['4.4.1-9'],
                    questions: ['S5_G1_4.4.2'],
                  },
                ],
                depend: {
                  id: 'S5_G1_4',
                  value: ['4-3'],
                },
                items: {
                  enum: [
                    '4.4.1-0',
                    '4.4.1-1',
                    '4.4.1-2',
                    '4.4.1-3',
                    '4.4.1-4',
                    '4.4.1-5',
                    '4.4.1-6',
                    '4.4.1-7',
                    '4.4.1-8',
                    '4.4.1-9',
                  ],
                  enumNames: [
                    t`Monitoring: On or near ocean surface`,
                    t`Monitoring: Water column`,
                    t`Monitoring: On the seafloor`,
                    t`Monitoring: On the shoreline`,
                    t`Monitoring: Entanglement/ ingested/ in biota`,
                    t`Monitoring: Air`,
                    t`Review and synthesis: Environmental`,
                    t`Review and synthesis: Economic`,
                    t`Review and synthesis: Materials/Other`,
                    t`Other`,
                  ],
                },
                uniqueItems: true,
              },
              'S5_G1_4.4.2': {
                title: t`If you selected "Other", please specify:`,
                type: 'string',
                depend: {
                  id: 'S5_G1_4.4.1',
                  value: ['4.4.1-9'],
                },
              },
              'S5_G1_4.4.3': {
                title: t`For monitoring, which programme/protocol did you use?`,
                type: 'string',
                depend: {
                  id: 'S5_G1_4',
                  value: ['4-3'],
                },
              },
              'S5_G1_4.4.4': {
                title: t`How can the data and information from your monitoring programme be accessed?`,
                type: 'string',
                depend: {
                  id: 'S5_G1_4',
                  value: ['4-3'],
                },
              },
              'S5_G1_4.4.5': {
                title: t`Please provide the URL's for any links to the monitoring data and information.`,
                type: 'array',
                items: {
                  type: 'string',
                  string: true,
                  format: 'url',
                },
                add: 'Add Link',
                depend: {
                  id: 'S5_G1_4',
                  value: ['4-3'],
                },
              },
              S5_G2_5: {
                subTitle: t`Reporting and Measuring Progress`,
                title: t`Do you report and measure the initiative progress?`,
                type: 'string',
                dependency: [
                  {
                    value: ['5-6'],
                    questions: ['S5_G2_6'],
                  },
                ],
                enum: ['5-0', '5-1', '5-2', '5-3', '5-4', '5-5', '5-6'],
                enumNames: [
                  t`Yes, reporting is voluntary`,
                  t`Yes, it is a requirement`,
                  t`No, there is no reporting mechanism`,
                  t`No, reporting is voluntary`,
                  t`No, there is not enough resources to support reporting`,
                  t`No, reporting is too time-consuming`,
                  t`Other`,
                ],
              },
              S5_G2_6: {
                title: t`If you selected "Other", please specify.`,
                type: 'string',
                depend: {
                  id: 'S5_G2_5',
                  value: ['5-6'],
                },
              },
              S5_G2_7: {
                title: t`If yes, who do you report to? (Please tick ALL that apply):`,
                type: 'array',
                dependency: [
                  {
                    value: ['7-0'],
                    questions: ['S5_G2_7.1.0'],
                  },
                  {
                    value: ['7-1'],
                    questions: ['S5_G2_7.1.1'],
                  },
                  {
                    value: ['7-2'],
                    questions: ['S5_G2_7.1.2'],
                  },
                  {
                    value: ['7-3'],
                    questions: ['S5_G2_7.2'],
                  },
                  {
                    value: ['7-4'],
                    questions: ['S5_G2_7.3'],
                  },
                ],
                depend: {
                  id: 'S5_G2_5',
                  value: ['5-0', '5-1'],
                },
                items: {
                  enum: ['7-0', '7-1', '7-2', '7-3', '7-4'],
                  enumNames: [
                    t`Global Sustainable Development Goals (SDGs)`,
                    t`Regional Sustainable Development Goals (SDGs)`,
                    t`National Sustainable Development Goals (SDGs)`,
                    t`Multilateral Environmental Agreements (MEAs)`,
                    t`Other`,
                  ],
                },
                uniqueItems: true,
              },
              'S5_G2_7.1.0': {
                title: t`Which Sustainable Development Goals (SDGs) does your initiative apply to? (Please tick ALL that apply):`,
                type: 'array',
                depend: {
                  id: 'S5_G2_7',
                  value: ['7-0'],
                },
                items: {
                  enum: sdgsOptions.map((x) => x.goal),
                  enumNames: sdgsOptions.map((x) => x.name),
                },
                uniqueItems: true,
              },
              'S5_G2_7.1.1': {
                title: t`Which Sustainable Development Goals (SDGs) does your initiative apply to? (Please tick ALL that apply):`,
                type: 'array',
                depend: {
                  id: 'S5_G2_7',
                  value: ['7-0'],
                },
                items: {
                  enum: sdgsOptions.map((x) => x.goal),
                  enumNames: sdgsOptions.map((x) => x.name),
                },
                uniqueItems: true,
              },
              'S5_G2_7.1.2': {
                title: t`Which Sustainable Development Goals (SDGs) does your initiative apply to? (Please tick ALL that apply):`,
                type: 'array',
                depend: {
                  id: 'S5_G2_7',
                  value: ['7-0'],
                },
                items: {
                  enum: sdgsOptions.map((x) => x.goal),
                  enumNames: sdgsOptions.map((x) => x.name),
                },
                uniqueItems: true,
              },
              'S5_G2_7.2': {
                title: t`Which Multilateral Environmental Agreements (MEAs) does your initiative apply to? (Please tick ALL that apply):`,
                type: 'array',
                depend: {
                  id: 'S5_G2_7',
                  value: ['7-3'],
                },
                items: {
                  enum: [],
                  enumNames: [],
                },
                uniqueItems: true,
              },
              'S5_G2_7.3': {
                title: t`If you selected "Other", please specify.`,
                type: 'string',
                depend: {
                  id: 'S5_G2_7',
                  value: ['7-4'],
                },
              },
              S5_G2_8: {
                title: t`Are the actual outcomes and impacts of the initiative evaluated?`,
                type: 'string',
                dependency: [
                  {
                    value: ['8-2'],
                    questions: ['S5_G2_9'],
                  },
                ],
                enum: ['8-0', '8-1', '8-2'],
                enumNames: ['Yes', 'No', 'Other'],
              },
              S5_G2_9: {
                title: t`If you selected "Other", please specify.`,
                type: 'string',
                depend: {
                  id: 'S5_G2_8',
                  value: ['8-2'],
                },
              },
              S5_G2_10: {
                title: t`When do you expect the impact of the initiative to be evident?`,
                type: 'string',
                enum: ['10-0', '10-1', '10-2', '10-3'],
                enumNames: [
                  t`Immediately (less than 1 year)`,
                  t`In 1 to 3 years`,
                  t`In 4 to 10 years`,
                  t`In more than 10 years`,
                ],
              },
              S5_G2_11: {
                title: t`If applicable, please specify when and how the outcomes will be evaluated (tick ALL that apply).`,
                type: 'array',
                items: {
                  enum: [
                    '11-0',
                    '11-1',
                    '11-2',
                    '11-3',
                    '11-4',
                    '11-5',
                    '11-6',
                  ],
                  enumNames: [
                    t`Outcomes will be assessed once, when the initiative is completed`,
                    t`Outcomes are being assessed at regular intervals`,
                    t`Outcomes will be compared to a baseline measurement`,
                    t`Outcomes will be compared to other sites or initiatives`,
                    t`Environmental impacts will be evaluated`,
                    t`Social impacts will be evaluated`,
                    t`Economic impacts will be evaluated`,
                  ],
                },
                uniqueItems: true,
              },
              S5_G2_12: {
                title: t`Do you have specific key performance indicators (KPIs) for your initiative? If yes, please list up to 5.`,
                type: 'string',
              },
              S5_G2_13: {
                title: t`Please, describe if any co-benefits and/or side-effects of the initiative are captured in the evaluation.`,
                type: 'string',
              },
              S5_G3_14: {
                subTitle: t`Drivers and Barriers`,
                title: t`Please, indicate which DRIVERS apply to this initiative? (Please tick ALL that apply).`,
                type: 'array',
                items: {
                  enum: [
                    '14-0',
                    '14-1',
                    '14-2',
                    '14-3',
                    '14-4',
                    '14-5',
                    '14-6',
                    '14-7',
                    '14-8',
                    '14-9',
                    '14-10',
                    '14-11',
                    '14-12',
                    '14-13',
                    '14-14',
                    '14-15',
                    '14-16',
                    '14-17',
                    '14-18',
                    '14-19',
                  ],
                  enumNames: [
                    t`Cost considerations (e.g., reducing costs of existing processes or of disposal)`,
                    t`Protecting economy / livelihoods or shareholder value`,
                    t`Economic drivers (e.g., fines, subsidies, taxes)`,
                    t`A change in public opinion`,
                    t`Members of the public have actively complained / asked for change`,
                    t`Media coverage, wide exposure of marine litter and plastic pollution`,
                    t`Campaigning with or through NGOs`,
                    t`Reputation / image of the member state or organisation`,
                    t`Leadership by specific individuals in the member state or organisation (who personallydrove change)`,
                    t`Existing policy or recent policy change`,
                    t`Anticipating a future policy change`,
                    t`National or organisational values`,
                    t`Peer pressure from similar actors`,
                    t`Transnational or global agreements and momentum towards change (e.g.,UN resolutions)`,
                    t`Concern about environmental impact (e.g.,harm to animals and plants)`,
                    t`Concern about potential human health impacts`,
                    t`Protecting future generations`,
                    t`Spiritual or religious values`,
                    t`Moral considerations`,
                    t`Sustainable Development Goals`,
                  ],
                },
                uniqueItems: true,
              },
              S5_G3_15: {
                title: t`Please,indicate which BARRIERS apply to this initiative? (Please tick ALL that apply).`,
                type: 'array',
                items: {
                  enum: [
                    '15-0',
                    '15-1',
                    '15-2',
                    '15-3',
                    '15-4',
                    '15-5',
                    '15-6',
                    '15-7',
                    '15-8',
                    '15-9',
                    '15-10',
                    '15-11',
                    '15-12',
                    '15-13',
                    '15-14',
                    '15-15',
                    '15-16',
                    '15-17',
                    '15-18',
                  ],
                  enumNames: [
                    t`So-called 'perverse incentives' (e.g.,subsidies and taxes) that encourage wasteful use of plastic`,
                    t`Not enough regulation/control mechanisms`,
                    t`Existing regulation is not enforced`,
                    t`Conflicting regulation`,
                    t`Initiative depends on other actors who are not cooperating`,
                    t`Lobbying by business/industry`,
                    t`Not enough reliable information`,
                    t`Not enough support from within the member state/organisation`,
                    t`Not enough support from outside the member state/organisation`,
                    t`Technological/technical resources`,
                    t`Problems with alternative materials and supplies`,
                    t`Gaps in expertise in member state/organisation`,
                    t`Gaps in leadership/political will`,
                    t`Not enough infrastructure`,
                    t`Conflicting goals/other priorities more urgent`,
                    t`Fragmentation`,
                    t`Gaps in public awareness/public not interested`,
                    t`Habits in society too slow to change`,
                    t`People like plastics (convenience, hygiene etc.)`,
                  ],
                },
                uniqueItems: true,
              },
              S5_G3_26: {
                subTitle: t`Initiative Scope & Target`,
                title: t`Lifecycle. Which specific part of the lifecycle/plastic supply chain is your initiative targeting? (Please tick ALL that apply).`,
                type: 'array',
                dependency: [
                  {
                    value: ['26-7'],
                    questions: ['S5_G3_27'],
                  },
                ],
                items: {
                  enum: [
                    '26-0',
                    '26-1',
                    '26-2',
                    '26-3',
                    '26-4',
                    '26-5',
                    '26-6',
                    '26-7',
                  ],
                  enumNames: [
                    t`Raw materials`,
                    t`Design`,
                    t`Production / manufacture`,
                    t`Use / consumption`,
                    t`Collection / sorting of plastics after use`,
                    t`Management of collected plastics`,
                    t`Clean-up of marine litter and plasticpollutionfrom the environment`,
                    t`Other`,
                  ],
                },
                uniqueItems: true,
              },
              S5_G3_27: {
                title: t`If you selected "Other", please specify.`,
                type: 'string',
                depend: {
                  id: 'S5_G3_26',
                  value: ['26-7'],
                },
              },
              S5_G3_28: {
                title: t`Impact. What impacts or harms does the initiative relate to? (Please tick ALL that apply).`,
                type: 'array',
                dependency: [
                  {
                    value: ['28-8'],
                    questions: ['S5_G3_29'],
                  },
                ],
                items: {
                  enum: [
                    '28-0',
                    '28-1',
                    '28-2',
                    '28-3',
                    '28-4',
                    '28-5',
                    '28-6',
                    '28-7',
                    '28-8',
                  ],
                  enumNames: [
                    t`Human health and wellbeing`,
                    t`Biodiversity`,
                    t`Marine organisms`,
                    t`Ecosystem Services`,
                    t`Food chain`,
                    t`Economics and Trade`,
                    t`All of the above`,
                    t`Not applicable`,
                    t`Other`,
                  ],
                },
                uniqueItems: true,
              },
              S5_G3_29: {
                title: t`If you selected "Other", please specify.`,
                type: 'string',
                depend: {
                  id: 'S5_G3_28',
                  value: ['28-8'],
                },
              },
              S5_G3_30: {
                title: t`Sector. Does your initiative target a specific sector? (Please tick ALL that apply).`,
                type: 'array',
                dependency: [
                  {
                    value: ['30-17'],
                    questions: ['S5_G3_31'],
                  },
                ],
                items: {
                  enum: [
                    '30-0',
                    '30-1',
                    '30-2',
                    '30-3',
                    '30-4',
                    '30-5',
                    '30-6',
                    '30-7',
                    '30-8',
                    '30-9',
                    '30-10',
                    '30-11',
                    '30-12',
                    '30-13',
                    '30-14',
                    '30-15',
                    '30-16',
                    '30-17',
                  ],
                  enumNames: [
                    t`Packaging`,
                    t`Textiles`,
                    t`Transportation`,
                    t`Building, construction, demolition,industrial machinery`,
                    t`Automotive`,
                    t`Electrical and electronics`,
                    t`Agriculture`,
                    t`Fisheries`,
                    t`Aquaculture`,
                    t`Food & Beverages`,
                    t`Personal Healthcare`,
                    t`Medical`,
                    t`Retail`,
                    t`Tourism`,
                    t`Wastewater/Sewage management`,
                    t`All of the above`,
                    t`Not applicable`,
                    t`Other`,
                  ],
                },
                uniqueItems: true,
              },
              S5_G3_31: {
                title: t`If you selected "Other", please specify.`,
                type: 'string',
                depend: {
                  id: 'S5_G3_30',
                  value: ['30-17'],
                },
              },
              S5_G4_33: {
                subTitle: t`Total Stakeholders Engaged`,
                title: t`How many different groups and organisations have you engaged with in total?`,
                type: 'string',
              },
              S5_G4_34: {
                title: t`How many stakeholders have you engaged in total?`,
                type: 'number',
              },
              S5_G5_35: {
                subTitle: t`Funding`,
                title: t`What funding sources did you use?`,
                type: 'string',
                dependency: [
                  {
                    value: ['35-7'],
                    questions: ['S5_G5_35.1'],
                  },
                ],
                enum: ['35-0', '35-1', '35-2', '35-3', '35-4', '35-6', '35-7'],
                enumNames: [
                  t`Crowdfunded`,
                  t`Voluntary donations`,
                  t`Public Financing`,
                  t`Private Sector`,
                  t`Mixed`,
                  t`Not applicable`,
                  t`Other`,
                ],
              },
              'S5_G5_35.1': {
                title: t`If you selected "Other", please specify.`,
                type: 'string',
                depend: {
                  id: 'S5_G5_35',
                  value: ['35-7'],
                },
              },
              S5_G5_36: {
                title: t`How much money (amount) has been invested in the initiative so far?`,
                type: 'number',
              },
              'S5_G5_36.1': {
                title: t`Currency`,
                type: 'string',
                enum: [],
                enumNames: [],
              },
              S5_G5_37: {
                title: t`Are there in-kind contributions as well?`,
                type: 'number',
              },
              'S5_G5_37.1': {
                title: t`Currency`,
                type: 'string',
                enum: [],
                enumNames: [],
              },
              S5_G6_38: {
                subTitle: t`Duration`,
                title: t`Is your initiative a one-off activity or ongoing?`,
                type: 'string',
                dependency: [
                  {
                    value: ['38-5'],
                    questions: ['S5_G6_39'],
                  },
                ],
                enum: ['38-0', '38-1', '38-2', '38-3', '38-4', '38-5'],
                enumNames: [
                  t`Single event`,
                  t`Ongoing activity less than one year`,
                  t`Ongoing activity 1-3 years`,
                  t`Ongoing activity more than 3 years long`,
                  t`Not applicable`,
                  t`Other`,
                ],
              },
              S5_G6_39: {
                title: t`If you selected "Other", please specify.`,
                type: 'string',
                depend: {
                  id: 'S5_G6_38',
                  value: ['38-5'],
                },
              },
              S5_G7_41: {
                subTitle: t`Contact Info`,
                title: t`Where can users best contact you to learn more?`,
                type: 'string',
                enum: ['41-0', '41-1', '41-2', '41-3', '41-4', '41-5'],
                enumNames: [
                  t`Email`,
                  t`LinkedIn`,
                  t`Twitter`,
                  t`Facebook`,
                  t`Instagram`,
                  t`Other`,
                ],
              },
              'S5_G7_41.1': {
                title: t`Please provide the details`,
                type: 'string',
                string: true,
                depend: {
                  id: 'S5_G7_41',
                  value: ['41-0', '41-1', '41-2', '41-3', '41-4', '41-5'],
                },
              },
            },
          },
        },
      },
    },
  },
  action: {
    type: 'object',
    version: '2',
    label: 'action',
    properties: {
      S4: {
        title: '',
        type: 'object',
        depend: {
          id: 'tabs',
          value: ['S4'],
        },
        properties: {
          S4_G1: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 0,
            },
            required: ['title', 'summary', 'url'],
            properties: {
              title: {
                title: t`Title`,
                type: 'string',
              },
              summary: {
                title: t`Description`,
                type: 'string',
              },
              url: {
                title: t`URL`,
                type: 'string',
                format: 'url',
              },
            },
          },
          S4_G2: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 1,
            },
            required: [
              'geoCoverageType',
              'geoCoverageValueTransnational',
              'geoCoverageCountries',
              'geoCoverageValueSubnational',
            ],
            properties: {
              geoCoverageType: {
                title: t`Select Geo-Coverage Type`,
                type: 'string',
                enum: ['global', 'transnational', 'national', 'sub-national'],
                enumNames: [
                  t`Global`,
                  t`Transnational`,
                  t`National`,
                  t`Subnational`,
                ],
              },
              geoCoverageValueTransnational: {
                title: t`GEO COVERAGE (Transnational)`,
                enum: [],
                countries: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['transnational'],
                },
              },
              geoCoverageCountries: {
                title: t`GEO COVERAGE (Countries)`,
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['national'],
                },
              },
              geoCoverageValueSubnational: {
                title: t`Select a country`,
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['sub-national'],
                },
              },
              geoCoverageCountryStates: {
                title: t`Select a State`,
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['sub-national'],
                },
              },
            },
          },
          S4_G3: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 2,
            },
            required: ['tags'],
            properties: {
              tags: {
                title: t`Tags`,
                enum: [],
              },
            },
          },
          S4_G4: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 3,
            },
            required: [],
            properties: {
              image: {
                title: t`Image`,
                type: 'string',
                format: 'data-url',
              },
              thumbnail: {
                title: t`Thumbnail`,
                type: 'string',
                format: 'data-url',
              },
            },
          },
          S4_G5: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 4,
            },
            required: [],
            properties: {
              entity: {
                title: t`Entity connection`,
                description: 'entity',
                custom: 'entity',
                type: 'array',
                items: {
                  title: '',
                  type: 'object',
                  required: ['role', 'entity'],
                  properties: {
                    role: {
                      title: t`Entity role`,
                      enum: entityRoleOptions.map((x) => x.toLowerCase()),
                      enumNames: entityRoleOptions,
                    },
                    entity: {
                      title: t`Entity`,
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual: {
                title: t`Individual connection`,
                description: 'individual',
                custom: 'stakeholder',
                type: 'array',
                items: {
                  title: '',
                  type: 'object',
                  required: ['role', 'stakeholder'],
                  properties: {
                    role: {
                      title: t`User role`,
                      enum: individualRoleOptions.map((x) =>
                        x !== 'Resource Editor'
                          ? x.toLowerCase()
                          : x.toLowerCase().replace(/ /g, '_')
                      ),
                      enumNames: individualRoleOptions,
                    },
                    stakeholder: {
                      title: t`Indvidual`,
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
            },
          },
          S4_G6: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 5,
            },
            properties: {
              info: {
                title: t`Info And Docs`,
                type: 'string',
              },
              related: {
                title: t`Related Resource`,
                enum: [],
                enumNames: [],
              },
            },
          },
        },
      },
      S5: {
        title: '',
        type: 'object',
        depend: {
          id: 'tabs',
          value: ['S5'],
        },
        required: [],
        properties: {
          dateOne: {
            type: 'object',
            title: '',
            required: [],
            properties: {
              publishYear: {
                title: t`Publication Year`,
                type: 'string',
              },
            },
          },
          date: {
            type: 'object',
            title: '',
            required: [],
            properties: {
              validFrom: {
                title: t`Valid From`,
                type: 'string',
                format: 'date',
              },
              validTo: {
                title: t`Valid To`,
                type: 'string',
                format: 'date',
              },
            },
          },
        },
      },
    },
  },
  policy: {
    type: 'object',
    version: '2',
    label: 'policy',
    properties: {
      S4: {
        title: '',
        type: 'object',
        depend: {
          id: 'tabs',
          value: ['S4'],
        },
        properties: {
          S4_G1: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 0,
            },
            required: ['title', 'summary', 'url'],
            properties: {
              title: {
                title: t`Title`,
                type: 'string',
              },
              summary: {
                title: t`Description`,
                type: 'string',
              },
              url: {
                title: t`URL`,
                type: 'string',
                format: 'url',
              },
            },
          },
          S4_G2: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 1,
            },
            required: [
              'geoCoverageType',
              'geoCoverageValueTransnational',
              'geoCoverageCountries',
              'geoCoverageValueSubnational',
            ],
            properties: {
              geoCoverageType: {
                title: t`Select Geo-Coverage Type`,
                type: 'string',
                enum: ['global', 'transnational', 'national', 'sub-national'],
                enumNames: [
                  t`Global`,
                  t`Transnational`,
                  t`National`,
                  t`Subnational`,
                ],
              },
              geoCoverageValueTransnational: {
                title: t`GEO COVERAGE (Transnational)`,
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['transnational'],
                },
              },
              geoCoverageCountries: {
                title: t`GEO COVERAGE (Countries)`,
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['national'],
                },
              },
              geoCoverageValueSubnational: {
                title: t`Select a country`,
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['sub-national'],
                },
              },
              geoCoverageCountryStates: {
                title: t`State`,
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['sub-national'],
                },
              },
            },
          },
          S4_G3: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 2,
            },
            required: ['tags'],
            properties: {
              tags: {
                title: t`Tags`,
                enum: [],
              },
            },
          },
          S4_G4: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 3,
            },
            required: [],
            properties: {
              image: {
                title: t`Image`,
                type: 'string',
                format: 'data-url',
              },
              thumbnail: {
                title: t`Thumbnail`,
                type: 'string',
                format: 'data-url',
              },
            },
          },
          S4_G5: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 4,
            },
            required: [],
            properties: {
              entity: {
                title: t`Entity connection`,
                description: 'entity',
                custom: 'entity',
                type: 'array',
                items: {
                  title: '',
                  type: 'object',
                  required: ['role', 'entity'],
                  properties: {
                    role: {
                      title: t`Entity role`,
                      enum: entityRoleOptions.map((x) => x.toLowerCase()),
                      enumNames: entityRoleOptions,
                    },
                    entity: {
                      title: t`Entity`,
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual: {
                title: t`Individual connection`,
                description: 'individual',
                custom: 'stakeholder',
                type: 'array',
                items: {
                  title: '',
                  type: 'object',
                  required: ['role', 'stakeholder'],
                  properties: {
                    role: {
                      title: t`User role`,
                      enum: individualRoleOptions.map((x) =>
                        x !== 'Resource Editor'
                          ? x.toLowerCase()
                          : x.toLowerCase().replace(/ /g, '_')
                      ),
                      enumNames: individualRoleOptions,
                    },
                    stakeholder: {
                      title: t`Indvidual`,
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
            },
          },
          S4_G6: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 5,
            },
            properties: {
              info: {
                title: t`Info And Docs`,
                type: 'string',
              },
              related: {
                title: t`Related Resource`,
                enum: [],
                enumNames: [],
              },
            },
          },
        },
      },
      S5: {
        title: '',
        type: 'object',
        depend: {
          id: 'tabs',
          value: ['S5'],
        },
        properties: {
          titleGroup: {
            type: 'object',
            title: '',
            required: [],
            properties: {
              originalTitle: {
                title: t`Original Title`,
                type: 'string',
              },
              lang: {
                title: t`Language`,
                default: 'en',
                enum: Object.keys(languages).map((langCode) => langCode),
                enumNames: Object.keys(languages).map(
                  (langCode) => languages[langCode].name
                ),
              },
            },
          },
          dataSource: {
            title: t`Data Source`,
            type: 'string',
          },
          typeOfLaw: {
            title: t`Type Of Law`,
            enum: [
              t`Miscellaneous`,
              t`Legislation`,
              t`Regulation`,
              t`Constitution`,
            ],
          },
          recordNumber: {
            title: t`Record Number`,
            type: 'string',
          },
          date: {
            type: 'object',
            title: '',
            required: [],
            properties: {
              firstPublicationDate: {
                title: t`First Publication Date`,
                type: 'string',
                format: 'date',
              },
              latestAmendmentDate: {
                title: t`Last Amendment Date`,
                type: 'string',
                format: 'date',
              },
            },
          },
          status: {
            title: t`Status`,
            enum: [t`Repealed`, t`In force`, t`Not yet in force`],
          },
          implementingMea: {
            title: t`Implementing MEA`,
            enum: [],
          },
          topics: {
            title: t`Topics`,
            enum: [
              t`Trade and Investment`,
              t`Chemicals and waste`,
              t`Biological diversity`,
              t`Marine and Freshwater`,
              t`Climate and Atmosphere`,
              t`Land and Agriculture`,
              t`Environmental Governance`,
            ],
          },
        },
      },
    },
  },
  financing: {
    type: 'object',
    version: '2',
    label: 'financing',
    properties: {
      S4: {
        title: '',
        type: 'object',
        depend: {
          id: 'tabs',
          value: ['S4'],
        },
        properties: {
          S4_G1: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 0,
            },
            required: ['title', 'summary', 'url'],
            properties: {
              title: {
                title: t`Title`,
                type: 'string',
              },
              summary: {
                title: t`Description`,
                type: 'string',
              },
              url: {
                title: t`URL`,
                type: 'string',
                format: 'url',
              },
            },
          },
          S4_G2: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 1,
            },
            required: [
              'geoCoverageType',
              'geoCoverageValueTransnational',
              'geoCoverageCountries',
              // "geoCoverageValueNational",
              // "geoCoverageValueSubnational",
              // "geoCoverageValueSubnationalCity",
            ],
            properties: {
              geoCoverageType: {
                title: t`Select Geo-Coverage Type`,
                type: 'string',
                enum: ['global', 'transnational', 'national', 'sub-national'],
                enumNames: [
                  t`Global`,
                  t`Transnational`,
                  t`National`,
                  t`Subnational`,
                ],
              },
              geoCoverageValueTransnational: {
                title: t`GEO COVERAGE (Transnational)`,
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['transnational'],
                },
              },
              geoCoverageCountries: {
                title: t`GEO COVERAGE (Countries)`,
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['national'],
                },
              },
              geoCoverageValueSubnational: {
                title: t`Select a country`,
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['sub-national'],
                },
              },
              geoCoverageCountryStates: {
                title: t`State`,
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['sub-national'],
                },
              },
            },
          },
          S4_G3: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 2,
            },
            required: ['tags'],
            properties: {
              tags: {
                title: t`Tags`,
                enum: [],
              },
            },
          },
          S4_G4: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 3,
            },
            required: [],
            properties: {
              image: {
                title: t`Banner`,
                type: 'string',
                format: 'data-url',
              },
              thumbnail: {
                title: t`Thumbnail`,
                type: 'string',
                format: 'data-url',
              },
            },
          },
          S4_G5: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 4,
            },
            required: [],
            properties: {
              entity: {
                title: t`Entity connection`,
                description: 'entity',
                custom: 'entity',
                type: 'array',
                items: {
                  title: '',
                  type: 'object',
                  required: ['role', 'entity'],
                  properties: {
                    role: {
                      title: t`Entity role`,
                      enum: entityRoleOptions.map((x) => x.toLowerCase()),
                      enumNames: entityRoleOptions,
                    },
                    entity: {
                      title: t`Entity`,
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual: {
                title: t`Individual connection`,
                description: 'individual',
                custom: 'stakeholder',
                type: 'array',
                items: {
                  title: '',
                  type: 'object',
                  required: ['role', 'stakeholder'],
                  properties: {
                    role: {
                      title: t`User role`,
                      enum: individualRoleOptions.map((x) =>
                        x !== 'Resource Editor'
                          ? x.toLowerCase()
                          : x.toLowerCase().replace(/ /g, '_')
                      ),
                      enumNames: individualRoleOptions,
                    },
                    stakeholder: {
                      title: t`Indvidual`,
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
            },
          },
          S4_G6: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 5,
            },
            properties: {
              info: {
                title: t`Info And Docs`,
                type: 'string',
              },
              related: {
                title: t`Related Resource`,
                enum: [],
                enumNames: [],
              },
            },
          },
        },
      },
      S5: {
        title: '',
        type: 'object',
        depend: {
          id: 'tabs',
          value: ['S5'],
        },
        required: [],
        properties: {
          value: {
            type: 'object',
            title: '',
            required: [],
            properties: {
              valueAmount: {
                title: t`Value Amount`,
                type: 'number',
              },
              valueCurrency: {
                title: t`Value Currency`,
                enum: [],
              },
              valueRemark: {
                title: t`Value Remark`,
                type: 'string',
              },
            },
          },
          date: {
            type: 'object',
            title: '',
            required: [],
            properties: {
              validFrom: {
                title: t`Valid From`,
                type: 'string',
                format: 'date',
              },
              validTo: {
                title: t`Valid To`,
                type: 'string',
                format: 'date',
              },
            },
          },
        },
      },
    },
  },
  technical: {
    type: 'object',
    version: '2',
    label: 'technical',
    properties: {
      S4: {
        title: '',
        type: 'object',
        depend: {
          id: 'tabs',
          value: ['S4'],
        },
        properties: {
          S4_G1: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 0,
            },
            required: ['title', 'summary', 'url'],
            properties: {
              title: {
                title: t`Title`,
                type: 'string',
              },
              summary: {
                title: t`Description`,
                type: 'string',
              },
              url: {
                title: t`URL`,
                type: 'string',
                format: 'url',
              },
            },
          },
          S4_G2: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 1,
            },
            required: [
              'geoCoverageType',
              'geoCoverageValueTransnational',
              'geoCoverageCountries',
              // "geoCoverageValueNational",
              'geoCoverageValueSubnational',
              // "geoCoverageValueSubnationalCity",
            ],
            properties: {
              geoCoverageType: {
                title: t`Select Geo-Coverage Type`,
                type: 'string',
                enum: ['global', 'transnational', 'national', 'sub-national'],
                enumNames: [
                  t`Global`,
                  t`Transnational`,
                  t`National`,
                  t`Subnational`,
                ],
              },
              geoCoverageValueTransnational: {
                title: t`GEO COVERAGE (Transnational)`,
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['transnational'],
                },
              },
              geoCoverageCountries: {
                title: t`GEO COVERAGE (Countries)`,
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['national'],
                },
              },
              geoCoverageValueSubnational: {
                title: t`Select a country`,
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['sub-national'],
                },
              },
              geoCoverageCountryStates: {
                title: t`State`,
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['sub-national'],
                },
              },
            },
          },
          S4_G3: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 2,
            },
            required: ['tags'],
            properties: {
              tags: {
                title: t`Tags`,
                enum: [],
              },
            },
          },
          S4_G4: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 3,
            },
            required: [],
            properties: {
              image: {
                title: t`Image`,
                type: 'string',
                format: 'data-url',
              },
              thumbnail: {
                title: t`Thumbnail`,
                type: 'string',
                format: 'data-url',
              },
            },
          },
          S4_G5: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 4,
            },
            required: [],
            properties: {
              entity: {
                title: t`Entity connection`,
                description: 'entity',
                custom: 'entity',
                type: 'array',
                items: {
                  title: '',
                  type: 'object',
                  required: ['role', 'entity'],
                  properties: {
                    role: {
                      title: t`Entity role`,
                      enum: entityRoleOptions.map((x) => x.toLowerCase()),
                      enumNames: entityRoleOptions,
                    },
                    entity: {
                      title: t`Entity`,
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual: {
                title: t`Individual connection`,
                description: 'individual',
                custom: 'stakeholder',
                type: 'array',
                items: {
                  title: '',
                  type: 'object',
                  required: ['role', 'stakeholder'],
                  properties: {
                    role: {
                      title: t`User role`,
                      enum: individualRoleOptions.map((x) =>
                        x !== 'Resource Editor'
                          ? x.toLowerCase()
                          : x.toLowerCase().replace(/ /g, '_')
                      ),
                      enumNames: individualRoleOptions,
                    },
                    stakeholder: {
                      title: t`Indvidual`,
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
            },
          },
          S4_G6: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 5,
            },
            properties: {
              info: {
                title: t`Info And Docs`,
                type: 'string',
              },
              related: {
                title: t`Related Resource`,
                enum: [],
                enumNames: [],
              },
            },
          },
        },
      },
      S5: {
        title: '',
        type: 'object',
        depend: {
          id: 'tabs',
          value: ['S5'],
        },
        properties: {
          dateOne: {
            type: 'object',
            title: '',
            required: [],
            properties: {
              publishYear: {
                title: t`Publication Year`,
                type: 'string',
              },
            },
          },
        },
      },
    },
  },
  case_study: {
    type: 'object',
    version: '2',
    label: 'case_study',
    properties: {
      S4: {
        title: '',
        type: 'object',
        depend: {
          id: 'tabs',
          value: ['S4'],
        },
        properties: {
          S4_G1: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 0,
            },
            required: ['title', 'description', 'url'],
            properties: {
              title: {
                title: t`Title`,
                type: 'string',
              },
              description: {
                title: t`Description`,
                type: 'string',
              },
              url: {
                title: t`URL`,
                type: 'string',
                format: 'url',
              },
            },
          },
          S4_G2: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 1,
            },
            required: [
              'geoCoverageType',
              'geoCoverageValueTransnational',
              'geoCoverageCountries',
              // "geoCoverageValueNational",
              'geoCoverageValueSubnational',
              // "geoCoverageValueSubnationalCity",
            ],
            properties: {
              geoCoverageType: {
                title: t`Select Geo-Coverage Type`,
                type: 'string',
                enum: ['global', 'transnational', 'national', 'sub-national'],
                enumNames: [
                  t`Global`,
                  t`Transnational`,
                  t`National`,
                  t`Subnational`,
                ],
              },
              geoCoverageValueTransnational: {
                title: t`GEO COVERAGE (Transnational)`,
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['transnational'],
                },
              },
              geoCoverageCountries: {
                title: t`GEO COVERAGE (Countries)`,
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['national'],
                },
              },
              geoCoverageValueSubnational: {
                title: t`Select a country`,
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['sub-national'],
                },
              },
              geoCoverageCountryStates: {
                title: t`State`,
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['sub-national'],
                },
              },
            },
          },
          S4_G3: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 2,
            },
            required: ['tags'],
            properties: {
              tags: {
                title: t`Tags`,
                enum: [],
              },
            },
          },
          S4_G4: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 3,
            },
            required: [],
            properties: {
              image: {
                title: t`Image`,
                type: 'string',
                format: 'data-url',
              },
              thumbnail: {
                title: t`Thumbnail`,
                type: 'string',
                format: 'data-url',
              },
            },
          },
          S4_G5: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 4,
            },
            required: [],
            properties: {
              entity: {
                title: t`Entity connection`,
                description: 'entity',
                custom: 'entity',
                type: 'array',
                items: {
                  title: '',
                  type: 'object',
                  required: ['role', 'entity'],
                  properties: {
                    role: {
                      title: t`Entity role`,
                      enum: entityRoleOptions.map((x) => x.toLowerCase()),
                      enumNames: entityRoleOptions,
                    },
                    entity: {
                      title: t`Entity`,
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual: {
                title: t`Individual connection`,
                description: 'individual',
                custom: 'stakeholder',
                type: 'array',
                items: {
                  title: '',
                  type: 'object',
                  required: ['role', 'stakeholder'],
                  properties: {
                    role: {
                      title: t`User role`,
                      enum: individualRoleOptions.map((x) =>
                        x !== 'Resource Editor'
                          ? x.toLowerCase()
                          : x.toLowerCase().replace(/ /g, '_')
                      ),
                      enumNames: individualRoleOptions,
                    },
                    stakeholder: {
                      title: t`Indvidual`,
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
            },
          },
          S4_G6: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 5,
            },
            properties: {
              info: {
                title: t`Info And Docs`,
                type: 'string',
              },
              related: {
                title: t`Related Resource`,
                enum: [],
                enumNames: [],
              },
            },
          },
        },
      },
      S5: {
        title: '',
        type: 'object',
        depend: {
          id: 'tabs',
          value: ['S5'],
        },
        properties: {
          dateOne: {
            type: 'object',
            title: '',
            required: [],
            properties: {
              publishYear: {
                title: t`Publication Year`,
                type: 'string',
              },
            },
          },
        },
      },
    },
  },
  event_flexible: {
    type: 'object',
    version: '2',
    label: 'event_flexible',
    properties: {
      S4: {
        title: '',
        type: 'object',
        depend: {
          id: 'tabs',
          value: ['S4'],
        },
        properties: {
          S4_G1: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 0,
            },
            required: ['title', 'summary', 'url'],
            properties: {
              title: {
                title: 'Title',
                type: 'string',
              },
              summary: {
                title: 'Description',
                type: 'string',
              },
              url: {
                title: 'URL',
                type: 'string',
                format: 'url',
              },
            },
          },
          S4_G2: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 1,
            },
            required: [
              'geoCoverageType',
              'geoCoverageValueTransnational',
              'geoCoverageCountries',
              'geoCoverageValueSubnational',
            ],
            properties: {
              geoCoverageType: {
                title: 'Select Geo-Coverage Type',
                type: 'string',
                enum: ['global', 'transnational', 'national', 'sub-national'],
                enumNames: [
                  'Global',
                  'Transnational',
                  'National',
                  'Subnational',
                ],
              },
              geoCoverageValueTransnational: {
                title: 'GEO COVERAGE (Transnational)',
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['transnational'],
                },
              },
              geoCoverageCountries: {
                title: 'GEO COVERAGE (Countries)',
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['national'],
                },
              },
              geoCoverageValueSubnational: {
                title: 'Select a country',
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['sub-national'],
                },
              },
              geoCoverageCountryStates: {
                title: 'State',
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['sub-national'],
                },
              },
            },
          },
          S4_G3: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 2,
            },
            required: ['tags'],
            properties: {
              tags: {
                title: 'Tags',
                enum: [],
              },
            },
          },
          S4_G4: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 3,
            },
            required: [],
            properties: {
              image: {
                title: 'Banner',
                type: 'string',
                format: 'data-url',
              },
              thumbnail: {
                title: 'Thumbnail',
                type: 'string',
                format: 'data-url',
              },
            },
          },
          S4_G5: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 4,
            },
            required: [],
            properties: {
              entity: {
                title: 'Entity connection',
                description: 'entity',
                custom: 'entity',
                type: 'array',
                items: {
                  title: '',
                  type: 'object',
                  required: ['role', 'entity'],
                  properties: {
                    role: {
                      title: 'Entity role',
                      enum: entityRoleOptions.map((x) => x.toLowerCase()),
                      enumNames: entityRoleOptions,
                    },
                    entity: {
                      title: 'Entity',
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual: {
                title: 'Individual connection',
                description: 'individual',
                custom: 'stakeholder',
                type: 'array',
                items: {
                  title: '',
                  type: 'object',
                  required: ['role', 'stakeholder'],
                  properties: {
                    role: {
                      title: 'User role',
                      enum: individualRoleOptions.map((x) =>
                        x !== 'Resource Editor'
                          ? x.toLowerCase()
                          : x.toLowerCase().replace(/ /g, '_')
                      ),
                      enumNames: individualRoleOptions,
                    },
                    stakeholder: {
                      title: 'Indvidual',
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
            },
          },
          S4_G6: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 5,
            },
            properties: {
              info: {
                title: 'Info And Docs',
                type: 'string',
              },
              related: {
                title: 'Related Resource',
                enum: [],
                enumNames: [],
              },
            },
          },
        },
      },
      S5: {
        title: '',
        type: 'object',
        depend: {
          id: 'tabs',
          value: ['S5'],
        },
        properties: {
          date: {
            type: 'object',
            title: '',
            required: ['startDate', 'endDate'],
            properties: {
              startDate: {
                title: 'Start Date',
                type: 'string',
                format: 'date',
              },
              endDate: {
                title: 'End Date',
                type: 'string',
                format: 'date',
              },
            },
          },
          recording: {
            title: 'Event Recording',
            type: 'string',
            format: 'url',
          },
          eventType: {
            title: 'Event Type',
            enum: ['Online', 'In Person', 'Hybrid'],
          },
        },
      },
    },
  },
  technology: {
    type: 'object',
    version: '2',
    label: 'technology',
    properties: {
      S4: {
        title: '',
        type: 'object',
        depend: {
          id: 'tabs',
          value: ['S4'],
        },
        properties: {
          S4_G1: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 0,
            },
            required: ['title', 'summary', 'url'],
            properties: {
              title: {
                title: 'Title',
                type: 'string',
              },
              summary: {
                title: 'Description',
                type: 'string',
              },
              url: {
                title: 'URL',
                type: 'string',
                format: 'url',
              },
            },
          },
          S4_G2: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 1,
            },
            required: [
              'geoCoverageType',
              'geoCoverageValueTransnational',
              'geoCoverageCountries',
              'geoCoverageValueSubnational',
            ],
            properties: {
              geoCoverageType: {
                title: 'Select Geo-Coverage Type',
                type: 'string',
                enum: ['global', 'transnational', 'national', 'sub-national'],
                enumNames: [
                  'Global',
                  'Transnational',
                  'National',
                  'Subnational',
                ],
              },
              geoCoverageValueTransnational: {
                title: 'GEO COVERAGE (Transnational)',
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['transnational'],
                },
              },
              geoCoverageCountries: {
                title: 'GEO COVERAGE (Countries)',
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['national'],
                },
              },
              geoCoverageValueSubnational: {
                title: 'Subnational Area',
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['sub-national'],
                },
              },
              geoCoverageCountryStates: {
                title: 'State',
                enum: [],
                depend: {
                  id: 'geoCoverageType',
                  value: ['sub-national'],
                },
              },
            },
          },
          S4_G3: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 2,
            },
            required: ['tags'],
            properties: {
              tags: {
                title: 'Tags',
                enum: [],
              },
            },
          },
          S4_G4: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 3,
            },
            required: [],
            properties: {
              image: {
                title: 'Banner',
                type: 'string',
                format: 'data-url',
              },
              thumbnail: {
                title: 'Thumbnail',
                type: 'string',
                format: 'data-url',
              },
            },
          },
          S4_G5: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 4,
            },
            required: [],
            properties: {
              entity: {
                title: 'Entity connection',
                description: 'entity',
                custom: 'entity',
                type: 'array',
                items: {
                  title: '',
                  type: 'object',
                  required: ['role', 'entity'],
                  properties: {
                    role: {
                      title: 'Entity role',
                      enum: entityRoleOptions.map((x) => x.toLowerCase()),
                      enumNames: entityRoleOptions,
                    },
                    entity: {
                      title: 'Entity',
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
              individual: {
                title: 'Individual connection',
                description: 'individual',
                custom: 'stakeholder',
                type: 'array',
                items: {
                  title: '',
                  type: 'object',
                  required: ['role', 'stakeholder'],
                  properties: {
                    role: {
                      title: 'User role',
                      enum: individualRoleOptions.map((x) =>
                        x !== 'Resource Editor'
                          ? x.toLowerCase()
                          : x.toLowerCase().replace(/ /g, '_')
                      ),
                      enumNames: individualRoleOptions,
                    },
                    stakeholder: {
                      title: 'Indvidual',
                      enum: [],
                      enumNames: [],
                    },
                  },
                },
              },
            },
          },
          S4_G6: {
            title: '',
            type: 'object',
            depend: {
              id: 'steps',
              value: 5,
            },
            properties: {
              info: {
                title: 'Info And Docs',
                type: 'string',
              },
              related: {
                title: 'Related Resource',
                enum: [],
                enumNames: [],
              },
            },
          },
        },
      },
      S5: {
        title: '',
        type: 'object',
        depend: {
          id: 'tabs',
          value: ['S5'],
        },
        required: [],
        properties: {
          yearFounded: {
            title: 'Year Founded',
            type: 'string',
          },
          organisationType: {
            title: 'ORGANISATION TYPE',
            enum: [
              'Established Company',
              'Research Lab',
              'Academic Institution',
              'Startup',
              'Non-Profit Org',
              'Partnerships',
            ],
          },
        },
      },
    },
  },
}
