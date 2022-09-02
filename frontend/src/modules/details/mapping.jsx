export const typeOfActionKeys = [
  {
    key: "workingWithPeople",
    name: "Working With People",
    value: "children",
    child: null,
  },
  {
    key: "technologyAndProcesses",
    name: "Technology & Processes",
    value: "children",
    child: null,
  },
  {
    key: "actionTarget",
    name: "Action Targets",
    value: "children",
    child: null,
  },
  {
    key: "actionImpactType",
    name: "Action Impact Type",
    value: "children",
    child: null,
  },
  {
    key: "typesContaminants",
    name: "Type of Contaminants",
    value: "children",
    child: null,
  },
  {
    key: "isActionBeingReported",
    name: "Reporting & Measuring",
    value: "custom",
    child: [
      {
        key: "isActionBeingReported",
        name: "Reported",
        value: "reports",
      },
      {
        key: "outcomeAndImpact",
        name: "Outcomes and Impact",
        value: "name",
      },
    ],
  },
  {
    key: "monitoringAndAnalysis",
    name: "Monitoring & Analysis",
    value: "children",
    child: null,
  },
];

const detailActionPlan = [
  {
    key: "organisations",
    name: "Organisation",
    value: "organisations",
    type: "array",
  },
  {
    key: "country",
    name: "Country of Origin",
    value: "country",
    type: "country",
  },
  {
    key: "geoCoverageValues",
    name: "Geo-Coverage",
    value: "geoCoverage",
    type: "array",
  },
  {
    key: "publishYear",
    name: "Year",
    value: "publishYear",
    type: "number",
  },
  {
    key: "languages",
    name: "Languages",
    value: "isoCode",
    type: "array",
  },
  {
    key: "tags",
    name: "Tags",
    value: "join",
    type: "array",
  },
];

const detailFinancingResource = [
  {
    key: "organisations",
    name: "Organisation",
    value: "organisations",
    type: "array",
  },
  {
    key: "value",
    name: "Amount",
    value: "custom",
    arrayCustomValue: ["valueCurrency", "value", "valueRemarks"],
    type: "currency",
  },
  {
    key: "geoCoverageValues",
    name: "Geo-Coverage",
    value: "geoCoverage",
    type: "array",
  },
  {
    key: "validFrom",
    name: "Valid From",
    value: "validFrom",
    type: "string",
  },
  {
    key: "validTo",
    name: "Valid Until",
    value: "validTo",
    type: "string",
  },
  {
    key: "publishYear",
    name: "Year",
    value: "publishYear",
    type: "number",
  },
  {
    key: "languages",
    name: "Languages",
    value: "isoCode",
    type: "array",
  },
  {
    key: "country",
    name: "Country of Origin",
    value: "country",
    type: "country",
  },
  {
    key: "tags",
    name: "Tags",
    value: "join",
    type: "array",
  },
];

const detailEvent = [
  {
    key: "startDate",
    name: "Start Date/End",
    value: "custom",
    arrayCustomValue: ["startDate", "endDate"],
    type: "startEndDate",
  },
  {
    key: "geoCoverageValues",
    name: "Geo-Coverage",
    value: "geoCoverage",
    type: "array",
  },
  {
    key: "languages",
    name: "Languages",
    value: "isoCode",
    type: "array",
  },
  {
    key: "tags",
    name: "Tags",
    value: "join",
    type: "array",
  },
];

const detailTechnology = [
  {
    key: "geoCoverageValues",
    name: "Geo-Coverage",
    value: "geoCoverage",
    type: "array",
  },
  {
    key: "organisationType",
    name: "Organisation Type",
    value: "organisationType",
    type: "name",
  },
  {
    key: "headquarters",
    name: "Headquarters",
    value: "headquarters",
    type: "object",
  },
  {
    key: "developmentStage",
    name: "Development Stage",
    value: "developmentStage",
    type: "name",
  },
  {
    key: "yearFounded",
    name: "Year Founded",
    value: "yearFounded",
    type: "number",
  },
  {
    key: "languages",
    name: "Languages",
    value: "isoCode",
    type: "array",
  },
  {
    key: "tags",
    name: "Tags",
    value: "join",
    type: "array",
  },
  // email
  // resource link
];

