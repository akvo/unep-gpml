import React, { useEffect, useState, useCallback, useRef } from 'react'
import ObjectFieldTemplate from '../../utils/forms/object-template'
import ArrayFieldTemplate from '../../utils/forms/array-template'
import FieldTemplate from '../../utils/forms/field-template'
import widgets from '../../utils/forms'
import { overideValidation } from '../../utils/forms'
import uiSchema from './ui-schema.json'
import common from './common'
import cloneDeep from 'lodash/cloneDeep'
import { withRouter } from 'react-router-dom'
import { UIStore } from '../../store'
import { Store } from 'pullstate'
import { notification, Typography } from 'antd'
import { Theme as AntDTheme } from '@rjsf/antd'
import { withTheme } from '@rjsf/core'
import {
  transformFormData,
  collectDependSchemaRefactor,
} from '../initiative/form'
import { checkRequiredFieldFilledIn, customFormats } from '../../utils/forms'
import api from '../../utils/api'
import { eventTrack } from '../../utils/misc'
import { useRouter } from 'next/router'
import { isEqual } from 'lodash'

const Form = withTheme(AntDTheme)

function usePrevious(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}

const getDifferences = (oldObj, newObj) => {
  let changes = {}

  const isPlainObject = (obj) =>
    obj && typeof obj === 'object' && !Array.isArray(obj)

  for (let key in newObj) {
    if (isPlainObject(newObj[key]) && isPlainObject(oldObj[key])) {
      const nestedChanges = getDifferences(oldObj[key], newObj[key])
      if (Object.keys(nestedChanges).length) {
        changes[key] = nestedChanges
      }
    } else if (Array.isArray(newObj[key]) && Array.isArray(oldObj[key])) {
      const arrChanges = []
      for (
        let i = 0;
        i < Math.max(newObj[key].length, oldObj[key].length);
        i++
      ) {
        if (newObj[key][i] && oldObj[key][i]) {
          const arrNestedChanges = getDifferences(
            oldObj[key][i],
            newObj[key][i]
          )
          if (Object.keys(arrNestedChanges).length) {
            arrChanges[i] = arrNestedChanges
          }
        } else if (newObj[key][i] !== oldObj[key][i]) {
          arrChanges[i] = newObj[key][i] !== undefined ? newObj[key][i] : null
        }
      }
      if (arrChanges.length) {
        changes[key] = arrChanges
      }
    } else if (oldObj?.[key] !== newObj?.[key]) {
      changes[key] = newObj?.[key]
    }
  }

  return changes
}

