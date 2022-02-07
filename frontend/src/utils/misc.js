import humps from "humps";

// Impoer Icons as React component since the color of the icons changes when the card is selected
import { ReactComponent as CapacityBuildingIcon } from "../images/knowledge-library/capacity-building.svg";
import { ReactComponent as ActionSelectedIcon } from "../images/knowledge-library/action-selected.svg";
import { ReactComponent as EventFlexibleIcon } from "../images/knowledge-library/event-flexible.svg";
import { ReactComponent as InitiativeIcon } from "../images/knowledge-library/initiative.svg";
import { ReactComponent as FinancingIcon } from "../images/knowledge-library/financing.svg";
import { ReactComponent as PolicyIcon } from "../images/knowledge-library/policy.svg";
import { ReactComponent as TechnicalIcon } from "../images/knowledge-library/technical.svg";
import { ReactComponent as TechnologyIcon } from "../images/knowledge-library/technology.svg";

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
    return <InitiativeIcon width="53" height="53" />;
  }
  if (topic === "actionPlan") {
    return <ActionSelectedIcon width="53" height="53" />;
  }
  if (topic === "policy") {
    return <PolicyIcon width="53" height="53" />;
  }
  if (topic === "technicalResource") {
    return <TechnicalIcon width="53" height="53" />;
  }
  if (topic === "financingResource") {
    return <FinancingIcon width="53" height="53" />;
  }
  if (topic === "event") {
    return <EventFlexibleIcon width="53" height="53" />;
  }
  if (topic === "technology") {
    return <TechnologyIcon width="53" height="53" />;
  }
  if (topic === "organisation") {
    return <CapacityBuildingIcon width="53" height="53" />;
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
    // partner: "Partner",
    owner: "GPML Members",
    // implementor: "Center of excellence",
    // donor: "Sponsor",
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
