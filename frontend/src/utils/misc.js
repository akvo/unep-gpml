import humps from 'humps'

export const topicTypes = ['project', 'event', 'policy', 'technology', 'financingResource', 'technicalResource']

export const topicTypesApprovedUser = topicTypes.concat(['stakeholder'])

export const seekingKeys = ['donations', 'environmental scientists', 'funds', 'legal expert', 'marine biologists', 'marine litter experts', 'partnerships', 'plastics expert', 'recyclers', 'software products', 'volunteers', 'waste management services']

export const offeringKeys = ['funding', 'knowledge management', 'legal services', 'marine litter consultancy', 'recycling', 'software development', 'training', 'waste management']

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
