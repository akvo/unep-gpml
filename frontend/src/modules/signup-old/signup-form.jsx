import { UIStore } from '../../store'
import React, { useState, useEffect, useContext } from 'react'
import { Form, Switch, Select } from 'antd'
import { Form as FinalForm, FormSpy, Field } from 'react-final-form'
import arrayMutators from 'final-form-arrays'
import styles from './styles.module.scss'
import Checkbox from 'antd/lib/checkbox/Checkbox'
import {
  LinkedinOutlined,
  TwitterOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { FieldsFromSchema } from '../../utils/form-utils'
import cloneDeep from 'lodash/cloneDeep'
import isEmpty from 'lodash/isEmpty'
import { storage } from '../../utils/storage'
import { useRef } from 'react'
import { Trans, t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import CatTagSelect from '../../components/cat-tag-select/cat-tag-select'
import FormItem from 'antd/lib/form/FormItem'
import { useRouter } from 'next/router'

const { sectorOptions } = UIStore.currentState

export const useDefaultFormSchema = () => {
  const { i18n } = useLingui()

  const defaultFormSchema = {
    personalDetails: {
      account: {
        title: {
          label: i18n._(t`Title`),
          required: true,
          control: 'select',
          options: ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'].map((it) => ({
            value: it,
            label: it,
          })),
        },
        firstName: { label: i18n._(t`First name`), required: true },
        lastName: { label: i18n._(t`Last name`), required: true },
        email: {
          label: i18n._(t`Email`),
          disabled: true,
          required: true,
        },
      },
      socialLocation: {
        linkedIn: { label: i18n._(t`LinkedIn`), prefix: <LinkedinOutlined /> },
        twitter: { label: i18n._(t`Twitter`), prefix: <TwitterOutlined /> },
        picture: {
          label: i18n._(t`Photo`),
          control: 'file',
          maxFileSize: 1,
          accept: 'image/*',
        },
        country: {
          label: i18n._(t`Country`),
          required: true,
          order: 3,
          control: 'select',
          showSearch: true,
          allowClear: true,
          options: [],
          autoComplete: 'on',
        },
      },
    },
    organisation: {
      jobTitle: {
        label: i18n._(t`Job Tilte`),
      },
    },
    expertiesActivities: {
      seeking: {
        label: i18n._(t`Seeking`),
        required: true,
        control: 'select',
        mode: 'multiple',
        showSearch: true,
        options: [],
      },
      offering: {
        label: i18n._(t`Offering`),
        required: true,
        control: 'select',
        mode: 'multiple',
        showSearch: true,
        options: [],
      },
      about: {
        label: i18n._(t`About yourself`),
        required: true,
        control: 'textarea',
        placeholder: 'Max 150 words',
      },
      cv: {
        label: i18n._(t`CV / Portfolio`),
        control: 'file',
        maxFileSize: 5,
        accept:
          '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,text/plain',
      },
    },
  }

  return defaultFormSchema
}

const ReviewText = ({ reviewStatus }) => {
  if (reviewStatus === 'SUBMITTED') {
    return <div className="review-status">WAITING FOR APPROVAL</div>
  }
  const reviewIcon =
    reviewStatus === 'APPROVED' ? (
      <CheckCircleOutlined />
    ) : (
      <ExclamationCircleOutlined />
    )
  if (
    storage.getCookie('profileMessage') === '0' &&
    reviewStatus === 'APPROVED'
  ) {
    return ''
  }
  return (
    <div className={`review-status ${reviewStatus.toLowerCase()}`}>
      {reviewIcon} SUBMISSION IS {reviewStatus}
    </div>
  )
}

