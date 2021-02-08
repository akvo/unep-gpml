import humps from 'humps'

export const topicTypes = ['project', 'event', 'policy', 'technology', 'financingResource', 'technicalResource', 'stakeholder']

export const topicNames = (topic) => {
  const names = {
    'project': 'Project',
    'event': 'Event',
    'policy': 'Policy',
    'technology': 'Technology',
    'financingResource': 'Financing Resource',
    'technicalResource': 'Technical Resource',
    'stakeholder': 'Stakeholder',
  };
  return names[humps.camelize(topic)];
};

const resourceSubTypes = ["financing_resource", "technical_resource"]
export const resourceTypeToTopicType = (topicType) => resourceSubTypes.indexOf(topicType) > -1 ? 'resource' : topicType