const detailPolicy = [
  {
    key: "originalTitle",
    name: "Original Title",
    value: "originalTitle",
    type: "name",
  },
  {
    key: "status",
    name: "Status",
    value: "status",
    type: "text",
  },
  {
    key: "geoCoverageValues",
    name: "Geo-Coverage",
    value: "geoCoverage",
    type: "array",
  },
  {
    key: "typeOfLaw",
    name: "Type of Law",
    value: "typeOfLaw",
    type: "name",
  },
  {
    key: "dataSource",
    name: "Data Source",
    value: "dataSource",
    type: "name",
  },
  {
    key: "recordNumber",
    name: "Record Number",
    value: "recordNumber",
    type: "name",
  },
  {
    key: "implementingMea",
    name: "Implementing MEA",
    value: "implementingMea",
    type: "number",
  },
  {
    key: "firstPublicationDate",
    name: "First Publication Date",
    value: "firstPublicationDate",
    type: "date",
  },
  {
    key: "latestAmendmentDate",
    name: "Last Amendment Date",
    value: "latestAmendmentDate",
    type: "date",
  },
  {
    key: "languages",
    name: "Languages",
    value: "isoCode",
    type: "array",
  },
  {
    key: "tags",
    name: "Tags",
    value: "join",
    type: "array",
  },
];

const detailProject = [
  {
    key: "organisation",
    name: "Organisation",
    value: "join",
    type: "array",
  },
  {
    key: "geoCoverageValues",
    name: "Geo-Coverage",
    value: "geoCoverage",
    type: "array",
  },
  {
    key: "funds",
    name: "Amount Invested",
    value: "funds",
    type: "currency",
    currencyObject: { name: "currencyAmountInvested" },
  },
  {
    key: "contribution",
    name: "In Kind Contributions",
    value: "contribution",
    type: "currency",
    currencyObject: { name: "currencyInKindContribution" },
  },
  {
    key: "funding",
    name: "Funding Type",
    value: "custom",
    customValue: "types",
    type: "array",
  },
  {
    key: "funding",
    name: "Funding Name",
    value: "custom",
    customValue: "name",
    type: "object",
  },
  {
    key: "focusArea",
    name: "Focus Area:",
    value: "join",
    type: "array",
  },
  // {
  //     'key' : 'firstPublicationDate',
  //     'name' : 'Lifecycle Phase',
  //     'value' : 'firstPublicationDate',
  //     'type': 'date',
  // },
  {
    key: "lifecyclePhase",
    name: "Lifecycle Phase",
    value: "join",
    type: "array",
  },
  {
    key: "sector",
    name: "Sector",
    value: "join",
    type: "array",
  },
  {
    key: "activityOwner",
    name: "Initiative Owner",
    value: "custom",
    customValue: "topLevel",
    type: "haveChild",
  },
  // {
  //   key: "activityOwner",
  //   name: "Entity Type",
  //   value: "custom",
  //   customValue: "options",
  //   type: "haveParent",
  // },
  {
    key: "activityTerm",
    name: "Initiative Duration",
    value: "activityTerm",
    type: "name",
  },
];

