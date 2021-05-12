import humps from "humps";

export const tTypes = [
  "project",
  "actionPlan",
  "policy",
  "technicalResource",
  "financingResource",
  "event",
  "technology",
  "organisation",
  "stakeholder",
];

export const topicTypes = [
  "project",
  "actionPlan",
  "policy",
  "technicalResource",
  "financingResource",
  "event",
  "technology",
];

export const topicTypesIncludingOrg = [
  "project",
  "actionPlan",
  "policy",
  "technicalResource",
  "financingResource",
  "event",
  "technology",
  "organisation",
];

export const topicTypesApprovedUser = topicTypesIncludingOrg.concat([
  "stakeholder",
]);

export const topicNames = (topic) => {
  const names = {
    project: "Initiative",
    actionPlan: "Action Plan",
    policy: "Policy",
    technicalResource: "Technical Resource",
    financingResource: "Financing Resource",
    event: "Event",
    technology: "Technology",
    organisation: "Entity",
    stakeholder: "Individual",
  };
  return names[humps.camelize(topic)];
};

const resourceSubTypes = new Set([
  "financing_resource",
  "technical_resource",
  "action_plan",
]);
export const resourceTypeToTopicType = (type) =>
  resourceSubTypes.has(type) ? "resource" : type;

export const relationsByTopicType = {
  resource: ["owner", "reviewer", "user", "interested in", "other"],
  technology: ["owner", "user", "reviewer", "interested in", "other"],
  event: [
    "resource person",
    "organiser",
    "participant",
    "sponsor",
    "host",
    "interested in",
    "other",
  ],
  project: [
    "owner",
    "implementor",
    "reviewer",
    "user",
    "interested in",
    "other",
  ],
  policy: ["regulator", "implementor", "reviewer", "interested in", "other"],
  stakeholder: ["interested in", "other"],
  organisation: ["interested in", "other"],
};
