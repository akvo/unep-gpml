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
]