const SignupForm = ({
  onSubmit,
  handleFormRef,
  initialValues,
  handleSubmitRef,
  isModal,
}) => {
  const {
    countries,
    tags,
    organisations,
    organisationType,
    nonMemberOrganisations,
  } = UIStore.useState((s) => ({
    countries: s.countries,
    tags: s.tags,
    organisations: s.organisations,
    organisationType: s.organisationType,
    nonMemberOrganisations: s.nonMemberOrganisations,
  }))
  const router = useRouter()
  const [noOrg, setNoOrg] = useState(false)
  const [formInitialValues, setInitialValues] = useState(false)
  const [pubEmail, setPubEmail] = useState({
    checked: false,
    text: 'Show my email address on public listing',
  })
  const [orgValue, setOrgValue] = useState('')
  const [nonMemberOrgValue, setNonMemberOrgValue] = useState('')
  const [disabled, setDisabled] = useState({
    nonMemberOrgValue: false,
    orgValue: false,
  })

  const [enableNotification, setEnableNotification] = useState(false)
  const defaultFormSchema = useDefaultFormSchema()

  const formRef = useRef()
  const formContainer = !isModal ? 'signupFormGrid' : 'signupForm'
  const sectionGrid = !isModal ? 'section-grid' : 'section'

  const [formSchema, setFormSchema] = useState({})

  useEffect(() => {
    const newSchema = cloneDeep(defaultFormSchema)

    const array = Object.keys(tags)
      .map((k) => tags[k])
      .flat()

    newSchema['expertiesActivities'].offering.options = array?.map((x) => ({
      value: x.tag,
      label: x.tag,
    }))
    newSchema['expertiesActivities'].seeking.options = array?.map((x) => ({
      value: x.tag,
      label: x.tag,
    }))

    newSchema['personalDetails'][
      'socialLocation'
    ].country.options = countries.map((x) => ({
      value: x.id,
      label: x.name,
    }))
    setFormSchema(newSchema)
  }, [organisations, nonMemberOrganisations, tags, countries])

  const handleChangePrivateCitizen = ({ target: { checked } }) => {
    setNoOrg(checked)
    const newSchema = cloneDeep(formSchema)

    if (checked) {
      setDisabled((prevState) => ({
        ...prevState,
        nonMemberOrgValue: true,
        orgValue: true,
      }))
      setOrgValue('')
      setNonMemberOrgValue('')
    } else {
      setDisabled((prevState) => ({
        ...prevState,
        orgValue: false,
        nonMemberOrgValue: false,
      }))
      if (initialValues.org)
        if (initialValues.org?.isMember) {
          setOrgValue(initialValues['org']['id'])
        } else {
          setNonMemberOrgValue(initialValues['org']['id'])
        }
    }
  }

  const handleChangePublicEmail = (checked) => {
    const preffix = !checked ? "Don't show" : 'Show'
    setPubEmail({
      checked: checked,
      text: `${preffix} my email address on public listing`,
    })
    setTimeout(() => {
      formRef.current?.change('ts', new Date().getTime())
      formRef.current?.change('publicEmail', checked)
    })
  }

  useEffect(() => {
    if (initialValues) {
      handleChangePublicEmail(initialValues.publicEmail)
      setEnableNotification(initialValues.chatEmailNotifications)
    }
    if (initialValues && initialValues?.org === null) {
      handleChangePrivateCitizen({ target: { checked: true } })
      setDisabled((prevState) => ({
        ...prevState,
        orgValue: true,
        nonMemberOrgValue: true,
      }))
    } else if (initialValues?.org) {
      if (initialValues.org.isMember) {
        setOrgValue(initialValues['org']['id'])
        setDisabled((prevState) => ({
          ...prevState,
          nonMemberOrgValue: true,
          orgValue: false,
        }))
      } else {
        setNonMemberOrgValue(initialValues['org']['id'])
        setDisabled((prevState) => ({
          ...prevState,
          orgValue: true,
          nonMemberOrgValue: false,
        }))
      }
    }
  }, [initialValues]) // eslint-disable-line

  useEffect(() => {
    setInitialValues({
      ...initialValues,
      seeking: initialValues?.seeking?.map((x) => x),
      offering: initialValues?.offering?.map((x) => x),
    })
  }, [initialValues])

  const handleOrgChange = (value) => {
    setOrgValue(value)
    if (value) {
      setNonMemberOrgValue('')
      setDisabled((prevState) => ({
        ...prevState,
        orgValue: false,
        nonMemberOrgValue: true,
      }))
    }
  }

  const handleNonMemberOrgChange = (value) => {
    setNonMemberOrgValue(value)
    if (value) {
      setOrgValue('')
      setDisabled((prevState) => ({
        ...prevState,
        orgValue: true,
        nonMemberOrgValue: false,
      }))
    }
  }

  if (Object.keys(formSchema).length === 0) {
    return <>Loading....</>
  }

  const required = (value) => (value ? undefined : 'Required')

  const handleNotification = (value) => {
    setEnableNotification(value)
    router.push({
      pathname: '/unsubscribe-chat',
      query: { id: initialValues.id },
    })
  }

  return (
    <Form layout="vertical">
      <FinalForm
        initialValues={formInitialValues || {}}
        subscription={{}}
        mutators={{ ...arrayMutators }}
        onSubmit={(vals) => {
          const data = {
            ...vals,
            ...(nonMemberOrgValue && {
              org: {
                id: nonMemberOrgValue,
              },
            }),
            ...(orgValue && {
              org: {
                id: orgValue,
              },
            }),
          }
          onSubmit(data)
        }}
        render={({ handleSubmit, form, values, ...props }) => {
          if (handleSubmitRef) {
            handleSubmitRef(handleSubmit)
          }
          if (handleFormRef) {
            handleFormRef(form)
          }
          formRef.current = form
          return (
            <>
              {initialValues?.reviewStatus && <ReviewText {...initialValues} />}
              <div className={styles[formContainer]}>
                <div className={sectionGrid}>
                  <h2>
                    <Trans>Personal details</Trans>
                  </h2>
                  <FieldsFromSchema
                    schema={formSchema?.['personalDetails']?.['account']}
                  />
                  <div className="public-email-container">
                    <Switch
                      key="publicEmail"
                      name="publicEmail"
                      size="small"
                      checked={pubEmail.checked}
                      onChange={handleChangePublicEmail}
                    />
                    &nbsp;&nbsp;&nbsp;{pubEmail.text}
                  </div>
                  <FieldsFromSchema
                    schema={formSchema?.['personalDetails']?.['socialLocation']}
                  />
                </div>
                <div className={sectionGrid}>
                  <h2>
                    <Trans>Entity details</Trans>
                  </h2>
                  <Checkbox
                    className="org-check"
                    checked={noOrg}
                    onChange={handleChangePrivateCitizen}
                  >
                    <Trans>I am a private citizen</Trans>
                  </Checkbox>
                  <FieldsFromSchema schema={formSchema?.['organisation']} />
                  <Form.Item label={t`GPML Entity`}>
                    <Field name="org.id">
                      {({ input, meta }) => (
                        <Select
                          {...input}
                          onChange={handleOrgChange}
                          allowClear
                          placeholder={t`Start typing...`}
                          size="small"
                          value={orgValue}
                          disabled={disabled.orgValue}
                          onClear={() => {
                            setOrgValue('')
                            setDisabled((prevState) => ({
                              ...prevState,
                              orgValue: false,
                              nonMemberOrgValue: false,
                            }))
                          }}
                        >
                          {organisations &&
                            organisations.map((value, i) => (
                              <Select.Option
                                key={String(value.id) + i.toString(36)}
                                value={value.id}
                              >
                                {value.name}
                              </Select.Option>
                            ))}
                        </Select>
                      )}
                    </Field>
                  </Form.Item>
                  <Form.Item label={t`Non Member Entity`}>
                    <Field name="nonMemberOrganisation">
                      {({ input, meta }) => (
                        <Select
                          {...input}
                          onChange={handleNonMemberOrgChange}
                          allowClear
                          placeholder={t`Start typing...`}
                          size="small"
                          value={nonMemberOrgValue}
                          disabled={disabled.nonMemberOrgValue}
                          onClear={() => {
                            setNonMemberOrgValue('')
                            setDisabled((prevState) => ({
                              ...prevState,
                              orgValue: false,
                              nonMemberOrgValue: false,
                            }))
                          }}
                        >
                          {nonMemberOrganisations &&
                            nonMemberOrganisations.map((value, i) => (
                              <Select.Option
                                key={String(value.id) + i.toString(36)}
                                value={value.id}
                              >
                                {value.name}
                              </Select.Option>
                            ))}
                        </Select>
                      )}
                    </Field>
                  </Form.Item>
                </div>
                <div className={sectionGrid}>
                  <h2>
                    <Trans>Expertise and activities</Trans>
                  </h2>
                  <Form.Item label={t`Offering`}>
                    <Field name="offering" style={{ width: '100%' }}>
                      {({ input, meta }) => {
                        const handleChange = (selectedValue) => {
                          const isSelected = input.value.includes(
                            selectedValue.toLowerCase()
                          )
                          let newValue
                          if (isSelected) {
                            newValue = input.value.filter(
                              (value) => value !== selectedValue.toLowerCase()
                            )
                          } else {
                            newValue = [
                              ...input.value,
                              selectedValue.toLowerCase(),
                            ]
                          }

                          input.onChange(newValue)
                        }

                        const handleRemove = (selectedValue) => {
                          const newValue = input.value.filter(
                            (value) => value !== selectedValue
                          )
                          input.onChange(newValue)
                        }

                        const hasError = !meta.valid
                        const validVal =
                          input?.value && meta.valid ? 'success' : null
                        const validateStatus = hasError ? 'error' : validVal
                        return (
                          <FormItem
                            for="offering"
                            validateStatus={validateStatus}
                          >
                            <CatTagSelect
                              handleChange={handleChange}
                              meta={meta}
                              value={input.value ? input.value : undefined}
                              handleRemove={handleRemove}
                            />
                          </FormItem>
                        )
                      }}
                    </Field>
                  </Form.Item>
                  <Form.Item label={t`Seeking`}>
                    <Field name="seeking" style={{ width: '100%' }}>
                      {({ input, meta }) => {
                        const handleChange = (selectedValue) => {
                          const isSelected = input.value.includes(selectedValue)
                          let newValue
                          if (isSelected) {
                            newValue = input.value.filter(
                              (value) => value !== selectedValue.toLowerCase()
                            )
                          } else {
                            newValue = [
                              ...input.value,
                              selectedValue.toLowerCase(),
                            ]
                          }

                          input.onChange(newValue)
                        }

                        const handleRemove = (selectedValue) => {
                          const newValue = input.value.filter(
                            (value) => value !== selectedValue
                          )
                          input.onChange(newValue)
                        }

                        const hasError = !meta.valid
                        const validVal =
                          input?.value && meta.valid ? 'success' : null
                        const validateStatus = hasError ? 'error' : validVal
                        return (
                          <FormItem
                            for="seeking"
                            validateStatus={validateStatus}
                          >
                            <CatTagSelect
                              handleChange={handleChange}
                              meta={meta}
                              value={input.value ? input.value : undefined}
                              handleRemove={handleRemove}
                            />
                          </FormItem>
                        )
                      }}
                    </Field>
                  </Form.Item>
                  <div className="notification-container">
                    <Switch
                      key="enableNotification"
                      name="enableNotification"
                      size="small"
                      checked={enableNotification}
                      onChange={handleNotification}
                    />
                    Receive Email Notifications for Forum Channel Activity
                  </div>
                </div>
              </div>
            </>
          )
        }}
      />
    </Form>
  )
}

export default SignupForm
