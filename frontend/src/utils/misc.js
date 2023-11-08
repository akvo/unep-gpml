import humps from 'humps'
import auth0 from 'auth0-js'
import ReactGA from 'react-ga4'
import { useRouter } from 'next/router'
import { i18n } from '@lingui/core'

export const tTypes = [
  'project',
  'actionPlan',
  'policy',
  'technicalResource',
  'financingResource',
  'event',
  'technology',
  'organisation',
  'stakeholder',
]

export const topicTypes = [
  'project',
  'actionPlan',
  'policy',
  'technicalResource',
  'financingResource',
  'event',
  'technology',
  'capacityBuilding',
]

export const networkTypes = ['organisation', 'stakeholder']

export const networkNames = (network) => {
  const names = {
    organisation: 'Entity',
    stakeholder: 'Individual',
  }
  return names[humps.camelize(network)]
}

export const topicTypesIncludingOrg = topicTypes.concat(['organisation'])

export const topicTypesApprovedUser = topicTypes.concat([
  'organisation',
  'stakeholder',
])

export const topicNames = (topic) => {
  const names = {
    initiative: 'Initiative',
    actionPlan: 'Action Plan',
    policy: 'Policy',
    technicalResource: 'Technical Resource',
    financingResource: 'Financing Resource',
    event: 'Event',
    technology: 'Technology',
    organisation: 'Entity',
    stakeholder: 'Individual',
    capacityBuilding: 'Capacity Building',
  }
  return names[humps.camelize(topic)]
}

export const resourceSubTypes = new Set([
  'financing_resource',
  'technical_resource',
  'action_plan',
])
export const resourceTypeToTopicType = (type) =>
  resourceSubTypes.has(type) ? 'resource' : type

export const relationsByTopicType = {
  resource: ['interested in'],
  technology: ['interested in'],
  event: ['interested in'],
  project: ['interested in'],
  policy: ['interested in'],
  stakeholder: ['interested in', 'other'],
  organisation: ['interested in', 'other'],
}

export const entityName = (entity) => {
  const names = {
    partner: 'Partner',
    owner: 'GPML Members',
    implementor: 'Center of excellence',
    donor: 'Sponsor',
  }
  return names[humps.camelize(entity)]
}

export const userRoles = ['USER', 'REVIEWER', 'ADMIN']

export const reviewStatusUIText = {
  PENDING: 'Awaiting Review',
  ACCEPTED: 'Approved',
  REJECTED: 'Declined',
  ACCEPT: 'Approve',
  APPROVED: 'Approved',
  REJECT: 'Decline',
}

export const submissionReviewStatusUIText = {
  SUBMITTED: 'Submitted',
  APPROVED: 'Published',
  REJECTED: 'Declined',
}

export const reviewCommentModalTitle = {
  ACCEPTED: 'Approving',
  REJECTED: 'Declining',
}

export const reviewCommentPlaceholder = {
  ACCEPTED: 'Reason for approving this',
  REJECTED: 'Reason for declining this',
}

export const publishStatusUIText = {
  APPROVED: 'Approved',
  APPROVE: 'Approve',
  REJECTED: 'Declined',
  REJECT: 'Decline',
  UNAPPROVED: 'Unapproved',
  UNAPPROVE: 'Unapprove',
}

export const randomColor = (string) => {
  const colors = [
    '#FFB800',
    '#98B527',
    '#38A259',
    '#008776',
    '#006776',
    '#2F4858',
    '#FFC1B4',
    '#FE8A7F',
    '#C1554E',
  ]

  let hash = 0
  if (string?.length === 0) return hash
  for (let i = 0; i < string?.length; i++) {
    hash = string?.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }
  hash = ((hash % colors.length) + colors.length) % colors.length
  return colors[hash]
}

export const tagsMap = (array, category, tags) => {
  return array.map((x) => {
    return (
      Object.values(tags)
        .flat()
        .find((o) => o.id === parseInt(x))?.tag || x
    )
  })
}

export const tagsMapExpertise = (array, category, tags) => {
  return array.map((x) => {
    return {
      ...(!isNaN(parseInt(x)) && { id: parseInt(x) }),
      tag:
        Object.values(tags)
          .flat()
          .find((o) => o.id === parseInt(x))?.tag || x?.toLowerCase(),
      tag_category: category,
    }
  })
}

export const toTitleCase = (phrase) => {
  return phrase
    ?.toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const domain =
  typeof window !== 'undefined'
    ? window.__ENV__.auth0.domain.replace(/(https:\/\/|\/)/gi, '')
    : ''

export const auth0Client = new auth0.WebAuth({
  domain: domain,
  clientID: typeof window !== 'undefined' ? window.__ENV__.auth0.clientId : '',
  audience: typeof window !== 'undefined' ? window.__ENV__.auth0.audience : '',
  redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
  scope: 'openid profile email',
  responseType: 'token id_token',
})

export const eventTrack = (category, action, label) => {
  console.log('GA event:', category, ':', action, ':', label)
  ReactGA.event({
    category: category,
    action: action,
    label: label,
  })
}

export const useQuery = () => {
  const { query } = useRouter()
  const ret = {}

  for (let key in query) {
    if (typeof query[key] === 'string') {
      ret[key] = query[key].split(',').filter((it) => it !== '')
    } else {
      ret[key] = query[key]
    }
  }

  return ret
}

export const pagination = {
  clickable: true,
  renderBullet: function (index, className) {
    return '<div class="' + className + '">' + '<span/>' + '</div>'
  },
}

export const shortenOrgTypes = {
  Government: 'Government',
  'Private Sector (for-profit)': 'Private Sector',
  'Intergovernmental Organizations (IGOs)': 'IGO',
  'Non-Governmental Organization (NGO)': 'NGO',
  'Academia and Research': 'Academia and Research',
  'Civil Society (not-for-profit)': 'Civil Society',
  Other: 'Other',
}

export const deepTranslate = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(deepTranslate)
  } else if (typeof obj === 'object' && obj !== null) {
    const translatedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] && obj[key].id && obj[key].message) {
          translatedObj[key] = i18n._(obj[key])
        } else {
          translatedObj[key] = deepTranslate(obj[key])
        }
      }
    }
    return translatedObj
  } else {
    return obj
  }
}

export function transformStrapiResponse(value) {
  return value.map((item) => {
    return { id: item.id, ...item.attributes }
  })
}

export function stripHtml(html) {
  let tmp = document.createElement('DIV')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export const getBadgeTitle = (badgeKey) => {
  const badges = {
    'user-verified': {
      title: 'GPML Verified',
      image: '/verified.svg',
    },
    'user-focal-point-verified': {
      title: 'Verified Focal Point',
      image: '/focal-verified.svg',
    },
    'org-verified': {
      title: 'GPML Verified',
      image: '/verified.svg',
    },
    'org-partner-verified': {
      title: 'Verified Partner',
      image: '/partner-verified.svg',
    },
    'org-coe-verified': {
      title: 'Verified Center of Excellence',
      image: '/coe-verified.svg',
    },
    'resource-verified': {
      title: 'GPML Verified',
      image: '/verified.svg',
    },
    'resource-country-verified': {
      title: 'GPML Verified',
      image: '/focal-verified.svg',
    },
  }
  return (
    badges[badgeKey] || { title: 'Unknown Badge', image: 'default-badge.svg' }
  )
}
