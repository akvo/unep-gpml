export const typeOfActionKeys = [
    {
        key: 'workingWithPeople', 
        name: 'Working With People',
        value: 'children',
        child: null,
    },
    {
        key: 'technologyAndProcesses', 
        name: 'Technology & Processes',
        value: 'children',
        child: null,
    },
    {
        key: 'actionTarget', 
        name: 'Action Targets',
        value: 'children',
        child: null,
    },
    {
        key: 'actionImpactType', 
        name: 'Action Impact Type',
        value: 'children',
        child: null,
    }, 
    {
        key: 'typesContaminants', 
        name: 'Type of Contaminants',
        value: 'children',
        child: null,
    },
    {
        key: 'isActionBeingReported', 
        name: 'Reporting & Measuring',
        value: 'custom',
        child: [
        {
            key: 'isActionBeingReported',
            name: 'Reported',
            value: 'reports'
        },
        {
            key: 'outcomeAndImpact',
            name: 'Outcomes and Impact',
            value: 'name'
        }
        ],
    },
    {
        key: 'monitoringAndAnalysis', 
        name: 'Monitoring & Analysis',
        value: 'children',
        child: null,
    },
];

const detailActionPlan = [
    {
        'key' : 'organisation',
        'name' : 'Organisation',
        'value' : 'organisation',
        'type': 'name',
    },
    {
        'key' : 'geoCoverageType',
        'name' : 'Geo-Coverage',
        'value' : 'geoCoverageType',
        'type': 'text',
    },
    {
        'key' : 'geoCoverageValues',
        'name' : 'Country',
        'value' : 'countries',
        'type': 'array',
    },
    {
        'key' : 'publishYear',
        'name' : 'Year',
        'value' : 'publishYear',
        'type': 'number',
    },
    {
        'key' : 'languages',
        'name' : 'Languages',
        'value' : 'isoCode',
        'type': 'array',
    },
    {
        'key' : 'tags',
        'name' : 'Tags',
        'value' : 'join',
        'type': 'array',
    },
];

const detailFinancingResource = [
    {
        'key' : 'organisations',
        'name' : 'Organisation',
        'value' : 'organisations',
        'type': 'array',
    },
    {
        'key' : 'value',
        'name' : 'Amount',
        'value' : 'custom',
        'customValue': ['valueCurrency', 'value', 'valueRemarks'],
        'type': 'currency',
    },
    {
        'key' : 'geoCoverageType',
        'name' : 'Geo-Coverage',
        'value' : 'geoCoverageType',
        'type': 'text',
    },
    {
        'key' : 'geoCoverageValues',
        'name' : 'Country',
        'value' : 'countries',
        'type': 'array',
    },
    {
        'key' : 'validFrom',
        'name' : 'Valid From',
        'value' : 'validFrom',
        'type': 'date',
    },
    {
        'key' : 'validTo',
        'name' : 'Valid Until',
        'value' : 'validTo',
        'type': 'date',
    },
    {
        'key' : 'publishYear',
        'name' : 'Year',
        'value' : 'publishYear',
        'type': 'number',
    },
    {
        'key' : 'languages',
        'name' : 'Languages',
        'value' : 'isoCode',
        'type': 'array',
    },
    {
        'key' : 'tags',
        'name' : 'Tags',
        'value' : 'join',
        'type': 'array',
    },
];

const detailEvent = [
    {
        'key' : 'startDate',
        'name' : 'Start Date/End',
        'value' : 'custom',
        'customValue': ['startDate', 'endDate'],
        'type': 'date',
    },
    // {
    //     'key' : 'url',
    //     'name' : 'Link',
    //     'value' : 'url',
    //     'type': 'link',
    // },
    {
        'key' : 'geoCoverageType',
        'name' : 'Geo-Coverage',
        'value' : 'geoCoverageType',
        'type': 'text',
    },
    {
        'key' : 'geoCoverageValues',
        'name' : 'Country',
        'value' : 'countries',
        'type': 'array',
    },
    {
        'key' : 'languages',
        'name' : 'Languages',
        'value' : 'isoCode',
        'type': 'array',
    },
    {
        'key' : 'tags',
        'name' : 'Tags',
        'value' : 'join',
        'type': 'array',
    },
];

