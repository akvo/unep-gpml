import humps from 'humps'

export const topicTypes = ['project', 'event', 'policy', 'technology', 'financingResource', 'technicalResource', 'actionPlan']

export const topicTypesApprovedUser = topicTypes.concat(['stakeholder'])

export const topicNames = (topic) => {
  const names = {
    'project': 'Activity',
    'event': 'Event',
    'policy': 'Policy',
    'technology': 'Technology',
    'financingResource': 'Financing Resource',
    'technicalResource': 'Technical Resource',
    'actionPlan': 'Action Plan',
    'stakeholder': 'Stakeholder',
  };
  return names[humps.camelize(topic)];
};

const resourceSubTypes = new Set(["financing_resource", "technical_resource", "action_plan"])
export const resourceTypeToTopicType = (type) => resourceSubTypes.has(type) ? 'resource' : type
