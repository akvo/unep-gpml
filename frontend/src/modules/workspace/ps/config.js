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
      { label: 'Stakeholder Map', slug: 'stakeholder-map', checked: false },
      { label: 'Case Studies', slug: 'case-studies', checked: false },
      { label: 'Initiatives', slug: 'initiatives', checked: false },
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
      },
      {
        label: 'Legislative Development Guide',
        slug: 'legislative-development',
        checked: false,
      },
      { label: 'Case Studies', slug: 'case-studies', checked: false },
      { label: 'Summary & Report', slug: 'summary', checked: false },
    ],
  },
  {
    label: 'Data Analysis',
    slug: '4-data-analysis',
    substeps: [
      { label: 'Intro', slug: '', checked: false },
      { label: 'Available Tools', slug: 'available-tools', checked: false },
      {
        label: 'Available Data & Statistics',
        slug: 'available-data',
        checked: false,
      },
      { label: 'Data Collection', slug: 'data-collection', checked: false },
      {
        label: 'Calculation of Indicators',
        slug: 'calculation',
        checked: false,
      },
      {
        label: 'Available Information',
        slug: 'available-information',
        checked: false,
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
      { label: 'Upload', slug: 'upload', checked: false },
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
  },
  {
    label: 'Project Team',
    value: 'project-team',
  },
]
