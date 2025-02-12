import { useLingui } from '@lingui/react'
import { UIStore } from '../../../store'
import { t, msg } from '@lingui/macro'

export const useSchema = ({
  geoCoverageTypeOptions,
  representativeGroup,
  countries,
}) => {
  const { i18n } = useLingui()

  const schema = {
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
        title: i18n._(t`Name`),
        type: 'string',
      },
      type: {
        title: i18n._(t`Type of the entity`),
        enum: representativeGroup?.map((x) => x.name),
        enumNames: representativeGroup?.map((x) => x.name),
      },
      url: {
        title: i18n._(t`Entity URL`),
        type: 'string',
        format: 'url',
      },
      country: {
        title: i18n._(t`Country`),
        enum: countries?.map((x, i) => x.id),
        enumNames: countries?.map((x, i) => x.name),
      },
      geoCoverageType: {
        title: i18n._(t`Geo coverage type`),
        enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
        enumNames: geoCoverageTypeOptions,
      },
      geoCoverageValueRegional: {
        title: i18n._(t`Geo coverage`),
        enum: [],
        depend: {
          id: 'geoCoverageType',
          value: ['regional'],
        },
      },
      geoCoverageValueTransnational: {
        title: i18n._(t`Geo coverage`),
        enum: [],
        depend: {
          id: 'geoCoverageType',
          value: ['transnational'],
        },
      },
      geoCoverageCountries: {
        title: i18n._(t`Geo coverage country`),
        enum: [],
        depend: {
          id: 'geoCoverageType',
          value: ['transnational', 'national'],
        },
      },
      geoCoverageValueGlobalSpesific: {
        title: i18n._(t`Geo coverage`),
        enum: [],
        depend: {
          id: 'geoCoverageType',
          value: ['global with elements in specific areas'],
        },
      },
    },
  }
  return schema
}

export const useUiSchema = () => {
  const { i18n } = useLingui()

  const uiSchema = {
    'ui:group': 'border',
    name: {
      'ui:placeholder': i18n._(t`Type in the entity name`),
      'ui:size': 'small',
    },
    type: {
      'ui:placeholder': i18n._(t`Choose the entity type`),
      'ui:widget': 'select',
      'ui:options': {
        size: 'small',
        icon: true,
      },
    },
    country: {
      'ui:showSearch': true,
      'ui:widget': 'select',
      'ui:placeholder': i18n._(t`Choose the entity country`),
      'ui:options': {
        type: 'single',
        size: 'small',
        icon: true,
        search: true,
      },
    },
    url: {
      'ui:placeholder': i18n._(t`URL Address (e.g. example.com)`),
      'ui:widget': 'uri',
      'ui:addOnBefore': 'https://',
    },
    geoCoverageType: {
      'ui:placeholder': i18n._(t`Choose the entity coverage type`),
      'ui:widget': 'select',
      'ui:options': {
        type: 'single',
        size: 'small',
        icon: true,
      },
    },
    geoCoverageValueRegional: {
      'ui:placeholder': i18n._(t`Choose the entity coverage`),
      'ui:widget': 'select',
      'ui:showSearch': true,
      'ui:mode': 'multiple',
    },
    geoCoverageValueTransnational: {
      'ui:placeholder': i18n._(t`Choose the entity coverage`),
      'ui:widget': 'select',
      'ui:showSearch': true,
      'ui:mode': 'multiple',
      'ui:options': {
        type: 'connection',
        size: 'small',
      },
    },
    geoCoverageCountries: {
      'ui:placeholder': i18n._(t`Choose country`),
      'ui:widget': 'select',
      'ui:showSearch': true,
      'ui:mode': 'multiple',
      'ui:options': {
        type: 'connection',
        size: 'small',
      },
    },
    geoCoverageValueSubNational: {
      'ui:placeholder': i18n._(t`Choose the entity coverage`),
      'ui:widget': 'select',
      'ui:showSearch': true,
      'ui:options': {
        size: 'small',
      },
    },
    geoCoverageValueGlobalSpesific: {
      'ui:placeholder': i18n._(t`Choose the entity coverage`),
      'ui:widget': 'select',
      'ui:showSearch': true,
      'ui:mode': 'multiple',
    },
  }

  return uiSchema
}