const detailStakeholder = [
  {
    key: "email",
    name: "Email",
    value: "email",
    type: "email",
  },
  {
    key: "country",
    name: "Country",
    value: "country",
    type: "country",
  },
  {
    key: "geoCoverageValues",
    name: "Geo-Coverage",
    value: "geoCoverage",
    type: "array",
  },
  {
    key: "representation",
    name: "Representation",
    value: "representation",
    type: "name",
  },
  {
    key: "organisationRole",
    name: "Role",
    value: "organisationRole",
    type: "name",
  },
  {
    key: "affiliation",
    name: "Entity",
    value: "custom",
    customValue: "name",
    type: "object",
  },
  {
    key: "affiliation",
    name: "Entity Type",
    value: "custom",
    customValue: "type",
    type: "object",
  },
  {
    key: "affiliation",
    name: "Entity Link",
    value: "custom",
    customValue: "url",
    type: "object",
  },
  {
    key: "linkedIn",
    name: "Linked In",
    value: "linkedIn",
    type: "name",
  },
  {
    key: "twitter",
    name: "Twitter",
    value: "twitter",
    type: "name",
  },
  {
    key: "seeking",
    name: "Seeking",
    value: "seeking",
    type: "name",
  },
  {
    key: "offering",
    name: "Offering",
    value: "offering",
    type: "name",
  },
  {
    key: "general",
    name: "Tags",
    value: "general",
    type: "name",
  },
];

const detailOrganisation = [
  {
    key: "type",
    name: "Organisation Type",
    value: "type",
    type: "name",
  },
  {
    key: "areaOfExpertise",
    name: "Area of Expertise",
    value: "areaOfExpertise",
    type: "name",
  },
  {
    key: "projectRelatedToMarineLitter",
    name: "Programs and Projects Related to Marine Litter",
    value: "projectRelatedToMarineLitter",
    type: "name",
  },
  {
    key: "areaTheApplicantWillContributeTo",
    name: "Area Applicant Will Contribute To",
    value: "areaTheApplicantWillContributeTo",
    type: "name",
  },
  {
    key: "url",
    name: "Website",
    value: "url",
    type: "link",
  },
  {
    key: "geoCoverageValues",
    name: "Geo-Coverage",
    value: "geoCoverage",
    type: "array",
  },
  {
    key: "isMember",
    name: "GPML Member",
    value: "isMember",
    type: "name",
  },
];

export const detailMaps = {
  action_plan: detailActionPlan,
  technical_resource: detailActionPlan,
  financing_resource: detailFinancingResource,
  event: detailEvent,
  technology: detailTechnology,
  policy: detailPolicy,
  initiative: detailProject,
  stakeholder: detailStakeholder,
  organisation: detailOrganisation,
};

const description = {
  key: "summary",
  name: "Description",
};

const eventDescription = {
  key: "description",
  name: "Description",
};

const technologyDescription = {
  key: "remarks",
  name: "Description",
};

const policyDescription = {
  key: "abstract",
  name: "Abstract",
};

const stakeholderDescription = {
  key: "about",
  name: "About",
};

export const descriptionMaps = {
  initiative: description,
  action_plan: description,
  technical_resource: description,
  financing_resource: description,
  event: eventDescription,
  technology: technologyDescription,
  policy: policyDescription,
  stakeholder: stakeholderDescription,
};

// for action_plan, technical_resource, financing_resource
const resourceInfo = [
  {
    key: "languages",
    name: "Resource Link",
    value: "resource_url",
    type: "array",
  },
  {
    key: "attachments",
    name: "Attachments",
    value: "link",
    type: "array",
  },
];

export const infoMaps = {
  initiative: [
    {
      key: "infoResourceLinks",
      name: "Resource Link",
      value: "link",
      type: "array",
    },
  ],
  event: [
    {
      key: "languages",
      name: "Link",
      value: "resource_url",
      type: "array",
    },
  ],
  technology: [
    {
      key: "email",
      name: "Email",
      value: "email",
      type: "name",
    },
    {
      key: "url",
      name: "Resource Link",
      value: "url",
      type: "link",
    },
  ],
  policy: [
    {
      key: "url",
      name: "Policy Link",
      value: "url",
      type: "link",
    },
    {
      key: "attachments",
      name: "Other Links",
      value: "link",
      type: "array",
    },
  ],
  action_plan: resourceInfo,
  technical_resource: resourceInfo,
  financing_resource: resourceInfo,
};
