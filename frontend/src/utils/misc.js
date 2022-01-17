import humps from "humps";

// Icons
import CapacityBuildingIcon from "../images/knowledge-library/capacity-building.svg";
import ActionSelectedIcon from "../images/knowledge-library/action-selected.svg";
import EventFlexibleIcon from "../images/knowledge-library/event-flexible.svg";
import InitiativeIcon from "../images/knowledge-library/initiative.svg";
import FinancingIcon from "../images/knowledge-library/financing.svg";
import PolicyIcon from "../images/knowledge-library/policy.svg";
import TechnicalIcon from "../images/knowledge-library/technical.svg";
import TechnologyIcon from "../images/knowledge-library/technology.svg";

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

export const topicIcons = (topic) => {
  if (topic === "project") {
    return InitiativeIcon;
  }
  if (topic === "actionPlan") {
    return ActionSelectedIcon;
  }
  if (topic === "policy") {
    return PolicyIcon;
  }
  if (topic === "technicalResource") {
    return TechnicalIcon;
  }
  if (topic === "financingResource") {
    return FinancingIcon;
  }
  if (topic === "event") {
    return EventFlexibleIcon;
  }
  if (topic === "technology") {
    return TechnologyIcon;
  }
  if (topic === "organisation") {
    return CapacityBuildingIcon;
  }
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
