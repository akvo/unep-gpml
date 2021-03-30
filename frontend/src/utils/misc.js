import humps from "humps";

export const topicTypes = [
  "actionPlan",
  "event",
  "financingResource",
  "technicalResource",
  "technology",
  "policy",
  "project",
];

export const topicTypesIncludingOrg = [
  "actionPlan",
  "event",
  "financingResource",
  "technicalResource",
  "technology",
  "policy",
  "project",
  "organisation",
];

export const topicTypesApprovedUser = topicTypesIncludingOrg.concat([
  "stakeholder",
]);

export const topicNames = (topic) => {
  const names = {
    actionPlan: "Action Plans",
    event: "Events",
    financingResource: "Financing Resources",
    technicalResource: "Technical Resources",
    technology: "Technologies",
    policy: "Policies",
    project: "Initiatives",
    stakeholder: "Stakeholder",
    organisation: "Entity",
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
