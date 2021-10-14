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

export const topicTypesIncludingOrg = topicTypes.concat(["organisation"]);

export const topicTypesApprovedUser = topicTypes.concat([
  "organisation",
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

export const resourceSubTypes = new Set([
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

export const userRoles = ["USER", "REVIEWER", "ADMIN"];

export const reviewStatusUIText = {
  PENDING: "Awaiting Review",
  ACCEPTED: "Approved",
  REJECTED: "Revision Needed",
  ACCEPT: "Approve",
  REJECT: "Decline",
};

export const reviewCommentModalTitle = {
  ACCEPTED: "Approve the reviewed resource",
  REJECTED: "Revision needed for the reviewed resource",
};

export const publishStatusUIText = {
  APPROVED: "Published",
  APPROVE: "Publish",
  REJECTED: "Declined",
  REJECT: "Decline",
};

export const staticTopics = {
  topics: [
    {
      id: 1558,
      tag: "capacity building",
    },
    {
      id: 1557,
      tag: "marine litter",
    },
    {
      id: 1556,
      tag: "plastics",
    },
    {
      id: 1554,
      tag: "product by design",
    },
    {
      id: 1559,
      tag: "source-to-sea",
    },
    {
      id: 1555,
      tag: "waste management",
    },
  ],
};
