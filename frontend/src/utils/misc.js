import humps from 'humps'

export const topicTypes = ['project', 'event', 'policy', 'technology', 'financingResource', 'technicalResource', 'actionPlan']

export const topicTypesApprovedUser = topicTypes.concat(['stakeholder'])

export const topicNames = (topic) => {
  const names = {
    'project': 'Project',
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

const resourceSubTypes = ["financing_resource", "technical_resource", "action_plan"]
export const resourceTypeToTopicType = (topicType) => resourceSubTypes.indexOf(topicType) > -1 ? 'resource' : topicType
