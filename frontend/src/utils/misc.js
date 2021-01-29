export const topicTypes = ['project', 'event', 'policy', 'technology', 'financingResource', 'technicalResource']

export const topicNames = {
  'project': 'Project',
  'event': 'Event',
  'policy': 'Policy',
  'technology': 'Technology',
  'financingResource': 'Financing Resource',
  'technicalResource': 'Technical Resource',
}

const resourceSubTypes = ["financing_resource", "technical_resource"]
export const resourceTypeToTopicType = (topicType) => resourceSubTypes.indexOf(topicType) > -1 ? 'resource' : topicType
