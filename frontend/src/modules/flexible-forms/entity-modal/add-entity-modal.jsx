import React, { useEffect, useCallback, useState, useRef } from 'react'
import { UIStore } from '../../../store'
import { Store } from 'pullstate'
import { Modal } from 'antd'
import styles from './modal.module.scss'
import { withTheme } from '@rjsf/core'
import { Theme as AntDTheme } from '@rjsf/antd'
import { useSchema, useUiSchema } from './form-schema'
import ObjectFieldTemplate from '../../../utils/forms/object-template'
import ArrayFieldTemplate from '../../../utils/forms/array-template'
import FieldTemplate from '../../../utils/forms/field-template'
import widgets from '../../../utils/forms'
import {
  collectDependSchema,
  overideValidation,
  checkRequiredFieldFilledIn,
  handleGeoCoverageValue,
  customFormats,
} from '../../../utils/forms'
import cloneDeep from 'lodash/cloneDeep'
import isEmpty from 'lodash/isEmpty'
import api from '../../../utils/api'
import { notification } from 'antd'
import uniqBy from 'lodash/uniqBy'
import sortBy from 'lodash/sortBy'
import Button from '../../../components/button'
import { Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const Form = withTheme(AntDTheme)

const getSchema = (
  { countries, regionOptions, meaOptions, transnationalOptions, schema },
  loading
) => {
  const prop = cloneDeep(schema.properties)
  prop.country.enum = countries?.map((x, i) => x.id)
  prop.country.enumNames = countries?.map((x, i) => x.name)

  prop.geoCoverageValueRegional.enum = regionOptions?.map((x) => String(x.id))
  prop.geoCoverageValueRegional.enumNames = regionOptions?.map((x) => x.name)
  prop.geoCoverageValueTransnational.enum = transnationalOptions?.map((x, i) =>
    String(x.id)
  )
  prop.geoCoverageValueTransnational.enumNames = transnationalOptions?.map(
    (x, i) => x.name
  )
  prop.geoCoverageCountries.enum = countries?.map((x) => String(x.id))
  prop.geoCoverageCountries.enumNames = countries?.map((x) => x.name)
  prop.geoCoverageValueGlobalSpesific.enum = meaOptions?.map((x) =>
    String(x.id)
  )
  prop.geoCoverageValueGlobalSpesific.enumNames = meaOptions?.map((x) => x.name)

  return {
    schema: {
      ...schema,
      properties: prop,
    },
    loading: loading,
  }
}

export const entityData = new Store({
  data: {},
  editId: null,
})

const ModalAddEntity = ({ visible, close, isMember, setEntity, tag }) => {
  const {
    countries,
    organisations,
    tags,
    regionOptions,
    meaOptions,
    transnationalOptions,
    formStep,
    formEdit,
    geoCoverageTypeOptions,
    representativeGroup,
  } = UIStore.useState((s) => ({
    countries: s.countries,
    organisations: s.organisations,
    tags: s.tags,
    regionOptions: s.regionOptions,
    meaOptions: s.meaOptions,
    transnationalOptions: s.transnationalOptions,
    formStep: s.formStep,
    formEdit: s.formEdit,
    geoCoverageTypeOptions: s.geoCoverageTypeOptions,
    representativeGroup: s.representativeGroup,
  }))

  const schema = useSchema({
    countries,
    geoCoverageTypeOptions,
    representativeGroup,
  })

  const formData = entityData.useState()
  const { editId, data } = formData
  const { status, id } = formEdit.entity
  const [dependValue, setDependValue] = useState([])
  const [formSchema, setFormSchema] = useState({
    schema: schema,
    loading: true,
  })
  const [schemaState, setSchema] = useState(formSchema.schema)
  const [disabledBtn, setDisabledBtn] = useState({
    disabled: true,
    type: 'default',
  })
  const btnSubmit = useRef()

  const [sending, setSending] = useState(false)

  const isLoaded = useCallback(() => {
    return Boolean(!isEmpty(countries))
  }, [countries])

  useEffect(() => {
    if (isLoaded()) {
      setFormSchema(
        getSchema(
          {
            countries,
            organisations,
            tags,
            regionOptions,
            meaOptions,
            transnationalOptions,
            schema,
          },
          false
        )
      )
    }
  }, [getSchema, isLoaded])

  const handleOnClickBtnSubmit = (e) => {
    btnSubmit.current.click()
  }

  const handleOnSubmit = ({ formData }) => {
    let data = {
      ...formData,
      stakeholder: '',
      isMember: false,
    }
    data = handleGeoCoverageValue(data, formData, countries)

    if (data.geoCoverageType === 'transnational') {
      if (
        data.geoCoverageValueTransnational &&
        data.geoCoverageValueTransnational.length > 0
      ) {
        data.geoCoverageCountryGroups = data.geoCoverageValueTransnational
          ? data.geoCoverageValueTransnational.map((x) => parseInt(x))
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
      delete data.geoCoverageValueTransnational
    }

    if (data.geoCoverageType === 'sub-national') {
      data.geoCoverageCountries = data.geoCoverageCountries.map((x) =>
        parseInt(x)
      )
      delete data.geoCoverageValueTransnational
    }

    if (tag) {
      data.tags = [
        {
          tag: tag,
          tag_category: 'general',
        },
      ]
    }

    data.reviewStatus = 'APPROVED'

    delete data.geoCoverageValue

    setSending(true)

    api
      .post('/organisation', data)
      .then((res) => {
        setEntity(res.data.org)
        UIStore.update((e) => {
          e.formStep = {
            ...e.formStep,
            entity: 2,
          }
        })
        // scroll top
        window.scrollTo({ top: 0 })
        entityData.update((e) => {
          e.data = {}
        })
        Promise.all([
          api.get('/organisation'),
          api.get('/non-member-organisation'),
        ]).then((res) => {
          const [organisation, nonMemberOrganisations] = res
          UIStore.update((e) => {
            e.organisations = uniqBy(
              sortBy(organisation.data, ['name'])
            ).sort((a, b) => a.name.localeCompare(b.name))
            e.nonMemberOrganisations = uniqBy(
              sortBy(nonMemberOrganisations.data, ['name'])
            ).sort((a, b) => a.name.localeCompare(b.name))
          })
        })
        close()
        setDisabledBtn({ disabled: true, type: 'default' })
      })
      .catch((err) => {
        notification.error({
          message: err?.response?.data?.reason
            ? err?.response?.data?.reason
            : 'An error occured',
        })
      })
      .finally(() => {
        setSending(false)
      })
  }

  const handleFormOnChange = ({ formData }) => {
    entityData.update((e) => {
      e.data = formData
    })

    let updatedFormDataSchema = {}

    if (
      formData?.geoCoverageType === 'transnational' &&
      formData?.geoCoverageValueTransnational
    ) {
      let result = formSchema.schema.required.filter(
        (value) => value !== 'geoCoverageCountries'
      )
      updatedFormDataSchema = {
        ...formSchema.schema,
        required: result,
      }
    } else if (
      formData?.geoCoverageType === 'transnational' &&
      formData?.geoCoverageCountries
    ) {
      let result = formSchema.schema.required.filter(
        (value) => value !== 'geoCoverageValueTransnational'
      )
      updatedFormDataSchema = {
        ...formSchema.schema,
        required: result,
      }
    } else {
      updatedFormDataSchema = formSchema.schema
    }

    setSchema(updatedFormDataSchema)

    // to overide validation
    let dependFields = []
    let requiredFields = []
    collectDependSchema(
      dependFields,
      formData,
      updatedFormDataSchema,
      requiredFields
    )
    setDependValue(dependFields)
    // enable btn submit
    const requiredFilledIn = checkRequiredFieldFilledIn(
      formData,
      dependFields,
      requiredFields
    )
    requiredFilledIn.length === 0 &&
      setDisabledBtn({ disabled: false, type: 'primary' })
    requiredFilledIn.length !== 0 &&
      setDisabledBtn({ disabled: true, type: 'default' })
  }

  const handleTransformErrors = (errors, dependValue) => {
    let res = overideValidation(errors, dependValue)
    return res
  }

  const uiSchema = useUiSchema()

  return (
    <Modal
      width={600}
      visible={visible}
      title="Create New Entity"
      className={`${styles.addEntityModal} add-entity-modal`}
      footer={[
        <Button className="close-button" onClick={(e) => close()} type="link">
          <Trans>Cancel</Trans>
        </Button>,
        <Button
          size="small"
          key="submit"
          className="custom-button"
          onClick={(e) => handleOnClickBtnSubmit(e)}
          disabled={disabledBtn.disabled}
        >
          <Trans>Submit</Trans>
        </Button>,
      ]}
      closable={false}
    >
      <div>
        <Form
          idPrefix="action-plan"
          schema={formSchema.schema}
          uiSchema={uiSchema}
          formData={data}
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
        >
          <button ref={btnSubmit} type="submit" style={{ display: 'none' }}>
            Fire
          </button>
        </Form>
      </div>
    </Modal>
  )
}

export default ModalAddEntity
