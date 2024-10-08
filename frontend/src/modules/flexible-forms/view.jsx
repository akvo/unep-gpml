/* eslint-disable react-hooks/exhaustive-deps */
import { UIStore } from '../../store'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  Row,
  Col,
  Switch,
  Radio,
  Popover,
  Steps,
  List,
  Dropdown,
  Space,
  Collapse,
  Form,
  Tooltip,
} from 'antd'
const { Panel } = Collapse
import {
  LeftOutlined,
  RightOutlined,
  LoadingOutlined,
  EditOutlined,
  CheckOutlined,
  DownOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import StickyBox from 'react-sticky-box'
import styles from './style.module.scss'
import common from './common'
import FlexibleForm from './form'
import isEmpty from 'lodash/isEmpty'
import api from '../../utils/api'
import { useQuery } from '../../utils/misc'
import moment from 'moment'
const { Step } = Steps
import dynamic from 'next/dynamic'
const RichTextEditor = dynamic(() => import('react-rte'), { ssr: false })
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Trans } from '@lingui/macro'
import Button from '../../components/button'
import { InfoIcon, LongArrowRight } from '../../components/icons'
import { i18n } from '@lingui/core'
import { useSchema } from './form-schema'

export const getTypeByResource = (type) => {
  let t = ''
  let name = ''
  let translations = ''
  switch (type) {
    case 'action_plan':
      t = 'action'
      name = 'Action Plan'
      translations = 'resource'
      break
    case 'data_catalog':
      t = 'data_catalog'
      name = 'Data Catalog'
      translations = 'resource'
      break
    case 'event':
      t = 'event_flexible'
      name = 'Event'
      translations = 'event'
      break
    case 'initiative':
      t = 'initiative'
      name = 'Initiative'
      translations = 'initiative'
      break
    case 'policy':
      t = 'policy'
      name = 'Policy'
      translations = 'policy'
      break
    case 'financing_resource':
      t = 'financing'
      name = 'Financing Resource'
      translations = 'resource'
      break
    case 'technical_resource':
      t = 'technical'
      name = 'Technical Resource'
      translations = 'resource'
      break
    case 'case_study':
      t = 'case_study'
      name = 'Case Study'
      translations = 'resource'
      break
    case 'technology':
      t = 'technology'
      name = 'Technology'
      translations = 'technology'
      break
  }
  return { type: t, name: name, translations: translations }
}

export const languageOptions = [
  {
    label: 'Arabic',
    key: '0',
    value: 'ar',
    dbValue: 'ar',
  },
  {
    label: 'Chinese',
    key: '1',
    value: 'cn',
    dbValue: 'zh',
  },
  {
    label: 'French',
    key: '3',
    value: 'fr',
    dbValue: 'fr',
  },
  {
    label: 'Russian',
    key: '4',
    value: 'ru',
    dbValue: 'ru',
  },
  {
    label: 'Spanish',
    key: '5',
    value: 'es',
    dbValue: 'es',
  },
  {
    label: 'English',
    key: '6',
    value: 'en',
    dbValue: 'en',
  },
]

const toolbarConfig = {
  // Optionally specify the groups to display (displayed in the order listed).
  display: [
    'INLINE_STYLE_BUTTONS',
    'BLOCK_TYPE_BUTTONS',
    'LINK_BUTTONS',
    'BLOCK_TYPE_DROPDOWN',
    'HISTORY_BUTTONS',
  ],
  INLINE_STYLE_BUTTONS: [
    { label: 'Bold', style: 'BOLD', className: 'custom-css-class' },
    { label: 'Italic', style: 'ITALIC' },
    { label: 'Underline', style: 'UNDERLINE' },
    { label: 'Code', style: 'CODE' },
  ],
  BLOCK_TYPE_DROPDOWN: [
    { label: 'Normal', style: 'unstyled' },
    { label: 'Heading Large', style: 'header-one' },
    { label: 'Heading Medium', style: 'header-two' },
    { label: 'Heading Small', style: 'header-three' },
  ],
  BLOCK_TYPE_BUTTONS: [
    { label: 'UL', style: 'unordered-list-item' },
    { label: 'OL', style: 'ordered-list-item' },
  ],
}

