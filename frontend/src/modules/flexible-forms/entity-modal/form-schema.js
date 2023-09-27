import { UIStore } from '../../../store'

const {
  geoCoverageTypeOptions,
  representativeGroup,
  countries,
} = UIStore.currentState

export const schema = {
  title: '',
  type: 'object',
  required: [
    'name',
    'url',
    'country',
    'type',
    'geoCoverageType',
    'geoCoverageValueRegional',
    'geoCoverageValueTransnational',
    'geoCoverageCountries',
    'geoCoverageValueGlobalSpesific',
  ],
  properties: {
    name: {
      title: 'Name',
      type: 'string',
    },
    type: {
      title: 'Type of the entity',
      enum: representativeGroup?.map((x) => x.name),
      enumNames: representativeGroup?.map((x) => x.name),
    },
    url: {
      title: 'Entity URL',
      type: 'string',
      format: 'url',
    },
    country: {
      title: 'Country',
      enum: countries?.map((x, i) => x.id),
      enumNames: countries?.map((x, i) => x.name),
    },
    geoCoverageType: {
      title: 'Geo coverage type',
      enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
      enumNames: geoCoverageTypeOptions,
    },
    geoCoverageValueRegional: {
      title: 'Geo coverage',
      enum: [],
      depend: {
        id: 'geoCoverageType',
        value: ['regional'],
      },
    },
    geoCoverageValueTransnational: {
      title: 'Geo coverage',
      enum: [],
      depend: {
        id: 'geoCoverageType',
        value: ['transnational'],
      },
    },
    geoCoverageCountries: {
      title: 'Geo coverage country',
      enum: [],
      depend: {
        id: 'geoCoverageType',
        value: ['transnational', 'national'],
      },
    },
    geoCoverageValueGlobalSpesific: {
      title: 'Geo coverage',
      enum: [],
      depend: {
        id: 'geoCoverageType',
        value: ['global with elements in specific areas'],
      },
    },
  },
}

export const uiSchema = {
  'ui:group': 'border',
  name: {
    'ui:placeholder': 'Type in the entity name',
    'ui:size': 'small',
  },
  type: {
    'ui:placeholder': 'Choose the entity type',
    'ui:widget': 'select',
    'ui:options': {
      size: 'small',
    },
  },
  country: {
    'ui:showSearch': true,
    'ui:widget': 'select',
    'ui:placeholder': 'Choose the entity country',
    'ui:options': {
      type: 'single',
      size: 'small',
      icon: true,
    },
  },
  url: {
    'ui:placeholder': 'URL Address (e.g. example.com)',
    'ui:widget': 'uri',
    'ui:addOnBefore': 'https://',
  },
  geoCoverageType: {
    'ui:placeholder': 'Choose the entity coverage type',
    'ui:widget': 'select',
    'ui:options': {
      type: 'single',
      size: 'small',
    },
  },
  geoCoverageValueRegional: {
    'ui:placeholder': 'Choose the entity coverage',
    'ui:widget': 'select',
    'ui:showSearch': true,
    'ui:mode': 'multiple',
  },
  geoCoverageValueTransnational: {
    'ui:placeholder': 'Choose the entity coverage',
    'ui:widget': 'select',
    'ui:showSearch': true,
    'ui:mode': 'multiple',
    'ui:options': {
      type: 'connection',
      size: 'small',
    },
  },
  geoCoverageCountries: {
    'ui:placeholder': 'Choose country',
    'ui:widget': 'select',
    'ui:showSearch': true,
    'ui:mode': 'multiple',
    'ui:options': {
      type: 'connection',
      size: 'small',
    },
  },
  geoCoverageValueSubNational: {
    'ui:placeholder': 'Choose the entity coverage',
    'ui:widget': 'select',
    'ui:showSearch': true,
    'ui:options': {
      size: 'small',
    },
  },
  geoCoverageValueGlobalSpesific: {
    'ui:placeholder': 'Choose the entity coverage',
    'ui:widget': 'select',
    'ui:showSearch': true,
    'ui:mode': 'multiple',
  },
}