const detailTechnology = [
    {
        'key' : 'geoCoverageType',
        'name' : 'Geo-Coverage',
        'value' : 'geoCoverageType',
        'type': 'text',
    },
    {
        'key' : 'geoCoverageValues',
        'name' : 'Country',
        'value' : 'countries',
        'type': 'array',
    },
    {
        'key' : 'organisationType',
        'name' : 'Organisation Type',
        'value' : 'organisationType',
        'type': 'name',
    },
    {
        'key' : 'headquarters',
        'name' : 'Headquarters',
        'value' : 'headquarters',
        'type': 'object',
    },
    {
        'key' : 'developmentStage',
        'name' : 'Development Stage',
        'value' : 'developmentStage',
        'type': 'name',
    },
    {
        'key' : 'yearFounded',
        'name' : 'Year Founded',
        'value' : 'yearFounded',
        'type': 'number',
    },
    {
        'key' : 'languages',
        'name' : 'Languages',
        'value' : 'isoCode',
        'type': 'array',
    },
    {
        'key' : 'tags',
        'name' : 'Tags',
        'value' : 'join',
        'type': 'array',
    },
    // email
    // resource link
];

const detailPolicy = [
    {
        'key' : 'originalTitle',
        'name' : 'Original Title',
        'value' : 'originalTitle',
        'type': 'name',
    },
    {
        'key' : 'status',
        'name' : 'Status',
        'value' : 'status',
        'type': 'text',
    },
    {
        'key' : 'geoCoverageType',
        'name' : 'Geo-Coverage',
        'value' : 'geoCoverageType',
        'type': 'text',
    },
    {
        'key' : 'geoCoverageValues',
        'name' : 'Country',
        'value' : 'countries',
        'type': 'array',
    },
    {
        'key' : 'typeOfLaw',
        'name' : 'Type of Law',
        'value' : 'typeOfLaw',
        'type': 'name',
    },
    {
        'key' : 'dataSource',
        'name' : 'Data Source',
        'value' : 'dataSource',
        'type': 'name',
    },
    {
        'key' : 'recordNumber',
        'name' : 'Record Number',
        'value' : 'recordNumber',
        'type': 'name',
    },
    {
        'key' : 'implementingMea',
        'name' : 'Implementing MEA',
        'value' : 'implementingMea',
        'type': 'number',
    },
    {
        'key' : 'firstPublicationDate',
        'name' : 'First Publication Date',
        'value' : 'firstPublicationDate',
        'type': 'date',
    },
    {
        'key' : 'latestAmendmentDate',
        'name' : 'Last Amendment Date',
        'value' : 'latestAmendmentDate',
        'type': 'date',
    },
    {
        'key' : 'languages',
        'name' : 'Languages',
        'value' : 'isoCode',
        'type': 'array',
    },
    {
        'key' : 'tags',
        'name' : 'Tags',
        'value' : 'join',
        'type': 'array',
    },
];

const detailProject = [
    {
        'key' : 'geoCoverageType',
        'name' : 'Geo-Coverage',
        'value' : 'geoCoverageType',
        'type': 'text',
    },
    {
        'key' : 'geoCoverageValues',
        'name' : 'Country',
        'value' : 'countries',
        'type': 'array',
    },
    {
        'key' : 'funds',
        'name' : 'Amount Invested',
        'value' : 'funds',
        'type': 'currency',
    },
    {
        'key' : 'contribution',
        'name' : 'In Kind Contributions:',
        'value' : 'contribution',
        'type': 'currency',
    },
    {
        'key' : 'funding',
        'name' : 'Funding Type',
        'value' : 'custom',
        'customValue': 'types',
        'type': 'array',
    },
    {
        'key' : 'funding',
        'name' : 'Funding Name',
        'value' : 'custom',
        'customValue': 'name',
        'type': 'object',
    },
    {
        'key' : 'focusArea',
        'name' : 'Focus Area:',
        'value' : 'join',
        'type': 'array',
    },
    {
        'key' : 'firstPublicationDate',
        'name' : 'Lifecycle Phase',
        'value' : 'firstPublicationDate',
        'type': 'date',
    },
    {
        'key' : 'lifecyclePhase',
        'name' : 'Last Amendment Date',
        'value' : 'join',
        'type': 'array',
    },
    {
        'key' : 'sector',
        'name' : 'Sector',
        'value' : 'join',
        'type': 'array',
    },
    {
        'key' : 'activityOwner',
        'name' : 'Activity Owner',
        'value' : 'custom',
        'customValue': 'children',
        'type': 'haveChild',
    },
    {
        'key' : 'entity',
        'name' : 'Entity Type',
        'value' : 'entity',
        'type': 'array',
    },
    {
        'key' : 'activityTerm',
        'name' : 'Activity Term',
        'value' : 'activityTerm',
        'type': 'name',
    },
];

