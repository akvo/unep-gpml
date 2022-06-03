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
  "capacityBuilding",
];

export const networkTypes = ["organisation", "stakeholder"];

export const networkNames = (network) => {
  const names = {
    organisation: "Entity",
    stakeholder: "Individual",
  };
  return names[humps.camelize(network)];
};

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
    capacityBuilding: "Capacity Building",
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
  resource: ["interested in"],
  technology: ["interested in"],
  event: ["interested in"],
  project: ["interested in"],
  policy: ["interested in"],
  stakeholder: ["interested in", "other"],
  organisation: ["interested in", "other"],
};

export const entityName = (entity) => {
  const names = {
    partner: "Partner",
    owner: "GPML Members",
    implementor: "Center of excellence",
    donor: "Sponsor",
  };
  return names[humps.camelize(entity)];
};

export const userRoles = ["USER", "REVIEWER", "ADMIN"];

export const reviewStatusUIText = {
  PENDING: "Awaiting Review",
  ACCEPTED: "Approved",
  REJECTED: "Declined",
  ACCEPT: "Approve",
  APPROVED: "Approved",
  REJECT: "Decline",
};

export const submissionReviewStatusUIText = {
  SUBMITTED: "Submitted",
  APPROVED: "Published",
  REJECTED: "Declined",
};

export const reviewCommentModalTitle = {
  ACCEPTED: "Approving",
  REJECTED: "Declining",
};

export const reviewCommentPlaceholder = {
  ACCEPTED: "Reason for approving this",
  REJECTED: "Reason for declining this",
};

export const publishStatusUIText = {
  APPROVED: "Published",
  APPROVE: "Publish",
  REJECTED: "Declined",
  REJECT: "Decline",
  UNAPPROVED: "Unpublished",
  UNAPPROVE: "Unpublish",
};

export const colors = [
  "#FFB800",
  "#98B527",
  "#38A259",
  "#008776",
  "#006776",
  "#2F4858",
  "#FFC1B4",
  "#FE8A7F",
  "#C1554E",
];
export const tagsMap = (array, category, tags) => {
  return array.map((x) => {
    return {
      ...(!isNaN(parseInt(x)) && { id: parseInt(x) }),
      tag:
        Object.values(tags)
          .flat()
          .find((o) => o.id === parseInt(x))?.tag || x?.toLowerCase(),
      tag_category: category,
    };
  });
};