const FlexibleForms = ({
  isAuthenticated,
  setLoginVisible,
  loadingProfile,
  id,
  type,
  ...props
}) => {
  const {
    tabs,
    getSchema,
    initialData,
    initialFormData,
    initialDataEdit,
    formDataMapping,
    getTranslationForm,
    prevFormData,
  } = common

  const schema = useSchema()

  const query = useQuery()

  const caseStudy = {
    code: 'case_study',
    name: 'Case Study',
    examples: [],
    childs: [],
    desc: '',
  }

  const storeData = UIStore.useState((s) => ({
    stakeholders: s.stakeholders?.stakeholders,
    countries: s.countries,
    tags: s.tags,
    regionOptions: s.regionOptions,
    transnationalOptions: [
      ...s.transnationalOptions,
      { id: -1, type: 'transnational', name: 'Other', countries: [] },
    ],
    sectorOptions: s.sectorOptions,
    organisationType: s.organisationType,
    representativeGroup: s.representativeGroup,
    mainContentType: s.mainContentType,
    meaOptions: s.meaOptions,
    nonMemberOrganisations: s.nonMemberOrganisations,
    organisations: s.organisations,
    profile: s.profile,
    formStep: s.formStep,
    formEdit: s.formEdit,
    selectedMainContentType: s.selectedMainContentType,
    currencies: s.currencies,
    relatedResource: s.relatedResource,
  }))

  const {
    stakeholders,
    countries,
    tags,
    regionOptions,
    transnationalOptions,
    sectorOptions,
    organisationType,
    representativeGroup,
    mainContentType,
    meaOptions,
    organisations,
    formEdit,
    profile,
    selectedMainContentType,
  } = storeData

  const tabsData = tabs
  const router = useRouter()
  const { pathname, query: state } = router

  const formData = initialFormData.useState()
  const { editId, data } = formData
  const { status } = formEdit.flexible
  const btnSubmit = useRef()
  const [displayModal, setDisplayModal] = useState(false)
  const [sending, setSending] = useState(false)
  const [highlight, setHighlight] = useState(false)
  const [capacityBuilding, setCapacityBuilding] = useState(false)
  const [mainType, setMainType] = useState('initiative')
  const [label, setLabel] = useState('Initiative')
  const [subType, setSubType] = useState('')
  const [subContentType, setSubContentType] = useState([])
  const [languages, setLanguages] = useState([])
  const [translations, setTranslations] = useState([])
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const [disabledBtn, setDisabledBtn] = useState({
    disabled: true,
    type: 'default',
  })
  const [value, setValue] = useState()
  const [formSchema, setFormSchema] = useState({
    schema: schema[selectedMainContentType],
  })

  const [form] = Form.useForm()

  const isLoaded = useCallback(() => {
    return Boolean(
      !isEmpty(countries) &&
        !isEmpty(tags) &&
        !isEmpty(profile) &&
        !isEmpty(regionOptions) &&
        !isEmpty(transnationalOptions) &&
        !isEmpty(organisations) &&
        !isEmpty(sectorOptions) &&
        !isEmpty(organisationType) &&
        !isEmpty(meaOptions) &&
        !isEmpty(stakeholders) &&
        !isEmpty(representativeGroup)
    )
  }, [
    countries,
    tags,
    profile,
    regionOptions,
    transnationalOptions,
    sectorOptions,
    organisations,
    organisationType,
    meaOptions,
    stakeholders,
    representativeGroup,
  ])

  useEffect(() => {
    const importModule = async () => {
      const module = await import('react-rte')
      setValue(module.createEmptyValue())
    }
    importModule()
  }, [])

  useEffect(() => {
    if (state && state?.type && status !== 'edit') {
      setMainType(state?.type)
      setLabel(state?.label)
    }
  }, [state])

  useEffect(() => {
    if (!isAuthenticated && !loadingProfile) {
      setLoginVisible(true)
    } else if (!loadingProfile) {
      setLoginVisible(false)
    }
  }, [isAuthenticated, loadingProfile])

  useEffect(() => {
    if (profile && profile.role === 'ADMIN') {
      UIStore.update((e) => {
        const findCaseStudy = mainContentType.find(
          (item) => item.code === 'case_study'
        )
        if (!findCaseStudy) {
          e.mainContentType = [...e.mainContentType, caseStudy]
        }
      })
    }
  }, [profile])

  const getRevertValue = (type, value, name) => {
    let res = value
    const isObject = typeof value === 'object'
    const isArray = Array.isArray(value)
    if (type === 'number') {
      res = Number(value)
    }
    if (type === 'option' && isObject && !isArray) {
      res = Object.keys(value)[0]
      // case for geocoveragetype
      if (name === 'q24') {
        res =
          Object.values(value)?.[0] === 'Subnational'
            ? 'sub-national'
            : Object.values(value)?.[0]?.toLowerCase()
      }
      res = isNaN(Number(res)) ? res : Number(res)
      // case for currency code
      if (name === 'q36_1' || name === 'q37_1') {
        res = res.split('_').join('')
        res = String(res).toUpperCase()
      }
    }
    if (name === 'tags') {
      res = value ? value.map((x) => x.tag) : ''
    }

    if (name === 'infoDocs' || name === 'info_docs') {
      res = value ? value : ''
    }

    if (name === 'relatedContent' || name === 'related_content') {
      if (value && value.length > 0) {
        UIStore.update((e) => {
          e.relatedResource = value
        })
      }
      res =
        value && value.length > 0 && value[0].id !== null
          ? {
              id: value.map((x) => x.id),
              type: value.map((x) => ({
                value: x.id,
                key: x.id + '-' + x.type,
                label: x.type,
                children: x.title,
              })),
            }
          : ''
    }

    if (name === 'stakeholderConnections') {
      res =
        value.length > 0
          ? value.map((x) => ({
              role: x.role,
              stakeholder: x.stakeholderId,
              id: x.id,
            }))
          : [{}]
    }
    if (name === 'stakeholder_connections') {
      res =
        value.length > 0
          ? value.map((x) => ({
              role: x.role,
              stakeholder: x.stakeholder_id,
              id: x.id,
            }))
          : [{}]
    }

    if (name === 'entityConnections') {
      res =
        value.length > 0
          ? value.map((x) => ({ role: x.role, entity: x.entityId, id: x.id }))
          : [{}]
    }
    if (name === 'entity_connections') {
      res =
        value.length > 0
          ? value.map((x) => ({ role: x.role, entity: x.entity_id, id: x.id }))
          : [{}]
    }

    if (type === 'date') {
      if (name === 'validTo' || name === 'firstPublicationDate') {
        res =
          !value || value === 'Ongoing'
            ? ''
            : moment(value).format('YYYY-MM-DD')
      } else {
        res = value
          ? moment(value).isValid()
            ? moment(value).format('YYYY-MM-DD')
            : ''
          : ''
      }
    }

    if (name === 'publishYear') {
      res = moment(value, 'YYYY').format('YYYY-MM-DD')
    }

    if (type === 'integer') {
      res =
        value !== 'Not  Specified' && value !== 'Not Specified'
          ? parseInt(value)
          : value
    }

    if (type === 'year') {
      res = String(value)
    }

    if (name === 'implementingMea') {
      const mea = meaOptions.find(
        (x) => x.name.toLowerCase() === value.toLowerCase()
      )
      res = mea ? mea.id : null
    }

    // Geo Transnational handle
    // case for transnational geo value

    if (type === 'option' && isArray && name === 'q24_4') {
      const transnationalValue = isArray
        ? value.map((item) => {
            const enumKey = Object.keys(item)[0]
            return enumKey
          })
        : Object.keys(value)
      res = transnationalValue.map((x) => x)
    }
    if (type === 'option' && isArray && name === 'q24_2') {
      const transnationalValue = isArray
        ? value.map((item) => {
            const enumKey = Object.keys(item)[0]
            return enumKey
          })
        : Object.keys(value)
      res = transnationalValue.map((x) => x)
    }
    if (type === 'option' && isArray && name === 'q24_3') {
      const transnationalValue = isArray
        ? value.map((item) => {
            const enumKey = Object.keys(item)[0]
            return enumKey
          })
        : Object.keys(value)
      res = transnationalValue.map((x) => x)
    }
    // EOL Geo Transnational handle

    if (type === 'multiple-option' && isObject && isArray) {
      res = value.map((item) => {
        const enumKey = typeof item === 'object' ? Object.keys(item)?.[0] : item
        return enumKey
      })
    }
    if (type === 'item-array' && isObject && isArray) {
      res = value
    }
    return res
  }

  const revertFormData = (data) => {
    let formData = initialDataEdit
    formDataMapping.forEach((item) => {
      const { name, section, group, question, type } = item
      const value = data?.[name]
      if (!group && value && value !== 'Ongoing') {
        formData = {
          ...formData,
          [section]: {
            ...formData[section],
            [question]: getRevertValue(type, value, name),
          },
        }
      }
      if (group && value && value !== 'Ongoing') {
        formData = {
          ...formData,
          [section]: {
            ...formData[section],
            [group]: {
              ...formData[section][group],
              [question]: getRevertValue(type, value, name),
            },
          },
        }
      }
    })
    return formData
  }

  useEffect(() => {
    if (type) {
      handleOnTabChange('S3')
    }
  }, [type])

  useEffect(() => {
    if (status === 'edit' || id) {
      const type = type ? type : query.slug[0]?.replace('-', '_')
      const dataId = Number(id)
      setMainType(getTypeByResource(type).type)
      setLabel(getTypeByResource(type).name)
      setFormSchema({
        schema: schema[getTypeByResource(type).type],
      })
      UIStore.update((event) => {
        event.selectedMainContentType = getTypeByResource(type).type
      })
      api
        .get(
          `/translations/${
            getTypeByResource(type?.replace('-', '_')).translations
          }/${id}`
        )
        .then((resp) => {
          setLanguages(Object.keys(resp?.data?.title))
          let editTranslations = []
          let infoValue = []
          Object.keys(resp?.data).map((key) => {
            Object.keys(resp?.data[key]).map((item) => {
              if (key === 'infoDocs') {
                infoValue.push({
                  lang: item,
                  // value: RichTextEditor.createValueFromString(
                  //   resp?.data[key][item],
                  //   "html"
                  // ),
                })
              }
              if (key !== 'infoDocs')
                editTranslations.push({
                  language: item,
                  value: resp?.data[key][item],
                  translatable_field: key,
                })
            })
          })
          setTranslations(editTranslations)
          setValue(infoValue)
        })
        .catch((e) => console.log(e))

      if (type === 'initiative') {
        api.getRaw(`/initiative/${dataId}`).then((d) => {
          let data = JSON.parse(d.data)
          setSubType(data.sub_content_type)
          if (JSON.parse(d?.data).q24.hasOwnProperty('transnational')) {
            data = {
              ...data,
              q24_3: data.q24_2,
              q24_2: null,
            }
          }
          initialFormData.update((e) => {
            e.data = revertFormData(data)
            e.editId = true
            e.type = 'initiative'
          })
          prevFormData.update((e) => {
            e.data = revertFormData(data)
            e.editId = true
            e.type = 'initiative'
          })
          setSubType(data.sub_content_type)
        })
      } else {
        api.get(`/detail/${type}/${dataId}`).then((d) => {
          setSubType(d?.subContentType)
          let newData = []
          if (d.data.organisations) {
            newData = d.data.organisations.map((item) => {
              return {
                role: 'owner',
                entityId: item.id,
              }
            })
          }
          d.data = {
            ...d.data,
            url:
              d.data.languages && d.data.languages?.length > 0
                ? d.data.languages[0].url
                : d.data.url,
            entityConnections: [...d.data.entityConnections, ...newData],
          }

          initialFormData.update((e) => {
            e.data = revertFormData(d.data)
            e.editId = true
            e.type = type
          })
          prevFormData.update((e) => {
            e.data = revertFormData(d.data)
            e.editId = true
            e.type = type
          })
          setSubType(d?.data.subContentType)
        })
      }
    }
  }, [status, initialFormData])

  // useEffect(() => {
  //   UIStore.update((e) => {
  //     e.disclaimer = null;
  //     e.formEdit = {
  //       ...e.formEdit,
  //       flexible: {
  //         status: "add",
  //         id: null,
  //       },
  //     };
  //   });
  // }, [props]);

  useEffect(() => {
    const search = mainContentType.find((element) => element.code === mainType)
      ?.childs
    setSubContentType(search)
  }, [mainContentType, mainType])

  useEffect(() => {
    UIStore.update((e) => {
      e.highlight = highlight
    })
    setFormSchema({ schema: schema[selectedMainContentType] })
  }, [highlight, selectedMainContentType])

  useEffect(() => {
    if (isLoaded()) {
      setFormSchema(getSchema({ ...storeData, schema }))
    }
  }, [
    initialFormData,
    getSchema,
    initialData,
    storeData,
    id,
    data,
    editId,
    isLoaded,
    profile,
  ])

  useEffect(() => {
    if (isLoaded()) {
      if (subType) {
        let obj = mainContentType.find(
          (o) => o.code === selectedMainContentType
        )
        let array = Object.keys(tags)
          .map((k) => tags[k])
          .flat()
        let find = obj?.childs.find((o) => o.id === subType)?.tags
        if (find) {
          let res = array.filter((item) => find.includes(item.tag))
          let newArray = find
          res.map((item) => {
            if (find.includes(item.tag)) {
              newArray = newArray.filter((x) => x !== item.tag)
              newArray = [
                ...newArray,
                item.tag,
                ...(formData?.data?.S4?.S4_G3?.tags
                  ? formData?.data?.S4?.S4_G3?.tags
                  : []),
              ]
            }
          })
          initialFormData.update((e) => {
            e.data = {
              ...e.data,
              S4: {
                ...e.data.S4,
                S4_G3: {
                  ...e.data.S4.S4_G3,
                  tags: [...new Set(newArray)],
                },
              },
            }
          })
        }
      }
    }
  }, [initialFormData, isLoaded, subType])

  const renderSteps = (parentTitle, section, steps, index) => {
    const totalRequiredFields = data?.required?.[section]?.length || 0
    const customTitle = (status) => {
      const color = totalRequiredFields === 0 ? '#fff' : '#255B87'
      const background = totalRequiredFields === 0 ? '#1CA585' : '#fff'
      const display =
        status === 'active'
          ? 'unset'
          : totalRequiredFields === 0
          ? 'unset'
          : 'inline'
      return (
        <div className="custom-step-title">
          <span>
            <Trans id={parentTitle.id} />
          </span>
          {section === 'S4' ? (
            <Button
              type="ghost"
              size="small"
              shape="circle"
              icon={
                totalRequiredFields === 0 &&
                ((data?.S4?.S4_G5.individual?.length > 0 &&
                  data?.S4?.S4_G5.individual[0].hasOwnProperty('role')) ||
                  (data?.S4?.S4_G5.entity?.length > 0 &&
                    data?.S4?.S4_G5.entity[0].hasOwnProperty('role'))) ? (
                  <CheckOutlined />
                ) : (
                  <EditOutlined />
                )
              }
              style={{
                right: '0',
                position: 'absolute',
                color: color,
                borderColor: '#1CA585',
                backgroundColor: background,
                display: display,
              }}
            />
          ) : (
            <Button
              type="ghost"
              size="small"
              shape="circle"
              icon={
                totalRequiredFields === 0 ? <CheckOutlined /> : <EditOutlined />
              }
              style={{
                right: '0',
                position: 'absolute',
                color: color,
                borderColor: '#1CA585',
                backgroundColor: background,
                display: display,
              }}
            />
          )}
        </div>
      )
    }
    const customIcon = () => {
      index += 1
      return (
        <Button className="custom-step-icon" shape="circle">
          {index}
        </Button>
      )
    }
    if (section !== data.tabs[0]) {
      return (
        <Step
          key={section}
          title={customTitle('waiting')}
          className={
            totalRequiredFields === 0
              ? 'step-section step-section-finish'
              : 'step-section'
          }
          status={totalRequiredFields === 0 ? 'finish' : 'wait'}
          icon={customIcon('waiting')}
        />
      )
    }

    const childs = steps.map(({ group, key, title, desc }) => {
      const requiredFields = data?.[section]?.required?.[group]?.length || 0
      const customChildTitle = (status) => {
        const color = requiredFields === 0 ? '#255B87' : '#fff'
        const background = requiredFields === 0 ? '#fff' : '#fff'
        const display =
          status === 'active'
            ? 'unset'
            : requiredFields === 0
            ? 'unset'
            : 'none'
        return (
          <div className="custom-child-title">
            <span>
              <Trans id={title.id} />
            </span>
            {group === 'S4_G5' ? (
              <Button
                type="ghost"
                size="small"
                shape="circle"
                icon={
                  data?.[section]?.S4_G5.individual.length > 0 &&
                  (data?.[section]?.S4_G5.individual[0].hasOwnProperty(
                    'role'
                  ) ||
                    data?.[section]?.S4_G5?.entity[0]?.hasOwnProperty(
                      'role'
                    )) ? (
                    <CheckOutlined />
                  ) : (
                    <EditOutlined />
                  )
                }
                style={{
                  right: '0',
                  position: 'absolute',
                  color:
                    data?.[section]?.S4_G5?.individual &&
                    (data?.[section]?.S4_G5?.individual[0]?.hasOwnProperty(
                      'role'
                    ) ||
                      data?.[section]?.S4_G5?.entity[0]?.hasOwnProperty('role'))
                      ? '#020a5b'
                      : '#fff',
                  borderColor: '#020a5b',
                  backgroundColor: background,
                  display: display,
                }}
              />
            ) : (
              <Button
                type="ghost"
                size="small"
                shape="circle"
                icon={
                  requiredFields === 0 ? <CheckOutlined /> : <EditOutlined />
                }
                style={{
                  right: '0',
                  position: 'absolute',
                  color: color,
                  borderColor: '#020a5b',
                  backgroundColor: background,
                  display: display,
                }}
              />
            )}
          </div>
        )
      }
      return (
        <Step
          key={section + key}
          title={customChildTitle('active')}
          className={'child-item'}
          status={requiredFields === 0 ? 'finish' : 'process'}
        />
      )
    })
    return [
      <Step
        key={section}
        title={customTitle('active')}
        className={
          totalRequiredFields === 0
            ? 'step-section step-section-finish parent-item'
            : 'step-section parent-item'
        }
        status={totalRequiredFields === 0 ? 'finish' : 'process'}
        icon={customIcon('active')}
      />,
      ...childs,
    ]
  }

  const handleOnTabChange = (key) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const tabActive = tabsData.filter((x) => x.key === key)
    initialFormData.update((e) => {
      e.data = {
        ...e.data,
        tabs: [key],
        steps: tabActive[0].steps,
      }
    })
  }

  const handleOnStepClick = (current, section) => {
    initialFormData.update((e) => {
      e.data = {
        ...e.data,
        [section]: {
          ...e.data[section],
          steps: current,
        },
      }
    })
  }

  const getTabStepIndex = () => {
    const section = data.tabs[0]
    const stepIndex = data[section].steps
    const tabIndex = tabsData.findIndex((tab) => tab.key === section)
    const steps = tabsData[tabIndex]?.steps || []
    return { tabIndex, stepIndex, steps }
  }

  const isLastStep = () => {
    const { tabIndex } = getTabStepIndex()
    return tabsData.length === tabIndex + 1
  }

  const isFirstStep = () => {
    const { tabIndex } = getTabStepIndex()
    return tabIndex === 0
  }

  const handleOnClickBtnNext = (e) => {
    window.scrollTo(0, 0)
    const { tabIndex, stepIndex, steps } = getTabStepIndex()
    if (stepIndex < steps.length - 1) {
      // Next step, same section
      handleOnStepClick(stepIndex + 1, tabsData[tabIndex].key)
    } else if (tabIndex < tabsData.length - 1) {
      // Next section, first step
      handleOnTabChange(tabsData[tabIndex + 1].key)
    } else {
      // We shouldn't get here, since the button should be hidden
      console.error('Last step:', tabIndex, stepIndex)
    }
  }

  const handleOnClickBtnBack = (e) => {
    window.scrollTo(0, 0)
    const { tabIndex, stepIndex, steps } = getTabStepIndex()
    if (stepIndex > 0 && steps.length > 0) {
      // Prev step, same section
      handleOnStepClick(stepIndex - 1, tabsData[tabIndex].key)
    } else if (tabIndex > 0) {
      // Prev section, first step
      handleOnTabChange(tabsData[tabIndex - 1].key)
    } else {
      // We shouldn't get here, since the button should be hidden
      console.error('Last step:', tabIndex, stepIndex)
    }
  }

  const handleOnClickBtnSubmit = (e) => {
    setHighlight(true)
    btnSubmit.current.click()
  }

  const handleMainContentType = (e) => {
    setCapacityBuilding(false)
    if (e.target.value === 'capacity_building') {
      setMainType(e.target.value)
      const search = mainContentType.find(
        (element) => element.code === e.target.value
      ).childs
      setSubContentType(search)
      return
    }
    setMainType(e.target.value)
    const search = mainContentType.find(
      (element) => element.code === e.target.value
    ).childs
    setSubContentType(search)
    setLabel(
      i18n._(
        mainContentType.find((element) => element.code === e.target.value).name
      )
    )
    setFormSchema({ schema: schema[selectedMainContentType] })
    UIStore.update((event) => {
      event.selectedMainContentType = e.target.value
    })
  }

  const handleSubContentType = (e) => {
    setSubType(e)
    if (
      mainType === 'capacity_building' &&
      (e === 'Guidance Documents' ||
        e === 'Tools & toolkits' ||
        e === 'Courses & Trainings' ||
        e === 'Educational & Outreach resources' ||
        e === 'Case studies')
    ) {
      setLabel('Technical Resource')
      setFormSchema({ schema: schema['technical'] })
      setCapacityBuilding(true)
      UIStore.update((event) => {
        event.selectedMainContentType = 'technical'
      })
    }
    if (mainType === 'capacity_building' && e === 'Financing Resources') {
      setLabel('Financing Resource')
      setFormSchema({ schema: schema['financing'] })
      setCapacityBuilding(true)
      UIStore.update((event) => {
        event.selectedMainContentType = 'financing'
      })
    }
    if (mainType === 'capacity_building' && e === 'Events') {
      setLabel('Event')
      setFormSchema({ schema: schema['event_flexible'] })
      setCapacityBuilding(true)
      UIStore.update((event) => {
        event.selectedMainContentType = 'event_flexible'
      })
    }
    if (mainType === 'capacity_building' && e === 'Initiatives') {
      setLabel('Initiatives')
      setFormSchema({ schema: schema['initiative'] })
      setCapacityBuilding(true)
      UIStore.update((event) => {
        event.selectedMainContentType = 'initiative'
      })
    }
    if (mainType === 'initiative') {
      if (e === 'Working with people') {
        initialFormData.update((e) => {
          e.data = {
            ...e.data,
            S5: {
              ...e.data.S5,
              S5_G1: {
                ...e.data.S5.S5_G1,
                S5_G1_4: ['4-1'],
              },
            },
          }
        })
      }
      if (e === 'Legislation, standards, rules') {
        initialFormData.update((e) => {
          e.data = {
            ...e.data,
            S5: {
              ...e.data.S5,
              S5_G1: {
                ...e.data.S5.S5_G1,
                S5_G1_4: ['4-0'],
              },
            },
          }
        })
      }
      if (e === 'Technology and Processes') {
        initialFormData.update((e) => {
          e.data = {
            ...e.data,
            S5: {
              ...e.data.S5,
              S5_G1: {
                ...e.data.S5.S5_G1,
                S5_G1_4: ['4-2'],
              },
            },
          }
        })
      }
      if (e === 'Monitoring and Analysis') {
        initialFormData.update((e) => {
          e.data = {
            ...e.data,
            S5: {
              ...e.data.S5,
              S5_G1: {
                ...e.data.S5.S5_G1,
                S5_G1_4: ['4-3'],
              },
            },
          }
        })
      }
    }
  }

  const handleSelectLanguage = (val) => {
    setLanguages(languages.concat(val))
  }

  const handleRemoveLanguage = (val) => {
    const newLanaguage = languages.filter((lang) => lang !== val)
    const findInTranslations = translations.find(
      ({ language }) => language === val
    )
    if (findInTranslations)
      setTranslations(translations.filter(({ language }) => language !== val))
    setLanguages(newLanaguage)
  }

  const handleTranslationChange = (name, lang, value) => {
    const newTranslations = [...translations]
    const index = translations.findIndex(
      (x) => x.language === lang && x.translatable_field === name
    )
    if (index !== -1) {
      newTranslations[index].language = lang
      newTranslations[index].translatable_field = name
      newTranslations[index].value = value
      setTranslations(newTranslations)
    } else
      setTranslations([
        ...translations,
        {
          language: lang,
          translatable_field: name,
          value: value,
        },
      ])
  }

  const handleChange = (v, lang) => {
    const newValue = [...value]
    const index = value.findIndex((x) => x.lang === lang)
    if (index !== -1) {
      newValue[index].lang = lang
      newValue[index].value = v
      setValue(newValue)
    } else
      setValue([
        ...value,
        {
          lang: lang,
          value: v,
        },
      ])
    handleTranslationChange('info_docs', lang, v.toString('html'))
  }

  return (
    <div className={styles.flexibleForms}>
      <StickyBox style={{ zIndex: 10 }}>
        <div className="form-info-wrapper">
          <div className="ui container">
            <Row>
              <Col xs={24} lg={24}>
                <div className={`form-meta `}>
                  <div className="d-flex">
                    <Button ghost className="draft-button" size="small">
                      Save as draft
                    </Button>
                    <Button
                      size="small"
                      className="custom-button"
                      disabled={disabledBtn.disabled}
                      loading={sending}
                      type={disabledBtn.type}
                      onClick={(e) => handleOnClickBtnSubmit(e)}
                    >
                      <Trans>Submit</Trans>
                    </Button>
                    <div className="form-title">
                      <span className="title">
                        <Trans>Add</Trans> {label} <Trans>Content</Trans>
                      </span>
                    </div>
                  </div>
                  <div className="highlight">
                    <Switch
                      checked={highlight}
                      size="small"
                      onChange={(status) => setHighlight(status)}
                    />{' '}
                    {highlight
                      ? 'Required fields highlighted'
                      : 'Highlight required fields'}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </StickyBox>
      {/*
      <StickyBox style={{ zIndex: 9 }} offsetTop={20} offsetBottom={20}> */}
      <div className="ui container">
        <div className="form-container">
          <Row>
            <Col
              className="step-panel"
              xs={24}
              lg={6}
              style={{
                minHeight: '100%',
              }}
            >
              <StickyBox style={{ zIndex: 9 }} offsetTop={60}>
                {tabsData.map(({ key, title, desc, steps }, i) => (
                  <Steps
                    key={`steps-section-${key}`}
                    current={data[key]?.steps}
                    initial={-1}
                    direction="vertical"
                    className={key === data.tabs[0] ? 'current-tabs' : ''}
                    onChange={(e) => {
                      e === -1
                        ? handleOnTabChange(key)
                        : handleOnStepClick(e, data.tabs[0])
                    }}
                  >
                    {renderSteps(title, key, steps, i)}
                  </Steps>
                ))}
              </StickyBox>
            </Col>

            {!isLoaded() ? (
              <h2 className="loading">
                <LoadingOutlined spin /> <Trans>Loading</Trans>
              </h2>
            ) : (
              <Col
                className="content-panel"
                xs={24}
                lg={18}
                style={{
                  minHeight: '100%',
                }}
              >
                {getTabStepIndex().tabIndex === 0 ? (
                  <Row>
                    <div className="getting-started-content main-content">
                      <h5>
                        <Trans>Welcome to the GPML Digital Platform!</Trans>
                      </h5>
                      <p>
                        <Trans>
                          We are excited to hear from the members of our
                          community. The GPML Digital Platform is crowdsourced
                          and allows everyone to submit new content via this
                          form.
                        </Trans>
                      </p>
                      <p>
                        <Trans>
                          A wide range of resources can be submitted, and these
                          include Action Plans, Initiatives, Technical
                          resources, Financing resources, Policies, Events, and
                          Technologies. Learn more about each category and
                          sub-categories definitions in the “Content Type”
                          section of this form. A quick summary sheet with
                          categories and sub-categories can be downloaded
                        </Trans>{' '}
                        <a
                          href="https://wedocs.unep.org/bitstream/handle/20.500.11822/37512/Categories%20and%20Sub%20Categories%20for%20the%20forms.pdf?sequence=3&isAllowed=y"
                          target="_blank"
                        >
                          <Trans>here</Trans>
                        </a>
                        .
                      </p>
                      <p>
                        <Trans>
                          Once submitted resources go through a review process
                          which is being fine-tuned via consultations to assess
                          content accuracy and quality. The current validation
                          mechanism draft can be found under
                        </Trans>{' '}
                        <a href="https://wedocs.unep.org/bitstream/handle/20.500.11822/34453/UNEP%20GPML%20Digital%20Platform%20Concept%20for%20User%20and%20Partner%20Consultations%20May%202021.pdf">
                          <Trans>Annex C of the Concept Document.</Trans>
                        </a>
                      </p>
                      <p>
                        <Trans>You can access existing content via the</Trans>{' '}
                        <Link href="/knowledge/library" legacyBehavior>
                          <a>
                            <Trans>Knowledge Exchange Library.</Trans>
                          </a>
                        </Link>
                        <Trans>
                          Make sure to browse around and leave a review under
                          the resources you enjoy the most!
                        </Trans>
                      </p>
                    </div>
                  </Row>
                ) : getTabStepIndex().tabIndex === 1 ? (
                  <Row>
                    <div
                      className="main-content"
                      style={{
                        position:
                          getTabStepIndex().tabIndex === 1 && 'relative',
                        overflow: getTabStepIndex().tabIndex === 1 && 'hidden',
                      }}
                    >
                      <div className="button-wrapper">
                        <h5>
                          <Trans>Pick the main content type</Trans>
                        </h5>
                        <Button
                          ghost
                          onClick={() => setDisplayModal(!displayModal)}
                        >
                          <Trans>SHOW EXAMPLES</Trans>
                        </Button>
                      </div>
                      <div className="example-container">
                        <div className={`Modal ${displayModal ? 'Show' : ''}`}>
                          <Button
                            ghost
                            onClick={() => setDisplayModal(!displayModal)}
                            className="hide-button"
                          >
                            <Trans>HIDE EXAMPLES</Trans>
                          </Button>

                          <List itemLayout="horizontal">
                            {mainContentType
                              ?.find((element) => element.code === mainType)
                              ?.examples.map((link, id) => (
                                <List.Item key={id}>
                                  <a href={link.link} target="_blank">
                                    <List.Item.Meta
                                      title={<Trans id={link.title.id} />}
                                    />
                                  </a>
                                </List.Item>
                              ))}
                          </List>
                        </div>

                        {/* <div
                          className={`Overlay ${displayModal ? "Show" : ""}`}
                          onClick={() => setDisplayModal(!displayModal)}
                        /> */}
                      </div>
                      <Radio.Group
                        className="resource-type-container"
                        onChange={handleMainContentType}
                        value={mainType}
                        style={{ width: displayModal ? '50%' : '100%' }}
                      >
                        {mainContentType.map((item) => {
                          const name =
                            item?.code === 'capacity_building'
                              ? 'Capacity Development'
                              : i18n._(item?.name)

                          return (
                            <Radio.Button
                              className="custom-radio"
                              id={item.code}
                              value={item.code}
                              key={item.code}
                            >
                              <div className="content-circle-wrapper">
                                <div className="info-icon-container">
                                  <h2>{name}</h2>
                                  {item.code !== 'case_study' &&
                                    item.code !== 'data_catalog' && (
                                      <Tooltip
                                        placement="top"
                                        title={<Trans id={item?.desc?.id} />}
                                      >
                                        <div className="info-icon-wrapper">
                                          <InfoIcon />
                                        </div>
                                      </Tooltip>
                                    )}
                                </div>
                              </div>
                            </Radio.Button>
                          )
                        })}
                      </Radio.Group>
                    </div>
                    <div className="sub-content">
                      <div className="sub-content-top">
                        <div className="sub-content-wrapper">
                          <h5>
                            <Trans>Pick the sub-content type</Trans>
                          </h5>
                          <span>
                            <Trans>Optional</Trans>
                          </span>
                        </div>
                      </div>
                      {subContentType?.length > 0 ? (
                        <div className="sub-content-topics">
                          <div className="ant-row" value={subType}>
                            {subContentType?.map((item, index) => (
                              <Col
                                className="gutter-row"
                                xs={12}
                                lg={6}
                                key={index}
                              >
                                <div
                                  className={`ant-radio-button-wrapper ${
                                    item.id === subType ? 'selected' : ''
                                  }`}
                                  key={index}
                                  onClick={() => {
                                    if (item.id === subType) {
                                      setSubType('')
                                    } else {
                                      handleSubContentType(item.id)
                                    }
                                  }}
                                >
                                  <Trans id={item.title.id} />
                                  <Tooltip
                                    placement="top"
                                    title={<Trans id={item.des.id} />}
                                  >
                                    <div className="info-icon-wrapper">
                                      <img src="/i-blue.png" />
                                    </div>
                                  </Tooltip>
                                </div>
                              </Col>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="before-selection">
                          <p>
                            <Trans>
                              Select a Main Content Type above to see
                              sub-content type options
                            </Trans>
                          </p>
                        </div>
                      )}
                    </div>
                  </Row>
                ) : getTabStepIndex().tabIndex === 4 ? (
                  <Row>
                    <div className="main-content">
                      <div className="collapse-wrapper">
                        <Collapse>
                          {languages.map((item) => (
                            <Panel
                              header={
                                languageOptions.find(
                                  (ln) => ln.dbValue === item
                                )?.label
                              }
                              key={item}
                              extra={
                                <div style={{ marginLeft: 'auto' }}>
                                  <DeleteOutlined
                                    onClick={() => handleRemoveLanguage(item)}
                                  />
                                </div>
                              }
                            >
                              <Form layout="vertical">
                                {getTranslationForm(
                                  label,
                                  handleTranslationChange,
                                  item,
                                  toolbarConfig,
                                  handleChange,
                                  value,
                                  translations
                                )}
                              </Form>
                            </Panel>
                          ))}
                        </Collapse>
                      </div>
                      <div>
                        <Dropdown
                          overlay={
                            <ul className={styles.translationDropdown}>
                              {languageOptions
                                .filter(
                                  (ln) =>
                                    !languages.includes(ln.value) &&
                                    ln.value !== 'en'
                                )
                                .map((item) => (
                                  <li
                                    key={item.value}
                                    onClick={() => {
                                      handleSelectLanguage(item.dbValue)
                                      setDropdownVisible(!dropdownVisible)
                                    }}
                                  >
                                    <span>{item.value}</span>
                                  </li>
                                ))}
                            </ul>
                          }
                          trigger={['click']}
                          visible={dropdownVisible}
                          onVisibleChange={(visible) => {
                            setDropdownVisible(visible)
                          }}
                        >
                          <Button
                            size="small"
                            type="default"
                            className="translation-button"
                          >
                            <Trans>Add translation</Trans>
                          </Button>
                        </Dropdown>
                      </div>
                    </div>
                  </Row>
                ) : (
                  <span></span>
                )}
                <Row
                  className={`${
                    getTabStepIndex().tabIndex !== 0 &&
                    getTabStepIndex().tabIndex !== 1 &&
                    getTabStepIndex().tabIndex !== 4
                      ? 'main-content'
                      : null
                  }`}
                >
                  <FlexibleForm
                    formType={props.formType}
                    btnSubmit={btnSubmit}
                    sending={sending}
                    setSending={setSending}
                    highlight={highlight}
                    setHighlight={setHighlight}
                    formSchema={formSchema}
                    setDisabledBtn={setDisabledBtn}
                    tabsData={tabsData}
                    mainType={label && label}
                    subContentType={subType && subType}
                    capacityBuilding={capacityBuilding && capacityBuilding}
                    type={type ? type : ''}
                    translations={translations}
                    source={
                      query?.source?.toString() === 'cobsea' ? 'cobsea' : ''
                    }
                  />
                </Row>
                {getTabStepIndex().tabIndex === 0 ? (
                  <div className="bottom-panel">
                    <div className="center-content">
                      <p>
                        <Trans>Getting Started</Trans>
                      </p>
                    </div>
                    <Button
                      size="small"
                      onClick={(e) => handleOnClickBtnNext(e)}
                      withArrow
                    >
                      <Trans>Next</Trans>
                    </Button>
                  </div>
                ) : getTabStepIndex().tabIndex === 1 ? (
                  <div className="bottom-panel">
                    <Button
                      className="back-button"
                      size="small"
                      onClick={(e) => handleOnClickBtnBack(e)}
                    >
                      <LongArrowRight />
                      <Trans>Back</Trans>
                    </Button>
                    <div className="center-content">
                      <p>
                        <Trans>Field to submit</Trans>
                      </p>
                      <h6>
                        <Trans>1 of 1</Trans>
                      </h6>
                    </div>
                    <Button
                      size="small"
                      onClick={(e) => handleOnClickBtnNext(e)}
                      withArrow
                    >
                      <Trans>Next</Trans>
                    </Button>
                  </div>
                ) : getTabStepIndex().tabIndex === 2 ? (
                  <div className="bottom-panel">
                    <Button
                      className="back-button"
                      size="small"
                      onClick={(e) => handleOnClickBtnBack(e)}
                    >
                      <LongArrowRight />
                      <Trans>Back</Trans>
                    </Button>
                    <div className="center-content">
                      <p>
                        <Trans>Field to submit</Trans>
                      </p>
                      <h6>
                        {data?.[data.tabs[0]]?.required?.[
                          Object.keys(data?.[data.tabs[0]]?.required)[
                            getTabStepIndex().stepIndex
                          ]
                        ]?.length || 0}
                      </h6>
                    </div>
                    <Button
                      size="small"
                      onClick={(e) => handleOnClickBtnNext(e)}
                      withArrow
                    >
                      <Trans>Next</Trans>
                    </Button>
                  </div>
                ) : (
                  <div className="bottom-panel">
                    <Button
                      className="back-button"
                      size="small"
                      onClick={(e) => handleOnClickBtnBack(e)}
                    >
                      <LongArrowRight />
                      <Trans>Back</Trans>
                    </Button>
                  </div>
                )}
              </Col>
            )}
          </Row>
        </div>
      </div>
      {/* </StickyBox> */}
    </div>
  )
}

export default FlexibleForms
