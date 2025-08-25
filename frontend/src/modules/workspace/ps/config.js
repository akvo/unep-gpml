import { t, msg } from '@lingui/macro'
import { countries } from 'countries-list'

export let isoA2 = {
  'country-a': '0A',
}

export let iso2name = {
  '0A': 'Country A',
}

Object.keys(countries).forEach((key) => {
  isoA2[countries[key].name.toLowerCase().replace(/ /g, '-')] = key
  iso2name[key] = countries[key].name
})

export const iso2id = {
  MU: 480,
  PE: 604,
  KH: 116,
  SB: 90,
  EC: 218,
  SN: 686,
  ZA: 710,
  CI: 384,
  CV: 132,
  KI: 296,
  SL: 694,
  ST: 678,
  JM: 388,
  TT: 780,
  GN: 324,
  TV: 798,
  VU: 548,
  TG: 768,
  PG: 598,
  FJ: 242,
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
    label: 'Stakeholder Consultations',
    slug: '2-stakeholder-consultation',
    substeps: [
      { label: 'Intro', slug: '', checked: false },
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
    label: 'Legislation & Policy Review',
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
    label: 'National Source Inventory',
    slug: '4-national-source',
    substeps: [
      { label: 'Intro', slug: '', checked: false },
      {
        label: 'Plastics in Economy',
        slug: 'plastics-in-economy',
        checked: false,
        strapiParams: {
          slug: 'plastics-in-economy',
        },
      },
      {
        label: 'Plastic Waste Management',
        slug: 'plastic-waste-management',
        checked: false,
        strapiParams: {
          slug: 'plastic-waste-management',
        },
      },
      {
        label: 'Plastics in the Environment',
        slug: 'plastics-in-environment',
        checked: false,
        strapiParams: {
          slug: 'plastics-in-environment',
        },
      },
      {
        label: 'National Source Inventory Data Mapping',
        slug: 'data-mapping',
        checked: false,
        strapiParams: {
          slug: 'data-mapping',
        },
      },
      { label: 'Summary & Report', slug: 'summary', checked: false },
    ],
  },
  {
    label: 'National Action Plan',
    slug: '5-national-action-plan',
    substeps: [
      { label: 'Intro', slug: '', checked: false },
      { label: 'Summary & Report', slug: 'summary', checked: false },
    ],
  },
]

export const getParentChecked = (step) =>
  step?.substeps?.length
    ? step.substeps.filter((sb) => sb.checked).length === step.substeps.length
    : step?.checked

export const ROLES = [
  {
    key: 'admin',
    label: msg`Admin`,
    description: msg`Admins can edit all content and manage the team`,
  },
  {
    key: 'editor',
    label: msg`Editor`,
    description: msg`Editors can edit all content, but cannot manage the team`,
  },
  {
    key: 'viewer',
    label: msg`Viewer`,
    description: msg`Viewers cannot edit all content`,
  },
]
export const TEAMS = [
  {
    label: msg`Steering Committee`,
    value: 'steering-committee',
    description: msg`Description text for what this is`,
  },
  {
    label: msg`Project Team`,
    value: 'project-team',
    description: msg`Description text for what this is`,
  },
]