const FlexibleForm = ({
  btnSubmit,
  sending,
  setSending,
  formType,
  highlight,
  setHighlight,
  isStakeholderType,
  isEntityType,
  formSchema,
  setDisabledBtn,
  hideEntityPersonalDetail,
  tabsData,
  mainType,
  subContentType,
  capacityBuilding,
  type,
  translations,
  source,
}) => {
  const router = useRouter()
  const { id: params } = router.query

  const {
    countries,
    organisations,
    tags,
    formEdit,
    profile,
    selectedMainContentType,
    mainContentType,
    languages,
  } = UIStore.currentState

  const { status, id } = formEdit.flexible

  const { initialData, initialFormData, prevFormData } = common

  const flexibleFormData = initialFormData.useState()
  const prevData = prevFormData.useState()
  const [dependValue, setDependValue] = useState([])
  const [schema, setSchema] = useState({})
  const prevSchema = usePrevious(formSchema.schema)

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj))
  }

  useEffect(() => {
    if (JSON.stringify(prevSchema) !== JSON.stringify(formSchema.schema)) {
      setSchema(formSchema.schema)
    }
  }, [formSchema, prevSchema])

  const handleOnSubmit = ({ formData }) => {
    eventTrack('Resource', 'Submitted', 'Button')
    if (mainType === 'Policy') {
      handleOnSubmitPolicy(formData)
      return false
    }

    if (mainType === 'Initiative') {
      handleOnSubmitInitiative(formData)
      return false
    }

    if (mainType === 'Event') {
      handleOnSubmitEvent(formData, capacityBuilding)
      return false
    }

    if (mainType === 'Technology') {
      handleOnSubmitTechnology(formData)
      return false
    }

    if (mainType === 'Case Study') {
      handleOnSubmitCaseStudy(formData)
      return false
    }

    let prevFormData = deepClone(prevData?.data)

    delete formData?.tabs
    delete formData?.steps
    delete formData?.required
    delete prevFormData?.tabs
    delete prevFormData?.steps
    delete prevFormData?.required

    // # Transform data before sending to endpoint
    let data = {
      ...formData,
      resourceType: mainType,
      subContentType: subContentType,
      ...(capacityBuilding && { capacityBuilding: true }),
      source: source ? source : 'gpml',
    }

    let pdata = {
      ...prevFormData,
      resourceType: mainType,
      subContentType: subContentType,
      ...(capacityBuilding && { capacityBuilding: true }),
      source: source ? source : 'gpml',
    }

    transformFormData(data, formData, formSchema.schema.properties, true)
    transformFormData(pdata, prevFormData, formSchema.schema.properties, true)

    data.version = parseInt(formSchema.schema.version)
    pdata.version = parseInt(formSchema.schema.version)

    delete data?.S1
    delete data?.S2
    delete data?.S3
    delete data?.S4
    delete data?.S5
    delete data?.S6
    delete pdata?.S1
    delete pdata?.S2
    delete pdata?.S3
    delete pdata?.S4
    delete pdata?.S5
    delete pdata?.S6

    data.geoCoverageType = Object.keys(data.geoCoverageType)[0]

    if (data.resourceType === 'Financing Resource') {
      if (data.hasOwnProperty('valueCurrency')) {
        data.valueCurrency = Object.keys(data?.valueCurrency)[0]
      }
      if (data.hasOwnProperty('validFrom')) {
        data.validFrom = data?.validFrom
        data.validTo = data.validTo || 'Ongoing'
      }
      if (data.hasOwnProperty('validTo')) {
        data.validTo = data?.validTo
      }
      if (data.hasOwnProperty('valueAmount')) {
        data.value = data?.valueAmount
      }

      delete data.valueAmount
      if (data.hasOwnProperty('valueRemark')) {
        data.valueRemarks = data.valueRemark
        delete data.valueRemark
      }
    }

    if (data.resourceType === 'Action Plan') {
      if (data.hasOwnProperty('validTo')) {
        data.validTo = data?.validTo
      }
      if (data.hasOwnProperty('validFrom')) {
        data.validFrom = data?.validFrom
        data.validTo = data.validTo || 'Ongoing'
      }

      if (data.hasOwnProperty('firstPublicationDate')) {
        data.firstPublicationDate = data.firstPublicationDate
        data.latestAmendmentDate = data.latestAmendmentDate || 'Ongoing'
      }

      if (data.hasOwnProperty('latestAmendmentDate')) {
        data.latestAmendmentDate = data.latestAmendmentDate
      }
    } else {
      delete data.firstPublicationDate
      delete data.latestAmendmentDate
    }

    delete data.orgName

    data.tags =
      formData.S4.S4_G3.tags &&
      formData.S4.S4_G3.tags.map((x) => {
        return {
          tag: x,
          ...(Object.values(tags)
            .flat()
            .find((o) => o.tag === x) && {
            id: Object.values(tags)
              .flat()
              .find((o) => o.tag === x)?.id,
          }),
        }
      })

    data.language = 'en'
    delete data?.tagsList

    if (data?.publishYear) {
      const publishYear = new Date(data.publishYear)
      data.publishYear = publishYear.getFullYear()
    }

    if (data.geoCoverageType === 'transnational') {
      if (
        data.geoCoverageValueTransnational &&
        data.geoCoverageValueTransnational.length > 0
      ) {
        data.geoCoverageCountryGroups = data.geoCoverageValueTransnational
          ? data.geoCoverageValueTransnational
              ?.filter((value) => Number(value) !== -1)
              .map((x) => parseInt(x))
          : []
        if (data.geoCoverageValueTransnational.includes('-1')) {
          delete data.geoCoverageCountryGroups
        }
        delete data.geoCoverageValueTransnational
      }
      if (data.geoCoverageCountries && data.geoCoverageCountries.length > 0) {
        data.geoCoverageCountries = data.geoCoverageCountries
          ? data.geoCoverageCountries.map((x) => parseInt(x))
          : []
        if (
          data.geoCoverageValueTransnational &&
          data.geoCoverageValueTransnational.length === 0
        ) {
          delete data.geoCoverageValueTransnational
        }
      }
      delete data.geoCoverageValueSubnational
      delete data.geoCoverageCountryStates
    }

    if (data.geoCoverageType === 'national') {
      data.geoCoverageCountries = data.geoCoverageCountries.map((x) =>
        parseInt(x)
      )
      delete data.geoCoverageValueTransnational
      delete data.geoCoverageValueSubnational
      delete data.geoCoverageCountryStates
    }

    if (data.geoCoverageType === 'sub-national') {
      if (status === 'add' && !params) {
        data.geoCoverageCountries = [
          parseInt(Object.keys(data.geoCoverageValueSubnational)),
        ]
        data.geoCoverageCountryStates = [Number(data.geoCoverageCountryStates)]
      } else {
        if (data.geoCoverageCountryStates.length === 0)
          delete data.geoCoverageCountryStates
        else
          data.geoCoverageCountryStates = [
            Number(data.geoCoverageCountryStates),
          ]
      }
      delete data.geoCoverageValueSubnational
      delete data.geoCoverageValueTransnational
    }

    if (data.geoCoverageType === 'global') {
      delete data.geoCoverageValueTransnational
      delete data.geoCoverageCountries
      delete data.geoCoverageValueSubnational
      delete data.geoCoverageCountryStates
    }

    if (data?.urls) {
      data.urls = data.urls.map((x) => {
        return {
          url: x,
          lang: 'en',
        }
      })
    }

    if (data?.entity) {
      data.entityConnections = data.entity[0].hasOwnProperty('role')
        ? data.entity
        : []
      delete data.entity
    }

    if (data?.individual) {
      data.individualConnections = data.individual[0].hasOwnProperty('role')
        ? data.individual
        : []
      delete data.individual
    }

    if (data?.info) {
      data.infoDocs = data.info === '<p><br></p>' ? '' : data.info
      delete data.info
    }

    data.summary = data?.summary?.replace(/(?:\r\n|\r|\n)/g, ' ')

    if (data?.type?.length > 0) {
      data.relatedContent = data?.type
        .filter((x) => x?.value)
        .map((x) => {
          return {
            id: parseInt(x.value),
            type: x.label,
          }
        })
      delete data.related
      delete data.type
      delete data.id
    }

    if (status === 'add' && !params) {
      data?.image && data?.image === '' && delete data.image
    }

    if (status === 'edit' || params) {
      data?.image && data?.image.match(customFormats.url) && delete data.image

      if (formData?.S4['S4_G4'].image === '') {
        data.image = ''
      }
    }

    const changes = getDifferences(pdata, data)

    if (status === 'add' && !params) {
      api
        .post('/resource', data)
        .then((res) => {
          if (translations.length > 0) {
            api
              .put(`/translations/resource/${res.data.id}`, {
                translations: translations,
                'topic-type': 'resource',
              })
              .then((langResp) => {
                console.log(langResp)
              })
              .catch((e) => {
                console.log(e)
                notification.error({ message: 'An error occured' })
              })
          }
          // scroll top
          window.scrollTo({ top: 0 })
          initialFormData.update((e) => {
            e.data = initialData
          })
          setDisabledBtn({ disabled: true, type: 'default' })
          notification.success({ message: 'Resource successfully created' })
        })
        .catch(() => {
          notification.error({ message: 'An error occured' })
        })
        .finally(() => {
          setSending(false)
        })
    }
    if (status === 'edit' || params) {
      if (Object.keys(changes).length === 0) {
        return
      }
      delete data.version
      api
        .put(`/detail/${type}/${id || params}`, changes)
        .then((res) => {
          // scroll top
          if (translations.length > 0) {
            api
              .put(`/translations/resource/${params}`, {
                translations: translations,
                'topic-type': 'resource',
              })
              .then((langResp) => {
                console.log(langResp)
              })
              .catch((e) => {
                console.log(e)
                notification.error({ message: 'An error occured' })
              })
          }
          window.scrollTo({ top: 0 })
          initialFormData.update((e) => {
            e.data = initialData
          })
          setDisabledBtn({ disabled: true, type: 'default' })
          notification.success({ message: 'Resource successfully updated' })
          router.push(`/${type.replace('_', '-')}/${id || params}`)
        })
        .catch(() => {
          initialFormData.update((e) => {
            e.data = initialData
          })
          router.push(`/${type.replace('_', '-')}/${id || params}`)
          notification.error({ message: 'An error occured' })
        })
        .finally(() => {
          setSending(false)
        })
    }
  }

  ///

  const handleOnSubmitInitiative = (formData) => {
    delete formData?.tabs
    delete formData?.steps
    delete formData?.required
    delete prevFormData?.tabs
    delete prevFormData?.steps
    delete prevFormData?.required

    let prevFormData = deepClone(prevData?.data)

    let data = {
      ...formData,
      ...(capacityBuilding && { capacityBuilding: true }),
      source: source ? source : 'gpml',
    }

    let pdata = {
      ...prevFormData,
      ...(capacityBuilding && { capacityBuilding: true }),
      source: source ? source : 'gpml',
    }

    transformFormData(data, formData, formSchema.schema.properties)
    transformFormData(pdata, prevFormData, formSchema.schema.properties)

    data.version = parseInt(formSchema.schema.version)
    pdata.version = parseInt(formSchema.schema.version)

    delete data?.S1
    delete data?.S2
    delete data?.S3
    delete data?.S4
    delete data?.S5
    delete data?.S6
    delete pdata?.S1
    delete pdata?.S2
    delete pdata?.S3
    delete pdata?.S4
    delete pdata?.S5
    delete pdata?.S6

    data.tags =
      formData.S4.S4_G3.tags &&
      formData.S4.S4_G3.tags.map((x) => {
        return {
          tag: x,
          ...(Object.values(tags)
            .flat()
            .find((o) => o.tag === x) && {
            id: Object.values(tags)
              .flat()
              .find((o) => o.tag === x)?.id,
          }),
        }
      })
    delete data.qtags
    delete data.qid

    data.url = data.qurl
    delete data.qurl

    if (data?.qinfo) {
      data.info_docs = data.qinfo
      delete data.qinfo
    }

    if (data?.qentity) {
      data.entity_connections = data.qentity[0].hasOwnProperty('role')
        ? data.qentity
        : []
      delete data.qentity
    }

    if (data?.qindividual) {
      data.individual_connections = data.qindividual[0].hasOwnProperty('role')
        ? data.qindividual
        : []
      delete data.qindividual
    }

    data.q2 = data.qtitle
    delete data.qtitle

    data.q3 = data?.qsummary?.replace(/(?:\r\n|\r|\n)/g, ' ')
    delete data.qsummary

    data.q24 = data.qgeoCoverageType
    delete data.qgeoCoverageType

    data.sub_content_type = subContentType

    if (data.q24.hasOwnProperty('transnational')) {
      data.q24_2 = data.q24_4
      data.q24_4 = data.q24_3.filter((value) => !value.hasOwnProperty(-1))
      data.q24_3 = null
      delete data.qgeoCoverageValueSubnational
      delete data.qgeoCoverageValueSubnationalCity
      delete data.qgeoCoverageCountries
      delete data.qgeoCoverageValueTransnational
    }
    if (data.q24.hasOwnProperty('national')) {
      if (status === 'edit' || params) {
        data.q24_2 = Array.isArray(data.q24_2) ? data.q24_2 : [data.q24_2]
      } else {
        data.q24_2 = data.q24_2
      }
      delete data.qgeoCoverageValueSubnational
      delete data.qgeoCoverageValueSubnationalCity
      delete data.q24_4
      delete data.q24_3
    }

    if (data.q24.hasOwnProperty('sub-national')) {
      if (status === 'add' && !params) {
        data.q24_2 = [parseInt(Object.keys(data.qgeoCoverageValueSubnational))]
        data.geoCoverageCountryStates = [Number(data.qgeoCoverageCountryStates)]
      } else {
        if (data?.geoCoverageCountryStates?.length === 0)
          delete data.qgeoCoverageCountryStates
        else
          data.geoCoverageCountryStates = !data.geoCoverageCountryStates
            ? []
            : [Number(data.qgeoCoverageCountryStates)]
      }
      delete data.qgeoCoverageValueSubnational
      delete data.geoCoverageValueTransnational
      delete data.qgeoCoverageCountryStates
      delete data.q24_4
      delete data.q24_3
    }

    if (data.q24.hasOwnProperty('global')) {
      delete data.q24_4
      delete data.q24_3
      delete data.q24_2
      delete data.qgeoCoverageValueSubnational
      delete data.qgeoCoverageValueSubnationalCity
    }

    if (data?.qtype?.length > 0) {
      data.related_content = data?.qtype
        .filter((x) => x?.value)
        .map((x) => {
          return {
            id: parseInt(x.value),
            type: x.label,
          }
        })
      delete data.qrelated
      delete data.qtype
    }

    data.language = 'en'
    delete data.tagsList
    delete data.qtagsList

    if (data.qthumbnail) {
      data.thumbnail = data.qthumbnail
      delete data.qthumbnail
    }

    if (pdata.qthumbnail) {
      pdata.thumbnail = pdata.qthumbnail
      delete pdata.qthumbnail
    }

    if (status === 'add' && !params) {
      data?.qimage && data?.qimage === '' && delete data.qimage
      data?.thumbnail && data?.thumbnail === '' && delete data.thumbnail
    }

    if (status === 'edit' || params) {
      data?.qimage &&
        data?.qimage.match(customFormats.url) &&
        delete data.qimage

      data?.thumbnail &&
        data?.thumbnail.match(customFormats.url) &&
        delete data.thumbnail

      if (formData?.S4['S4_G4'].image === '') {
        data.qimage = ''
      }
      if (formData?.S4['S4_G4'].thumbnail === '') {
        data.thumbnail = ''
      }
    }

    const changes = getDifferences(pdata, data)

    if (status === 'add' && !params) {
      api
        .postRaw('/initiative', data)
        .then((res) => {
          if (translations.length > 0) {
            api
              .put(`/translations/initiative/${res.data.id}`, {
                translations: translations,
                'topic-type': 'resource',
              })
              .then((langResp) => {
                console.log(langResp)
              })
              .catch((e) => {
                console.log(e)
                notification.error({ message: 'An error occured' })
              })
          }
          window.scrollTo({ top: 0 })
          initialFormData.update((e) => {
            e.data = initialData
          })
          setDisabledBtn({ disabled: true, type: 'default' })
          notification.success({ message: 'Resource successfully created' })
        })
        .catch((e) => {
          console.log(e.response)
          notification.error({
            message: e.response.data.reason
              ? e.response.data.reason.replace(/-/g, ' ')
              : 'An error occured',
          })
        })
        .finally(() => {
          setSending(false)
        })
    }
    if (status === 'edit' || params) {
      if (Object.keys(changes).length === 0) {
        return
      }
      delete data.version
      api
        .putRaw(`/detail/initiative/${id || params}`, changes)
        .then((res) => {
          if (translations.length > 0) {
            api
              .put(`/translations/initiative/${params}`, {
                translations: translations,
                'topic-type': 'initiative',
              })
              .then((langResp) => {
                notification.error({ message: 'An error occured' })
              })
              .catch((e) => {
                console.log(e)
              })
          }
          // scroll top
          window.scrollTo({ top: 0 })
          initialFormData.update((e) => {
            e.data = initialData
          })
          setDisabledBtn({ disabled: true, type: 'default' })
          notification.success({ message: 'Resource successfully updated' })
          router.push(`/initiative/${id || params}`)
        })
        .catch((e) => {
          initialFormData.update((e) => {
            e.data = initialData
          })
          router.push(`/initiative/${id || params}`)
          notification.error({ message: 'An error occured' })
        })
        .finally(() => {
          setSending(false)
        })
    }
  }

  const handleOnSubmitPolicy = (formData) => {
    delete formData?.tabs
    delete formData?.steps
    delete formData?.required

    let prevFormData = deepClone(prevData?.data)

    delete prevFormData?.tabs
    delete prevFormData?.steps
    delete prevFormData?.required

    let data = {
      ...formData,
      subContentType: subContentType,
      ...(capacityBuilding && { capacityBuilding: true }),
      source: source ? source : 'gpml',
    }

    let pdata = {
      ...prevFormData,
      subContentType: subContentType,
      ...(capacityBuilding && { capacityBuilding: true }),
      source: source ? source : 'gpml',
    }

    transformFormData(data, formData, formSchema.schema.properties, true)
    transformFormData(pdata, prevFormData, formSchema.schema.properties, true)

    data.version = parseInt(formSchema.schema.version)
    pdata.version = parseInt(formSchema.schema.version)

    delete data?.S1
    delete data?.S2
    delete data?.S3
    delete data?.S4
    delete data?.S5
    delete data?.S6
    delete pdata?.S1
    delete pdata?.S2
    delete pdata?.S3
    delete pdata?.S4
    delete pdata?.S5
    delete pdata?.S6

    data.geoCoverageType = Object.keys(data.geoCoverageType)[0]

    if (data.geoCoverageType === 'transnational') {
      if (
        data.geoCoverageValueTransnational &&
        data.geoCoverageValueTransnational.length > 0
      ) {
        data.geoCoverageCountryGroups = data.geoCoverageValueTransnational
          ? data.geoCoverageValueTransnational
              ?.filter((value) => Number(value) !== -1)
              .map((x) => parseInt(x))
          : []
        delete data.geoCoverageValueTransnational
      }
      if (data.geoCoverageCountries && data.geoCoverageCountries.length > 0) {
        data.geoCoverageCountries = data.geoCoverageCountries
          ? data.geoCoverageCountries.map((x) => parseInt(x))
          : []
      }
    }

    if (data.geoCoverageType === 'national') {
      data.geoCoverageCountries = data.geoCoverageCountries.map((x) =>
        parseInt(x)
      )
    }

    if (data.geoCoverageType === 'sub-national') {
      if (status === 'add' && !params) {
        data.geoCoverageCountries = [
          parseInt(Object.keys(data.geoCoverageValueSubnational)),
        ]
        data.geoCoverageCountryStates = [Number(data.geoCoverageCountryStates)]
      } else {
        if (data.geoCoverageCountryStates.length === 0)
          delete data.geoCoverageCountryStates
        else
          data.geoCoverageCountryStates = [
            Number(data.geoCoverageCountryStates),
          ]
      }
      delete data.geoCoverageValueSubnational
      delete data.geoCoverageValueTransnational
    }

    if (data.geoCoverageType === 'sub-national') {
      data.geoCoverageCountries = [
        parseInt(Object.keys(data.geoCoverageValueSubnational)[0]),
      ]

      delete data.geoCoverageValueSubnational
    }

    if (data.geoCoverageType === 'global') {
      delete data.geoCoverageValueTransnational
      delete data.geoCoverageCountries
    }

    if (data?.urls) {
      data.urls = data.urls.map((x) => {
        return {
          url: x,
          lang: 'en',
        }
      })
    }

    data.tags =
      formData.S4.S4_G3.tags &&
      formData.S4.S4_G3.tags.map((x) => {
        return {
          tag: x,
          ...(Object.values(tags)
            .flat()
            .find((o) => o.tag === x) && {
            id: Object.values(tags)
              .flat()
              .find((o) => o.tag === x)?.id,
          }),
        }
      })

    data.language = 'en'
    delete data.tagsList

    if (data.hasOwnProperty('firstPublicationDate')) {
      data.firstPublicationDate = data.firstPublicationDate
      data.latestAmendmentDate = data.latestAmendmentDate || null
    }

    if (data.hasOwnProperty('latestAmendmentDate')) {
      data.latestAmendmentDate = data.latestAmendmentDate
    }

    if (data.hasOwnProperty('implementingMea')) {
      data.implementingMea = parseInt(Object.keys(data.implementingMea)[0])
    }

    if (data?.entity) {
      data.entityConnections = data.entity[0].hasOwnProperty('role')
        ? data.entity
        : []
      delete data.entity
    }

    if (data?.individual) {
      data.individualConnections = data.individual[0].hasOwnProperty('role')
        ? data.individual
        : []
      delete data.individual
    }

    if (data?.info) {
      data.infoDocs = data.info === '<p><br></p>' ? '' : data.info
      delete data.info
    }

    if (data?.type?.length > 0) {
      data.relatedContent = data?.type
        .filter((x) => x?.value)
        .map((x) => {
          return {
            id: parseInt(x.value),
            type: x.label,
          }
        })
      delete data.related
      delete data.type
      delete data.id
    }

    if (data?.summary) {
      data.abstract = data?.summary?.replace(/(?:\r\n|\r|\n)/g, ' ')
      delete data.summary
    }

    if (data?.lang) {
      // let find = languages[Object.keys(data.lang)[0]];
      // data.language = {
      //   english_name: find.name,
      //   native_name: find.native,
      //   iso_code: Object.keys(data.lang)[0],
      // };
      delete data.lang
    }

    if (status === 'add' && !params) {
      data?.image && data?.image === '' && delete data.image
    }

    if (status === 'edit' || params) {
      data?.image && data?.image.match(customFormats.url) && delete data.image

      if (formData?.S4['S4_G4'].image === '') {
        data.image = ''
      }
    }

    const changes = getDifferences(pdata, data)

    if (status === 'add' && !params) {
      api
        .post('/policy', data)
        .then((res) => {
          if (translations.length > 0) {
            api
              .put(`/translations/policy/${res.data.id}`, {
                translations: translations,
                'topic-type': 'policy',
              })
              .then((langResp) => {})
              .catch((e) => {
                console.log(e)
                notification.error({ message: 'An error occured' })
              })
          }
          window.scrollTo({ top: 0 })
          initialFormData.update((e) => {
            e.data = initialData
          })
          setDisabledBtn({ disabled: true, type: 'default' })
          notification.success({ message: 'Resource successfully created' })
        })
        .catch(() => {
          notification.error({ message: 'An error occured' })
        })
        .finally(() => {
          setSending(false)
        })
    }
    if (status === 'edit' || params) {
      if (Object.keys(changes).length === 0) {
        return
      }
      delete data.version
      api
        .put(`/detail/${type}/${id || params}`, changes)
        .then(() => {
          if (translations.length > 0) {
            api
              .put(`/translations/policy/${params}`, {
                translations: translations,
                'topic-type': 'policy',
              })
              .then((langResp) => {})
              .catch((e) => {
                console.log(e)
                notification.error({ message: 'An error occured' })
              })
          }
          // scroll top
          window.scrollTo({ top: 0 })
          initialFormData.update((e) => {
            e.data = initialData
          })
          setDisabledBtn({ disabled: true, type: 'default' })
          notification.success({ message: 'Resource successfully updated' })
          router.push(`/${type}/${id || params}`)
        })
        .catch(() => {
          initialFormData.update((e) => {
            e.data = initialData
          })
          router.push(`/${type}/${id || params}`)
          notification.error({ message: 'An error occured' })
        })
        .finally(() => {
          setSending(false)
        })
    }
  }

  ///

  const handleOnSubmitEvent = (formData) => {
    delete formData?.tabs
    delete formData?.steps
    delete formData?.required

    let prevFormData = deepClone(prevData?.data)

    delete prevFormData?.tabs
    delete prevFormData?.steps
    delete prevFormData?.required

    let data = {
      ...formData,
      subContentType: subContentType,
      ...(capacityBuilding && { capacityBuilding: true }),
      source: source ? source : 'gpml',
    }

    let pdata = {
      ...prevFormData,
      subContentType: subContentType,
      ...(capacityBuilding && { capacityBuilding: true }),
      source: source ? source : 'gpml',
    }

    transformFormData(data, formData, formSchema.schema.properties, true)
    transformFormData(pdata, prevFormData, formSchema.schema.properties, true)

    data.version = parseInt(formSchema.schema.version)
    pdata.version = parseInt(formSchema.schema.version)

    delete data?.S1
    delete data?.S2
    delete data?.S3
    delete data?.S4
    delete data?.S5
    delete data?.S6
    delete pdata?.S1
    delete pdata?.S2
    delete pdata?.S3
    delete pdata?.S4
    delete pdata?.S5
    delete pdata?.S6

    data.geoCoverageType = Object.keys(data.geoCoverageType)[0]

    if (data.geoCoverageType === 'transnational') {
      if (
        data.geoCoverageValueTransnational &&
        data.geoCoverageValueTransnational.length > 0
      ) {
        data.geoCoverageCountryGroups = data.geoCoverageValueTransnational
          ? data.geoCoverageValueTransnationaldata
              ?.filter((value) => Number(value) !== -1)
              .map((x) => parseInt(x))
          : []
        delete data.geoCoverageValueTransnational
      }
      if (data.geoCoverageCountries && data.geoCoverageCountries.length > 0) {
        data.geoCoverageCountries = data.geoCoverageCountries
          ? data.geoCoverageCountries.map((x) => parseInt(x))
          : []
      }
    }

    if (data.geoCoverageType === 'national') {
      data.geoCoverageCountries = data.geoCoverageCountries.map((x) =>
        parseInt(x)
      )
    }

    if (data.geoCoverageType === 'sub-national') {
      if (status === 'add' && !params) {
        data.geoCoverageCountries = [
          parseInt(Object.keys(data.geoCoverageValueSubnational)),
        ]
        data.geoCoverageCountryStates = [Number(data.geoCoverageCountryStates)]
      } else {
        if (data.geoCoverageCountryStates.length === 0)
          delete data.geoCoverageCountryStates
        else
          data.geoCoverageCountryStates = [
            Number(data.geoCoverageCountryStates),
          ]
      }
      delete data.geoCoverageValueSubnational
      delete data.geoCoverageValueTransnational
    }

    if (data.geoCoverageType === 'global') {
      delete data.geoCoverageValueTransnational
      delete data.geoCoverageCountries
    }

    if (data?.urls) {
      data.urls = data.urls.map((x) => {
        return {
          url: x,
          lang: 'en',
        }
      })
    }

    data.tags =
      formData.S4.S4_G3.tags &&
      formData.S4.S4_G3.tags.map((x) => {
        return {
          tag: x,
          ...(Object.values(tags)
            .flat()
            .find((o) => o.tag === x) && {
            id: Object.values(tags)
              .flat()
              .find((o) => o.tag === x)?.id,
          }),
        }
      })

    data.language = 'en'
    delete data.tagsList

    if (data.hasOwnProperty('startDate')) {
      data.startDate = data.startDate
    }

    if (data.hasOwnProperty('endDate')) {
      data.endDate = data.endDate
    }

    if (data?.entity) {
      data.entityConnections = data.entity[0].hasOwnProperty('role')
        ? data.entity
        : []
      delete data.entity
    }

    if (data?.individual) {
      data.individualConnections = data.individual[0].hasOwnProperty('role')
        ? data.individual
        : []
      delete data.individual
    }
    if (data?.info) {
      data.infoDocs = data.info === '<p><br></p>' ? '' : data.info
      delete data.info
    }

    if (data?.type?.length > 0) {
      data.relatedContent = data?.type
        .filter((x) => x?.value)
        .map((x) => {
          return {
            id: parseInt(x.value),
            type: x.label,
          }
        })
      delete data.related
      delete data.type
      delete data.id
    }

    if (data?.summary) {
      data.description = data?.summary?.replace(/(?:\r\n|\r|\n)/g, ' ')
      delete data.summary
    }

    if (status === 'add' && !params) {
      data?.image && data?.image === '' && delete data.image
      data?.thumbnail && data?.thumbnail === '' && delete data.thumbnail
    }

    if (status === 'edit' || params) {
      data?.image && data?.image.match(customFormats.url) && delete data.image

      data?.thumbnail &&
        data?.thumbnail.match(customFormats.url) &&
        delete data.thumbnail

      if (formData?.S4['S4_G4'].image === '') {
        data.image = ''
      }
      if (formData?.S4['S4_G4'].thumbnail === '') {
        data.thumbnail = ''
      }
    }

    const changes = getDifferences(pdata, data)

    if (status === 'add' && !params) {
      api
        .post('/event', data)
        .then((res) => {
          if (translations.length > 0) {
            api
              .put(`/translations/event/${res.data.id}`, {
                translations: translations,
                'topic-type': 'event',
              })
              .then((langResp) => {})
              .catch((e) => {
                console.log(e)
                notification.error({ message: 'An error occured' })
              })
          }
          window.scrollTo({ top: 0 })
          initialFormData.update((e) => {
            e.data = initialData
          })
          setDisabledBtn({ disabled: true, type: 'default' })
          notification.success({ message: 'Resource successfully created' })
        })
        .catch(() => {
          notification.error({ message: 'An error occured' })
        })
        .finally(() => {
          setSending(false)
        })
    }
    if (status === 'edit' || params) {
      if (Object.keys(changes).length === 0) {
        return
      }
      delete data.version
      api
        .put(`/detail/${type}/${id || params}`, changes)
        .then(() => {
          if (translations.length > 0) {
            api
              .put(`/translations/event/${params}`, {
                translations: translations,
                'topic-type': 'event',
              })
              .then((langResp) => {})
              .catch((e) => {
                console.log(e)
                notification.error({ message: 'An error occured' })
              })
          }
          // scroll top
          window.scrollTo({ top: 0 })
          initialFormData.update((e) => {
            e.data = initialData
          })
          setDisabledBtn({ disabled: true, type: 'default' })
          notification.success({ message: 'Resource successfully updated' })
          router.push(`/${type}/${id || params}`)
        })
        .catch(() => {
          initialFormData.update((e) => {
            e.data = initialData
          })
          router.push(`/${type}/${id || params}`)
          notification.error({ message: 'An error occured' })
        })
        .finally(() => {
          setSending(false)
        })
    }
  }

  ///

  const handleOnSubmitTechnology = (formData) => {
    delete formData?.tabs
    delete formData?.steps
    delete formData?.required

    let prevFormData = deepClone(prevData?.data)

    delete prevFormData?.tabs
    delete prevFormData?.steps
    delete prevFormData?.required

    let data = {
      ...formData,
      subContentType: subContentType,
      source: source ? source : 'gpml',
    }

    let pdata = {
      ...prevFormData,
      subContentType: subContentType,
      source: source ? source : 'gpml',
    }

    transformFormData(data, formData, formSchema.schema.properties, true)
    transformFormData(pdata, prevFormData, formSchema.schema.properties, true)

    data.version = parseInt(formSchema.schema.version)
    pdata.version = parseInt(formSchema.schema.version)

    delete data?.S1
    delete data?.S2
    delete data?.S3
    delete data?.S4
    delete data?.S5
    delete data?.S6
    delete pdata?.S1
    delete pdata?.S2
    delete pdata?.S3
    delete pdata?.S4
    delete pdata?.S5
    delete pdata?.S6

    data.geoCoverageType = Object.keys(data.geoCoverageType)[0]

    if (data.geoCoverageType === 'transnational') {
      if (
        data.geoCoverageValueTransnational &&
        data.geoCoverageValueTransnational.length > 0
      ) {
        data.geoCoverageCountryGroups = data.geoCoverageValueTransnational
          ? data.geoCoverageValueTransnational
              ?.filter((value) => Number(value) !== -1)
              .map((x) => parseInt(x))
          : []
        delete data.geoCoverageValueTransnational
      }
      if (data.geoCoverageCountries && data.geoCoverageCountries.length > 0) {
        data.geoCoverageCountries = data.geoCoverageCountries
          ? data.geoCoverageCountries.map((x) => parseInt(x))
          : []
      }
    }

    if (data.geoCoverageType === 'national') {
      data.geoCoverageCountries = data.geoCoverageCountries.map((x) =>
        parseInt(x)
      )
    }

    if (data.geoCoverageType === 'sub-national') {
      if (status === 'add' && !params) {
        data.geoCoverageCountries = [
          parseInt(Object.keys(data.geoCoverageValueSubnational)),
        ]
        data.geoCoverageCountryStates = [Number(data.geoCoverageCountryStates)]
      } else {
        if (data.geoCoverageCountryStates.length === 0)
          delete data.geoCoverageCountryStates
        else
          data.geoCoverageCountryStates = [
            Number(data.geoCoverageCountryStates),
          ]
      }
      delete data.geoCoverageValueSubnational
      delete data.geoCoverageValueTransnational
    }

    if (data.geoCoverageType === 'global') {
      delete data.geoCoverageValueTransnational
      delete data.geoCoverageCountries
    }

    if (data?.yearFounded) {
      const yearFounded = new Date(data.yearFounded)
      data.yearFounded = yearFounded.getFullYear()
    }

    if (data?.title) {
      data.name = data.title
      delete data.title
    }

    if (data?.urls) {
      data.urls = data.urls.map((x) => {
        return {
          url: x,
          lang: 'en',
        }
      })
    }

    data.tags =
      formData.S4.S4_G3.tags &&
      formData.S4.S4_G3.tags.map((x) => {
        return {
          tag: x,
          ...(Object.values(tags)
            .flat()
            .find((o) => o.tag === x) && {
            id: Object.values(tags)
              .flat()
              .find((o) => o.tag === x)?.id,
          }),
        }
      })

    data.language = 'en'
    delete data.tagsList

    if (data?.entity) {
      data.entityConnections = data.entity[0].hasOwnProperty('role')
        ? data.entity
        : []
      delete data.entity
    }

    if (data?.individual) {
      data.individualConnections = data.individual[0].hasOwnProperty('role')
        ? data.individual
        : []
      delete data.individual
    }

    if (data?.info) {
      data.infoDocs = data.info === '<p><br></p>' ? '' : data.info
      delete data.info
    }

    if (data?.type?.length > 0) {
      data.relatedContent = data?.type
        .filter((x) => x?.value)
        .map((x) => {
          return {
            id: parseInt(x.value),
            type: x.label,
          }
        })
      delete data.related
      delete data.type
      delete data.id
    }

    if (data?.summary) {
      data.remarks = data?.summary?.replace(/(?:\r\n|\r|\n)/g, ' ')
      delete data.summary
    }

    if (status === 'add' && !params) {
      data?.image && data?.image === '' && delete data.image
      data?.thumbnail && data?.thumbnail === '' && delete data.thumbnail
    }

    if (status === 'edit' || params) {
      data?.image && data?.image.match(customFormats.url) && delete data.image

      data?.thumbnail &&
        data?.thumbnail.match(customFormats.url) &&
        delete data.thumbnail

      if (formData?.S4['S4_G4'].image === '') {
        data.image = ''
      }
      if (formData?.S4['S4_G4'].thumbnail === '') {
        data.thumbnail = ''
      }
    }

    const changes = getDifferences(pdata, data)

    if (status === 'add' && !params) {
      api
        .post('/technology', data)
        .then((res) => {
          if (translations.length > 0) {
            api
              .put(`/translations/technology/${res.data.id}`, {
                translations: translations,
                'topic-type': 'technology',
              })
              .then((langResp) => {
                console.log(langResp)
              })
              .catch((e) => {
                console.log(e)
                notification.error({ message: 'An error occured' })
              })
          }
          window.scrollTo({ top: 0 })
          initialFormData.update((e) => {
            e.data = initialData
          })
          setDisabledBtn({ disabled: true, type: 'default' })
          notification.success({ message: 'Resource successfully created' })
        })
        .catch(() => {
          notification.error({ message: 'An error occured' })
        })
        .finally(() => {
          setSending(false)
        })
    }
    if (status === 'edit' || params) {
      if (Object.keys(changes).length === 0) {
        return
      }
      delete data.version
      api
        .put(`/detail/${type}/${id || params}`, changes)
        .then(() => {
          if (translations.length > 0) {
            api
              .put(`/translations/technology/${params}`, {
                translations: translations,
                'topic-type': 'technology',
              })
              .then((langResp) => {
                console.log(langResp)
              })
              .catch((e) => {
                console.log(e)
                notification.error({ message: 'An error occured' })
              })
          }
          // scroll top
          window.scrollTo({ top: 0 })
          initialFormData.update((e) => {
            e.data = initialData
          })
          setDisabledBtn({ disabled: true, type: 'default' })
          notification.success({ message: 'Resource successfully updated' })
          router.push(`/${type}/${id || params}`)
        })
        .catch(() => {
          initialFormData.update((e) => {
            e.data = initialData
          })
          router.push(`/${type}/${id || params}`)
          notification.error({ message: 'An error occured' })
        })
        .finally(() => {
          setSending(false)
        })
    }
  }

  const handleOnSubmitCaseStudy = (formData) => {
    delete formData?.tabs
    delete formData?.steps
    delete formData?.required

    // # Transform data before sending to endpoint
    let data = {
      ...formData,
      resourceType: mainType,
      subContentType: subContentType,
      ...(capacityBuilding && { capacityBuilding: true }),
      source: source ? source : 'gpml',
    }

    let prevFormData = deepClone(prevData?.data)

    delete prevFormData?.tabs
    delete prevFormData?.steps
    delete prevFormData?.required

    let pdata = {
      ...prevFormData,
      resourceType: mainType,
      subContentType: subContentType,
      ...(capacityBuilding && { capacityBuilding: true }),
      source: source ? source : 'gpml',
    }

    transformFormData(data, formData, formSchema.schema.properties, true)
    transformFormData(pdata, prevFormData, formSchema.schema.properties, true)

    data.version = parseInt(formSchema.schema.version)
    pdata.version = parseInt(formSchema.schema.version)

    delete data?.S1
    delete data?.S2
    delete data?.S3
    delete data?.S4
    delete data?.S5
    delete data?.S6
    delete pdata?.S1
    delete pdata?.S2
    delete pdata?.S3
    delete pdata?.S4
    delete pdata?.S5
    delete pdata?.S6

    data.geoCoverageType = Object.keys(data.geoCoverageType)[0]

    delete data.orgName

    data.tags =
      formData.S4.S4_G3.tags &&
      formData.S4.S4_G3.tags.map((x) => {
        return {
          tag: x,
          ...(Object.values(tags)
            .flat()
            .find((o) => o.tag === x) && {
            id: Object.values(tags)
              .flat()
              .find((o) => o.tag === x)?.id,
          }),
        }
      })

    data.language = 'en'
    delete data?.tagsList

    if (!/^https?:\/\//i.test(data.url)) {
      data.url = 'http://' + data.url
    }

    if (data?.publishYear) {
      const publishYear = new Date(data.publishYear)
      data.publishYear = publishYear.getFullYear()
    }

    if (data.geoCoverageType === 'transnational') {
      if (
        data.geoCoverageValueTransnational &&
        data.geoCoverageValueTransnational.length > 0
      ) {
        data.geoCoverageCountryGroups = data.geoCoverageValueTransnational
          ? data.geoCoverageValueTransnational
              ?.filter((value) => Number(value) !== -1)
              .map((x) => parseInt(x))
          : []
        delete data.geoCoverageValueTransnational
      }
      if (data.geoCoverageCountries && data.geoCoverageCountries.length > 0) {
        data.geoCoverageCountries = data.geoCoverageCountries
          ? data.geoCoverageCountries.map((x) => parseInt(x))
          : []
        if (
          data.geoCoverageValueTransnational &&
          data.geoCoverageValueTransnational.length === 0
        ) {
          delete data.geoCoverageValueTransnational
        }
      }
    }

    if (data.geoCoverageType === 'national') {
      data.geoCoverageCountries = data.geoCoverageCountries.map((x) =>
        parseInt(x)
      )
      delete data.geoCoverageValueTransnational
    }

    if (data.geoCoverageType === 'sub-national') {
      if (status === 'add' && !params) {
        data.geoCoverageCountries = [
          parseInt(Object.keys(data.geoCoverageValueSubnational)),
        ]
        data.geoCoverageCountryStates = [Number(data.geoCoverageCountryStates)]
      } else {
        if (data.geoCoverageCountryStates.length === 0)
          delete data.geoCoverageCountryStates
        else
          data.geoCoverageCountryStates = [
            Number(data.geoCoverageCountryStates),
          ]
      }
      delete data.geoCoverageValueSubnational
      delete data.geoCoverageValueTransnational
    }

    if (data.geoCoverageType === 'global') {
      delete data.geoCoverageValueTransnational
      delete data.geoCoverageCountries
    }

    if (data?.urls) {
      data.urls = data.urls.map((x) => {
        return {
          url: x,
          lang: 'en',
        }
      })
    }

    if (data?.entity) {
      data.entityConnections = data.entity[0].hasOwnProperty('role')
        ? data.entity
        : []
      delete data.entity
    }

    if (data?.individual) {
      data.individualConnections = data.individual[0].hasOwnProperty('role')
        ? data.individual
        : []
      delete data.individual
    }

    if (data?.info) {
      data.infoDocs = data.info === '<p><br></p>' ? '' : data.info
      delete data.info
    }

    data.summary = data?.summary?.replace(/(?:\r\n|\r|\n)/g, ' ')

    if (data?.type?.length > 0) {
      data.relatedContent = data?.type
        .filter((x) => x?.value)
        .map((x) => {
          return {
            id: parseInt(x.value),
            type: x.label,
          }
        })
      delete data.related
      delete data.type
      delete data.id
    }

    if (status === 'add' && !params) {
      data?.image && data?.image === '' && delete data.image
    }

    if (status === 'edit' || params) {
      data?.image && data?.image.match(customFormats.url) && delete data.image

      if (formData?.S4['S4_G4'].image === '') {
        data.image = ''
      }
    }

    const changes = getDifferences(pdata, data)

    if (status === 'add' && !params) {
      api
        .post('/case-study', data)
        .then((res) => {
          if (translations.length > 0) {
            api
              .put(`/translations/resource/${res.data.id}`, {
                translations: translations,
                'topic-type': 'case_study',
              })
              .then((langResp) => {
                console.log(langResp)
              })
              .catch((e) => {
                console.log(e)
                notification.error({ message: 'An error occured' })
              })
          }
          // scroll top
          window.scrollTo({ top: 0 })
          initialFormData.update((e) => {
            e.data = initialData
          })
          setDisabledBtn({ disabled: true, type: 'default' })
          notification.success({ message: 'Resource successfully created' })
        })
        .catch(() => {
          notification.error({ message: 'An error occured' })
        })
        .finally(() => {
          setSending(false)
        })
    }
    if (status === 'edit' || params) {
      if (Object.keys(changes).length === 0) {
        return
      }
      delete data.version
      api
        .put(`/detail/${type}/${id || params}`, changes)
        .then(() => {
          if (translations.length > 0) {
            api
              .put(`/translations/case_study/${params}`, {
                translations: translations,
                'topic-type': 'technology',
              })
              .then((langResp) => {
                console.log(langResp)
              })
              .catch((e) => {
                console.log(e)
                notification.error({ message: 'An error occured' })
              })
          }
          // scroll top
          window.scrollTo({ top: 0 })
          initialFormData.update((e) => {
            e.data = initialData
          })
          setDisabledBtn({ disabled: true, type: 'default' })
          notification.success({ message: 'Resource successfully updated' })
          router.push(`/case-study/${id || params}`)
        })
        .catch(() => {
          initialFormData.update((e) => {
            e.data = initialData
          })
          router.push(`/case-study/${id || params}`)
          notification.error({ message: 'An error occured' })
        })
        .finally(() => {
          setSending(false)
        })
    }
  }

  const handleFormOnChange = useCallback(
    async ({ formData, schema }) => {
      if (status === 'add' && !params) {
        formData?.S4.S4_G4?.image === '' && delete formData?.S4.S4_G4?.image
      }
      if (
        (status === 'edit' || params) &&
        (formData?.S4.S4_G4?.image || formData?.S4.S4_G4?.image === '')
      ) {
        formData.S4.S4_G4.image =
          formData?.S4.S4_G4?.image !== '' ? formData?.S4.S4_G4?.image : ''
      }

      initialFormData.update((e) => {
        e.data = {
          ...e.data,
          ...formData,
        }
      })

      let updatedFormDataSchema = {}

      if (
        (formData?.S4.S4_G2.geoCoverageType === 'transnational' &&
          formData?.S4.S4_G2.geoCoverageValueTransnational) ||
        (formData?.S4.S4_G2.geoCoverageType === 'transnational' &&
          formData?.S4.S4_G2['S4_G2_24.3'])
      ) {
        let result = formSchema.schema.properties.S4.properties.S4_G2.required.filter(
          (value) => value !== 'geoCoverageCountries' && value !== 'S4_G2_24.4'
        )

        updatedFormDataSchema = {
          ...formSchema.schema,
          properties: {
            ...formSchema.schema.properties,
            S4: {
              ...formSchema.schema.properties.S4,
              properties: {
                ...formSchema.schema.properties.S4.properties,
                S4_G2: {
                  ...formSchema.schema.properties.S4.properties.S4_G2,
                  required: result,
                  properties: {
                    ...formSchema.schema.properties.S4.properties.S4_G2
                      .properties,
                    geoCoverageCountries: {
                      ...formSchema.schema.properties.S4.properties.S4_G2
                        .properties.geoCoverageCountries,
                      depend: {
                        id: 'geoCoverageValueTransnational',
                        value: ['-1'],
                      },
                    },
                  },
                },
              },
            },
          },
        }
      } else if (
        (formData?.S4.S4_G2.geoCoverageType === 'transnational' &&
          formData?.S4.S4_G2.geoCoverageCountries) ||
        (formData?.S4.S4_G2.geoCoverageType === 'transnational' &&
          formData?.S4.S4_G2['S4_G2_24.4'])
      ) {
        let result = formSchema.schema.properties.S4.properties.S4_G2.required.filter(
          (value) =>
            value !== 'geoCoverageValueTransnational' && value !== 'S4_G2_24.3'
        )
        updatedFormDataSchema = {
          ...formSchema.schema,
          properties: {
            ...formSchema.schema.properties,
            S4: {
              ...formSchema.schema.properties.S4,
              properties: {
                ...formSchema.schema.properties.S4.properties,
                S4_G2: {
                  ...formSchema.schema.properties.S4.properties.S4_G2,
                  required: result,
                },
              },
            },
          },
        }
      } else if (
        formData?.S4.S4_G2.geoCoverageType === 'sub-national' &&
        formData?.S4.S4_G2.geoCoverageValueSubnational &&
        formData?.S4.S4_G2.geoCoverageValueSubnational !==
          flexibleFormData?.data?.S4.S4_G2.geoCoverageValueSubnational
      ) {
        const state = await getStates(
          formData?.S4.S4_G2.geoCoverageValueSubnational
        )
        updatedFormDataSchema = {
          ...formSchema.schema,
          properties: {
            ...formSchema.schema.properties,
            S4: {
              ...formSchema.schema.properties.S4,
              properties: {
                ...formSchema.schema.properties.S4.properties,
                S4_G2: {
                  ...formSchema.schema.properties.S4.properties.S4_G2,
                  properties: {
                    ...formSchema.schema.properties.S4.properties.S4_G2
                      .properties,
                    geoCoverageCountryStates: {
                      ...formSchema.schema.properties.S4.properties.S4_G2
                        .properties.geoCoverageCountryStates,
                      enum: state?.map((x) => String(x.id)),
                      enumNames: state?.map((x) => x.name),
                    },
                  },
                },
              },
            },
          },
        }
      } else {
        updatedFormDataSchema = {
          ...schema,
        }
      }

      // setSchema(updatedFormDataSchema);

      // to overide validation
      let dependFields = []
      let requiredFields = []
      // this function eliminate required key from required list when that required form appear (show)
      collectDependSchemaRefactor(
        dependFields,
        formData,
        updatedFormDataSchema,
        requiredFields
      )

      setDependValue(dependFields)
      const requiredFilledIn = checkRequiredFieldFilledIn(
        formData,
        dependFields,
        requiredFields
      )
      let sectionRequiredFields = {}
      let groupRequiredFields = {}

      requiredFields.forEach(({ group, key, required }) => {
        let index = group ? group : key
        let filterRequired = required.filter((r) =>
          requiredFilledIn.includes(r)
        )
        sectionRequiredFields = {
          ...sectionRequiredFields,
          [index]: sectionRequiredFields?.[index]
            ? sectionRequiredFields?.[index].concat(filterRequired)
            : filterRequired,
        }
        if (!group) {
          groupRequiredFields = {
            ...groupRequiredFields,
            [key]: {
              ...groupRequiredFields[key],
              required: {
                [key]: filterRequired,
              },
            },
          }
        }
        if (group) {
          groupRequiredFields = {
            ...groupRequiredFields,
            [group]: {
              ...groupRequiredFields[group],
              required: {
                ...groupRequiredFields?.[group]?.required,
                [key]: filterRequired,
              },
            },
          }
        }
      })
      initialFormData.update((e) => {
        e.data = {
          ...e.data,
          required: sectionRequiredFields,
          S4: {
            ...e.data.S4,
            required: groupRequiredFields['S4'].required,
          },
          S5: {
            ...e.data.S5,
            required: groupRequiredFields['S5'].required,
          },
        }
      })
      // enable btn submit
      requiredFilledIn.length === 0 &&
        ((initialFormData?.currentState?.data.S4[
          'S4_G5'
        ].individual[0]?.hasOwnProperty('role') &&
          initialFormData?.currentState?.data.S4[
            'S4_G5'
          ].individual[0]?.hasOwnProperty('stakeholder')) ||
          (initialFormData?.currentState?.data.S4[
            'S4_G5'
          ].entity[0]?.hasOwnProperty('role') &&
            initialFormData?.currentState?.data.S4[
              'S4_G5'
            ].entity[0]?.hasOwnProperty('entity'))) === true &&
        setDisabledBtn({ disabled: false, type: 'primary' })
      requiredFilledIn.length !== 0 &&
        ((initialFormData?.currentState?.data.S4['S4_G5'].individual.length >
          0 &&
          initialFormData?.currentState?.data.S4[
            'S4_G5'
          ].individual[0]?.hasOwnProperty('role') &&
          initialFormData?.currentState?.data.S4[
            'S4_G5'
          ].individual[0]?.hasOwnProperty('stakeholder')) ||
          (initialFormData?.currentState?.data.S4[
            'S4_G5'
          ].entity[0]?.hasOwnProperty('role') &&
            initialFormData?.currentState?.data.S4[
              'S4_G5'
            ].entity[0]?.hasOwnProperty('entity'))) === true &&
        setDisabledBtn({ disabled: true, type: 'default' })
    },
    [initialFormData, formSchema, setDisabledBtn]
  )
  const handleTransformErrors = (errors, dependValue) => {
    // custom errors handle
    ;['.S4', '.S5'].forEach((x) => {
      let index = dependValue.indexOf(x)
      index !== -1 && dependValue.splice(index, 1)
    })
    let res = overideValidation(errors, dependValue)

    // overiding image validation when edit
    if (
      (res.length > 0 &&
        (status === 'edit' || params) &&
        flexibleFormData?.data?.S4['S4_G4'].image &&
        flexibleFormData?.data?.S4['S4_G4'].image.match(customFormats.url)) ||
      !flexibleFormData?.data?.S4['S4_G4'].image
    ) {
      res = res.filter(
        (x) => x?.params && x.params?.format && x.params.format !== 'data-url'
      )
    }

    res.length === 0 && setHighlight(false)
    if (res.length > 0) {
      const descriptionList = res.map((r, index) => {
        const { property, message } = r
        const tabSection = property
          .replace('.', '')
          .replace("['", '_')
          .replace("']", '_')
          .split('_')[0]
        const tabSectionTitle = tabsData.find((x) => x.key === tabSection)
          ?.title
        return (
          <li key={`${property}-${index}`}>
            {tabSectionTitle}:{' '}
            <Typography.Text type="danger">{message}</Typography.Text>
          </li>
        )
      })
      notification.error({
        message: 'Error',
        description: <ul>{descriptionList}</ul>,
      })
    }
    return res
  }

  const getStates = (id) => {
    return api
      .get(`/country-state?countries_ids=${parseInt(id)}`)
      .then((d) => {
        initialFormData.update((e) => {
          e.data = {
            ...e.data,
            S4: {
              ...e.data.S4,
              S4_G2: {
                ...e.data.S4.S4_G2,
                geoCoverageCountryStates: '',
              },
            },
          }
        })
        return d.data.countryStates
      })
      .catch((e) => {
        console.log(e)
      })
  }

  return (
    <div className="add-flexible-form">
      <>
        <Form
          idPrefix="flexibleForm"
          schema={schema}
          uiSchema={uiSchema[selectedMainContentType]}
          formData={flexibleFormData.data}
          onChange={(e) => handleFormOnChange(e)}
          onSubmit={(e) => handleOnSubmit(e)}
          ArrayFieldTemplate={ArrayFieldTemplate}
          ObjectFieldTemplate={ObjectFieldTemplate}
          FieldTemplate={FieldTemplate}
          widgets={widgets}
          customFormats={customFormats}
          transformErrors={(errors) =>
            handleTransformErrors(errors, dependValue)
          }
          showErrorList={false}
          formContext={flexibleFormData}
        >
          <button ref={btnSubmit} type="submit" style={{ display: 'none' }}>
            Fire
          </button>
        </Form>
      </>
    </div>
  )
}

export default FlexibleForm
