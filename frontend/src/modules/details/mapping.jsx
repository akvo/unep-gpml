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
        'key' : 'organisation',
        'name' : 'Organisation',
        'value' : 'organisation',
        'type': 'name',
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
    {
        'key' : 'url',
        'name' : 'Link',
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
        'key' : 'country',
        'name' : 'Headquarters',
        'value' : 'country',
        'type': 'name',
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
    // {
    //     'key' : 'geoCoverageValues',
    //     'name' : 'Country',
    //     'value' : 'countries',
    //     'type': 'array',
    // },
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
        'key' : 'latestAmandmentDate',
        'name' : 'Last Amendment Date',
        'value' : 'latestAmandmentDate',
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
    // Original Title: Column C
    //  Abstract: Column F
    //  Policy Link: Column G
    //  Other Links: Column Q
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
        'key' : 'status',
        'name' : 'Status',
        'value' : 'status',
        'type': 'text',
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
    // 'stakeholder' : detailStakeholder,
};

const description = {
    'key' : 'summary',
    'name' : 'Description'
}

const eventDescription = {
    'key' : 'description',
    'name' : 'Description'
}

const policyDescription = {
    'key' : 'abstract',
    'name' : 'Abstract'
}

export const descriptionMaps = {
    'project' : description,
    'action_plan' : description,
    'technical_resource' : description,
    'financing_resource' : description,
    'event' : eventDescription,
    //technology
    'policy' : policyDescription,
    // 'stakeholder' : description,
}

export const infoMaps = {
    'project' : [
        {
            'key' : 'infoResourceLinks',
            'name' : 'Resource Link' ,
            'value' : 'link',
            'type' : 'array',
        }
    ]
}