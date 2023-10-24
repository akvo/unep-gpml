export const isoA2 = {
  mauritius: 'MU',
  peru: 'PE',
  cambodia: 'KH',
  'solomon-islands': 'SB',
  ecuador: 'EC',
  senegal: 'SN',
  'south-africa': 'ZA',
  'cote-d-ivoire': 'CI',
}

export const iso2id = {
  MU: 480,
  PE: 604,
  KH: 116,
  SB: 90,
  EC: 218,
  SN: 686,
  ZA: 710,
  CI: 384,
}

export const PREFIX_SLUG = 'plastic-strategy'

export const stepsState = [
  { label: 'Instructions', slug: '', checked: false },
  {
    label: 'National Steering Committee & Project Team',
    slug: '1-project-team',
    substeps: [
      { label: 'Intro', slug: '', checked: false },
      { label: 'Setup your team', slug: 'setup-team', checked: false },
    ],
  },
  {
    label: 'Stakeholder Consultation Process',
    slug: '2-stakeholder-consultation',
    substeps: [
      { label: 'Intro', slug: '', checked: false },
      {
        label: 'Stakeholder Map',
        slug: 'stakeholder-map',
        checked: false,
        apiParams: {
          basePath: 'organisations',
          tag: 'stakeholder-{country}',
          ps_bookmark_sections_keys: 'stakeholder-map',
          ps_bookmarked: true,
        },
      },
      {
        label: 'Case Studies',
        slug: 'case-studies',
        checked: false,
        apiParams: {
          tag: 'stakeholder consultation process',
          ps_bookmark_sections_keys: 'stakeholder-case-studies',
        },
      },
      {
        label: 'Initiatives',
        slug: 'initiatives',
        checked: false,
        apiParams: {
          topic: 'initiative',
          country: '{countryID}',
          ps_bookmark_sections_keys: 'stakeholder-initiatives',
        },
      },
      { label: 'Summary & Report', slug: 'summary', checked: false },
    ],
  },
  {
    label: 'Legislation & Policy Review Report',
    slug: '3-legislation-policy',
    substeps: [
      { label: 'Intro', slug: '', checked: false },
      {
        label: 'Country Policy Framework',
        slug: 'country-policy',
        checked: false,
        apiParams: {
          topic: 'policy',
          country: '{countryID}',
          ps_bookmark_sections_keys: 'country-policy',
        },
      },
      {
        label: 'Legislative Development Guide',
        slug: 'legislative-development',
        checked: false,
      },
      {
        label: 'Case Studies',
        slug: 'case-studies',
        checked: false,
        apiParams: {
          tag: 'legislative & policy review case study',
          ps_bookmark_sections_keys: 'stakeholder-case-studies',
        },
      },
      { label: 'Summary & Report', slug: 'summary', checked: false },
    ],
  },
  {
    label: 'Data Analysis',
    slug: '4-data-analysis',
    substeps: [
      { label: 'Intro', slug: '', checked: false },
      {
        label: 'Available Tools',
        slug: 'available-tools',
        checked: false,
        apiParams: {
          tag: 'data analysis - available tools',
          ps_bookmark_sections_keys: 'data-available-tools',
        },
      },
      {
        label: 'Available Data & Statistics',
        slug: 'available-data',
        checked: false,
      },
      {
        label: 'Data Collection',
        slug: 'data-collection',
        checked: false,
        apiParams: {
          tag: 'data analysis - data collection',
          ps_bookmark_sections_keys: 'data-collection',
        },
      },
      {
        label: 'Calculation of Indicators',
        slug: 'calculation',
        checked: false,
      },
      {
        label: 'Available Information',
        slug: 'available-information',
        checked: false,
        apiParams: {
          country: '{countryID}',
          topic: 'technology,event,financing_resource,technical_resource',
          capacity_building: true,
          ps_bookmark_sections_keys: 'data-collection',
        },
      },
      { label: 'Summary & Report', slug: 'summary', checked: false },
    ],
  },
  {
    label: 'National Source Inventory Report',
    slug: '5-national-source',
    substeps: [
      { label: 'Intro', slug: '', checked: false },
      { label: 'Summary & Report', slug: 'summary', checked: false },
    ],
  },
  {
    label: 'National Plastic Strategy',
    slug: '6-national-plastic-strategy',
    substeps: [
      { label: 'Intro', slug: '', checked: false },
      { label: 'Upload', slug: 'summary', checked: false },
    ],
  },
  { label: 'Final Review', slug: '7-final-review', checked: false },
]

export const getParentChecked = (step) =>
  step?.substeps?.length
    ? step.substeps.filter((sb) => sb.checked).length === step.substeps.length
    : step?.checked

export const ROLES = [
  {
    key: 'admin',
    label: 'Admin',
    description: 'Admins can edit all content and manage the team',
  },
  {
    key: 'editor',
    label: 'Editor',
    description: 'Editors can edit all content, but cannot manage the team',
  },
  {
    key: 'viewer',
    label: 'Viewer',
    description: 'Viewers cannot edit all content',
  },
]
export const TEAMS = [
  {
    label: 'Steering Committee',
    value: 'steering-committee',
    description: 'Description text for what this is',
  },
  {
    label: 'Project Team',
    value: 'project-team',
    description: 'Description text for what this is',
  },
]