import { UIStore } from '../../../store'
import { t } from '@lingui/macro'

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
      title: t`Name`,
      type: 'string',
    },
    type: {
      title: t`Type of the entity`,
      enum: representativeGroup?.map((x) => x.name),
      enumNames: representativeGroup?.map((x) => x.name),
    },
    url: {
      title: t`Entity URL`,
      type: 'string',
      format: 'url',
    },
    country: {
      title: t`Country`,
      enum: countries?.map((x, i) => x.id),
      enumNames: countries?.map((x, i) => x.name),
    },
    geoCoverageType: {
      title: t`Geo coverage type`,
      enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
      enumNames: geoCoverageTypeOptions,
    },
    geoCoverageValueRegional: {
      title: t`Geo coverage`,
      enum: [],
      depend: {
        id: 'geoCoverageType',
        value: ['regional'],
      },
    },
    geoCoverageValueTransnational: {
      title: t`Geo coverage`,
      enum: [],
      depend: {
        id: 'geoCoverageType',
        value: ['transnational'],
      },
    },
    geoCoverageCountries: {
      title: t`Geo coverage country`,
      enum: [],
      depend: {
        id: 'geoCoverageType',
        value: ['transnational', 'national'],
      },
    },
    geoCoverageValueGlobalSpesific: {
      title: t`Geo coverage`,
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
    'ui:placeholder': t`Type in the entity name`,
    'ui:size': 'small',
  },
  type: {
    'ui:placeholder': t`Choose the entity type`,
    'ui:widget': 'select',
    'ui:options': {
      size: 'small',
      icon: true,
    },
  },
  country: {
    'ui:showSearch': true,
    'ui:widget': 'select',
    'ui:placeholder': t`Choose the entity country`,
    'ui:options': {
      type: 'single',
      size: 'small',
      icon: true,
      search: true,
    },
  },
  url: {
    'ui:placeholder': t`URL Address (e.g. example.com)`,
    'ui:widget': 'uri',
    'ui:addOnBefore': 'https://',
  },
  geoCoverageType: {
    'ui:placeholder': t`Choose the entity coverage type`,
    'ui:widget': 'select',
    'ui:options': {
      type: 'single',
      size: 'small',
      icon: true,
    },
  },
  geoCoverageValueRegional: {
    'ui:placeholder': t`Choose the entity coverage`,
    'ui:widget': 'select',
    'ui:showSearch': true,
    'ui:mode': 'multiple',
  },
  geoCoverageValueTransnational: {
    'ui:placeholder': t`Choose the entity coverage`,
    'ui:widget': 'select',
    'ui:showSearch': true,
    'ui:mode': 'multiple',
    'ui:options': {
      type: 'connection',
      size: 'small',
    },
  },
  geoCoverageCountries: {
    'ui:placeholder': t`Choose country`,
    'ui:widget': 'select',
    'ui:showSearch': true,
    'ui:mode': 'multiple',
    'ui:options': {
      type: 'connection',
      size: 'small',
    },
  },
  geoCoverageValueSubNational: {
    'ui:placeholder': t`Choose the entity coverage`,
    'ui:widget': 'select',
    'ui:showSearch': true,
    'ui:options': {
      size: 'small',
    },
  },
  geoCoverageValueGlobalSpesific: {
    'ui:placeholder': t`Choose the entity coverage`,
    'ui:widget': 'select',
    'ui:showSearch': true,
    'ui:mode': 'multiple',
  },
}