const detailStakeholder = [
    {
        'key' : 'country',
        'name' : 'Country',
        'value' : 'country',
        'type': 'country',
    },
    {
        'key' : 'geoCoverageType',
        'name' : 'Geo-Coverage',
        'value' : 'geoCoverageType',
        'type': 'text',
    },
    {
        'key' : 'geoCoverageValues',
        'name' : 'Geo-Coverage Country',
        'value' : 'countries',
        'type': 'array',
    },
    {
        'key' : 'representation',
        'name' : 'Representation',
        'value' : 'representation',
        'type': 'name',
    },
    {
        'key' : 'linkedIn',
        'name' : 'Linked In',
        'value' : 'linkedIn',
        'type': 'name',
    },
    {
        'key' : 'twitter',
        'name' : 'Twitter',
        'value' : 'twitter',
        'type': 'name',
    },
    {
        'key' : 'tags',
        'name' : 'Tags',
        'value' : 'join',
        'type': 'array',
    },
];

const detailOrganisation = [
    {
        'key' : 'type',
        'name' : 'Organisation Type',
        'value' : 'type',
        'type': 'name',
    },
    {
        'key' : 'areaOfExpertise',
        'name' : 'Area of Expertise',
        'value' : 'areaOfExpertise',
        'type': 'name',
    },
    {
        'key' : 'projectRelatedToMarineLitter',
        'name' : 'Programs and Projects Related to Marine Litter',
        'value' : 'projectRelatedToMarineLitter',
        'type': 'name',
    },
    {
        'key' : 'areaTheApplicantWillContributeTo',
        'name' : 'Area Applicant Will Contribute To',
        'value' : 'areaTheApplicantWillContributeTo',
        'type': 'name',
    },
    {
        'key' : 'url',
        'name' : 'Website',
        'value' : 'url',
        'type': 'link',
    },
    {
        'key' : 'geoCoverageType',
        'name' : 'Geo-Coverage',
        'value' : 'geoCoverageType',
        'type': 'text',
    },
    {
        'key' : 'geoCoverageValues',
        'name' : 'Country',
        'value' : 'countries',
        'type': 'array',
    },
    {
        'key' : null,
        'name' : 'GPML Member',
        'value' : 'Yes',
        'type': 'static',
    },
];

export const detailMaps = {
    'action_plan' : detailActionPlan,
    'technical_resource' : detailActionPlan,
    'financing_resource' : detailFinancingResource,
    'event' : detailEvent,
    'technology' : detailTechnology,
    'policy' : detailPolicy,
    'project' : detailProject,
    'stakeholder' : detailStakeholder,
    'organisation' : detailOrganisation,
};

const description = {
    'key' : 'summary',
    'name' : 'Description'
}

const eventDescription = {
    'key' : 'description',
    'name' : 'Description'
}

const technologyDescription = {
    'key' : 'remarks',
    'name' : 'Description'
}

const policyDescription = {
    'key' : 'abstract',
    'name' : 'Abstract'
}

const stakeholderDescription = {
    'key' : 'about',
    'name' : 'About'
}

export const descriptionMaps = {
    'project' : description,
    'action_plan' : description,
    'technical_resource' : description,
    'financing_resource' : description,
    'event' : eventDescription,
    'technology' : technologyDescription,
    'policy' : policyDescription,
    'stakeholder' : stakeholderDescription,
}

export const infoMaps = {
    'project' : [
        {
            'key' : 'infoResourceLinks',
            'name' : 'Resource Link' ,
            'value' : 'link',
            'type' : 'array',
        }
    ],
    'event' : [
        {
            'key' : 'url',
            'name' : 'Link' ,
            'value' : 'url',
            'type' : 'link',
        }
    ],
    'technology' : [
        {
            'key' : 'email',
            'name' : 'Email' ,
            'value' : 'email',
            'type' : 'name',
        },
        {
            'key' : 'url',
            'name' : 'Resource Link',
            'value' : 'url',
            'type' : 'link',
        }
    ],
    'policy' : [
        {
            'key' : 'attachments',
            'name' : 'Other Links' ,
            'value' : 'link',
            'type' : 'array',
        },
        {
            'key' : 'url',
            'name' : 'Policy Link' ,
            'value' : 'url',
            'type' : 'link',
        }
    ],
}