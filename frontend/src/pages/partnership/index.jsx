import React, { useEffect, useRef, useState } from 'react'
import styles from './index.module.scss'
import {
  Col,
  Image,
  Row,
  Input,
  Radio,
  Space,
  Upload,
  Select,
  Checkbox,
  notification,
  Card,
  Spin,
} from 'antd'
import { Trans, t } from '@lingui/macro'
import { Form as FinalForm, Field } from 'react-final-form'
import Button from '../../components/button'
import FormLabel from '../../components/form-label'
import { UIStore } from '../../store'
import { UploadFileIcon } from '../../components/icons'
import CatTagSelect from '../../components/cat-tag-select/cat-tag-select'
import api from '../../utils/api'
import { updateStatusProfile } from '../../utils/profile'
const { Dragger } = Upload
const { Option } = Select
import { useRouter } from 'next/router'
import { auth0Client } from '../../utils/misc'
import { loadCatalog } from '../../translations/utils'

function Partnership({ isAuthenticated }) {
  const router = useRouter()
  const {
    representativeGroup,
    countries,
    profile,
    tags,
    transnationalOptions,
  } = UIStore.currentState
  const [login, setLogin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialValues, setInitialValues] = useState(null)
  const containerRef = useRef(null)

  const onSubmit = async (values) => {
    const tagsArray = values.tags.map((tag) => tag.toLowerCase())
    const matchedTags = tagsArray.map((tagValue) => {
      const lowerCaseTagValue = tagValue.toLowerCase()

      let foundTagCategory = null
      let foundTag = null

      Object.keys(tags).forEach((tagCategory) => {
        if (!foundTag) {
          foundTag = tags[tagCategory].find(
            (o) => o.tag.toLowerCase() === lowerCaseTagValue
          )
          if (foundTag) {
            foundTagCategory = tagCategory
          }
        }
      })

      if (foundTag) {
        return { ...foundTag, tag_category: foundTagCategory }
      } else {
        return { tag: tagValue, tag_category: 'general' }
      }
    })

    const data = {
      name: values.orgName,
      url: ensureHttps(values.url),
      is_member: false,
      country: values.orgHeadquarter,
      geo_coverage_type: values.geoCoverageType,
      tags: matchedTags,
      program: values.program,
      ...(values.geo_coverage_countries && {
        geo_coverage_countries: values.geo_coverage_countries,
      }),
      ...(values.geo_coverage_country_groups && {
        geo_coverage_country_groups: [values.geo_coverage_country_groups],
      }),
    }

    if (profile && Object.keys(profile).length > 0) {
      router.push('/partnership?submitted=true')
      try {
        let sendData = { ...data }
        delete sendData.program
        const res = await createOrg(sendData)
        if ([200, 201].includes(res.status)) {
          await updateProfile(res.data.org, values.type)
        }
      } catch (err) {
        handleSubmissionError(err)
      }
    } else {
      localStorage.setItem(
        'partnerValue',
        JSON.stringify({ ...data, type: values.type })
      )
      if (login) {
        const username = values.email
        const password = values.password
        auth0Client.login(
          {
            realm: 'Username-Password-Authentication',
            username,
            password,
            redirectUri: `${window.location.origin}/partnership`,
            state: JSON.stringify({
              redirectTo: `${window.location.origin}/partnership`,
            }),
          },
          (err, authResult) => {
            if (err) {
              notification.error({
                message: err.description,
              })
              return
            }
          }
        )
      } else {
        auth0Client.redirect.signupAndLogin(
          {
            connection: 'Username-Password-Authentication',
            email: values.email,
            password: values.password,
            user_metadata: {
              publicEmail: false.toString(),
              country: '',
              lastName: values.fname,
              firstName: values.lname,
            },
            redirectUri: `${window.location.origin}/partnership`,
            state: JSON.stringify({
              redirectTo: `${window.location.origin}/partnership`,
            }),
          },
          function (err) {
            if (err) {
              notification.error({
                message: err.description,
              })
              return err
            } else {
            }
          }
        )
      }
    }
  }

  const createOrg = (data) => {
    return api.post('/organisation', data)
  }

  const updateProfile = async (data, type) => {
    setLoading(true)
    delete data.isMember
    try {
      const profileRes = await api.put('/profile', {
        org: {
          id: data.id,
        },
      })

      setTimeout(async () => {
        await api.put(`/organisation/${data.id}/request-membership`, {
          ...data,
          type: representativeGroup.find((item) => item.code === type)?.name,
          authorize_submission: true,
        })
      }, 300)

      updateStatusProfile(profileRes.data)

      setTimeout(async () => {
        try {
          const p = await api.get('/profile')
          UIStore.update((e) => {
            e.profile = {
              ...p.data,
            }
          })
        } catch (err) {
          handleSubmissionError(err)
        }
      }, 1000)
      setLoading(false)
      localStorage.removeItem('partnerValue')
    } catch (err) {
      handleSubmissionError(err)
      localStorage.removeItem('partnerValue')
      setLoading(false)
    }
  }

  useEffect(() => {
    const submitData = async () => {
      const shouldSubmit = localStorage.getItem('partnerValue')
      if (shouldSubmit) {
        const values = JSON.parse(shouldSubmit)
        const data = {
          name: values.name,
          url: values.url,
          is_member: false,
          country: values.country,
          geo_coverage_type: values.geo_coverage_type,
          tags: values.tags,
          program: values.program,
          type: values.type,
          ...(values.geo_coverage_countries && {
            geo_coverage_countries: values.geo_coverage_countries,
          }),
          ...(values.geo_coverage_country_groups && {
            geo_coverage_country_groups: values.geo_coverage_country_groups,
          }),
        }
        setInitialValues({
          orgName: data.name,
          url: data.url,
          is_member: false,
          orgHeadquarter: data.country,
          geoCoverageType: data.geo_coverage_type,
          tags: data.tags.map((t) => t.tag.toLowerCase()),
          program: data.program,
          acceptTerms: true,
          type: values.type,
          ...(values.geo_coverage_countries && {
            geo_coverage_countries: values.geo_coverage_countries,
          }),
          ...(values.geo_coverage_country_groups && {
            geo_coverage_country_groups: [values.geo_coverage_country_groups],
          }),
        })
        if (isAuthenticated && profile && Object.keys(profile).length > 0) {
          try {
            let sendData = { ...data }
            delete sendData.program
            const res = await createOrg(sendData)
            if ([200, 201].includes(res.status)) {
              await updateProfile(res.data.org, values.type)
              router.push('/partnership?submitted=true')
            }
          } catch (err) {
            handleSubmissionError(err)
          }
        }
      }
    }

    submitData()
  }, [isAuthenticated, profile])

  const required = (value, allValues, fieldName) => {
    if (!value) {
      return 'Required'
    }

    if (fieldName === 'password') {
      const uppercaseRegExp = /(?=.*?[A-Z])/
      const lowercaseRegExp = /(?=.*?[a-z])/
      const digitsRegExp = /(?=.*?[0-9])/
      const specialCharRegExp = /(?=.*?[#?!@$%^&*-{}])/
      const minLengthRegExp = /.{8,}/
      const passwordLength = value?.length
      const uppercasePassword = uppercaseRegExp.test(value)
      const lowercasePassword = lowercaseRegExp.test(value)
      const digitsPassword = digitsRegExp.test(value)
      const specialCharPassword = specialCharRegExp.test(value)
      const minLengthPassword = minLengthRegExp.test(value)
      let errMsg = ''
      if (passwordLength === 0) {
        errMsg = 'Password is empty'
      } else if (!uppercasePassword) {
        errMsg = 'At least one Uppercase'
      } else if (!lowercasePassword) {
        errMsg = 'At least one Lowercase'
      } else if (!digitsPassword) {
        errMsg = 'At least one digit'
      } else if (!specialCharPassword) {
        errMsg = 'At least one Special Characters'
      } else if (!minLengthPassword) {
        errMsg = 'At least minumum 8 characters'
      } else {
        errMsg = ''
      }
      return errMsg
    }

    if (fieldName === 'rpassword' && value !== allValues.password) {
      return 'Passwords do not match'
    }

    return undefined
  }

  useEffect(() => {
    if (containerRef.current && router.query.submitted === 'true') {
      window.scrollTo({
        top: containerRef.current.offsetTop,
        left: 0,
        behavior: 'smooth',
      })
    }
  }, [router])

  return (
    <div className={styles.partnership}>
      <div className="hero">
        <div className="container">
          <Row align="middle" gutter={[24, 16]}>
            <Col xs={24} sm={24} lg={15} xl={15}>
              <div class="header">
                <h1>
                  <Trans>
                    <span>Join the multi-stakeholder partnership</span> which
                    brings together all the actors working on plastic pollution
                    and marine litter prevention and reduction.
                  </Trans>
                </h1>
              </div>
            </Col>
            <Col xs={24} sm={24} md={9} lg={9} xl={9} className="hide-mobile">
              <Image src="/partnership.png" alt="hero" preview={false} />
            </Col>
          </Row>
          <div className="steps-container">
            <h2 className="steps-header">
              <Trans>3 STEPS FOR AN ENTITY TO BECOME A MEMBER</Trans>
            </h2>
            <div class="steps">
              <div class="step">
                <h2>1</h2>
                <p>
                  <Trans>
                    <strong>Fill in the form.</strong>
                    <br />
                    Tell us about your organisation's work in preventing and
                    reducing plastic pollution and marine litter.
                  </Trans>
                </p>
              </div>
              <div class="step">
                <h2>2</h2>
                <p>
                  <Trans>
                    <strong>Be approved</strong>
                    and certified by the GPML as a member of the partnership.
                  </Trans>
                </p>
              </div>
              <div class="step">
                <h2>3</h2>
                <p>
                  <Trans>
                    <strong>Receive</strong> an entity profile and focal point
                    profile on the GPML Digital Platform.
                  </Trans>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {router.query.submitted !== 'true' && (
        <div className="activity-box">
          <div className="container">
            <h2>
              <Trans>Why become a certified GPML member?</Trans>
            </h2>
          </div>
          <div className="container">
            <div className="activity-box-wrapper">
              <ul>
                <li>
                  <div className="icon">
                    <img src="/activity-policy.svg" />
                  </div>
                  <h3 className="h-m">
                    <Trans>Access</Trans>
                  </h3>
                  <p>
                    <Trans>
                      Access to a unique global audience for sharing knowledge
                      and experiences in preventing and reducing plastic
                      pollution and marine litter.
                    </Trans>
                  </p>
                </li>
                <li>
                  <div className="icon">
                    <img src="/activity-bookmark.svg" />
                  </div>
                  <h3 className="h-m">
                    <Trans>Collaborate</Trans>
                  </h3>
                  <p>
                    <Trans>
                      Opportunities to collaborate with other stakeholders to
                      create and advance solutions.
                    </Trans>
                  </p>
                </li>
                <li>
                  <div className="icon">
                    <img src="/activity-money.svg" />
                  </div>
                  <h3 className="h-m">
                    <Trans>Share</Trans>
                  </h3>
                  <p>
                    <Trans>
                      Exclusive invites to online and in-person events and the
                      opportunity to showcase your work.
                    </Trans>
                  </p>
                </li>
                <li>
                  <div className="icon">
                    <img src="/activity-plans.svg" />
                  </div>
                  <h3 className="h-m">
                    <Trans>Learn</Trans>
                  </h3>
                  <p>
                    <Trans>
                      Opportunities to access a variety of resources, data and
                      trainings to enhance capacity development.
                    </Trans>
                  </p>
                </li>
                <li>
                  <div className="icon">
                    <img src="/activity-access.svg" />
                  </div>
                  <h3 className="h-m">
                    <Trans>Certified</Trans>
                  </h3>
                  <p>
                    <Trans>
                      Your organisation will receive a certificate, which
                      officially acknowledges its GPML membership.
                    </Trans>
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
      <div className="container" ref={containerRef}>
        {loading && (
          <div className="loader">
            <Spin size="large" />
          </div>
        )}
        {!loading && router.query.submitted === 'true' ? (
          <Row>
            <Col span={24}>
              <Card
                style={{
                  padding: '100px',
                }}
              >
                <div>
                  <h3>
                    <Trans>Your application is received.</Trans>
                  </h3>
                  <h6 style={{ marginTop: 15 }}>
                    <Trans>We will be reviewing it shortly.</Trans>
                  </h6>
                </div>
              </Card>
            </Col>
          </Row>
        ) : loading ? null : (
          <div className="form-container">
            <div class="caps-heading-1 page-sub-heading">
              <Trans>Step 1</Trans>
            </div>
            <h2>
              <Trans>Fill in the form</Trans>
            </h2>
            <FinalForm
              onSubmit={onSubmit}
              initialValues={initialValues}
              render={({
                handleSubmit,
                form,
                submitting,
                pristine,
                values,
                errors,
              }) => {
                return (
                  <form onSubmit={handleSubmit} layout="vertical">
                    <Row>
                      <Col xs={24} sm={24} lg={16} xl={16}>
                        <Field name="orgName" validate={required}>
                          {({ input, meta }) => {
                            const hasError = meta.error && !meta.valid
                            const validVal =
                              input?.value && meta.valid ? 'success' : null
                            const validateStatus =
                              hasError && meta.touched ? 'error' : validVal

                            return (
                              <FormLabel
                                label={t`Name of Organisation`}
                                htmlFor="orgName"
                                validateStatus={validateStatus}
                              >
                                <Input
                                  size="small"
                                  onChange={(e) =>
                                    input.onChange(e.target.value)
                                  }
                                  value={input.value}
                                  className={`${
                                    meta.touched && meta.error && !meta.valid
                                      ? 'ant-input-status-error'
                                      : ''
                                  }`}
                                />{' '}
                                {meta.touched && meta.error && (
                                  <p
                                    color="error"
                                    className="error transitionDiv"
                                    style={
                                      meta.touched && meta.error
                                        ? mountedStyle
                                        : unmountedStyle
                                    }
                                  >
                                    {meta.error}
                                  </p>
                                )}
                              </FormLabel>
                            )
                          }}
                        </Field>
                        <Field name="program" validate={required}>
                          {({ input, meta }) => {
                            const hasError = meta.error && !meta.valid
                            const validVal =
                              input?.value && meta.valid ? 'success' : null
                            const validateStatus =
                              hasError && meta.touched ? 'error' : validVal

                            return (
                              <FormLabel
                                label={t`Organisation's efforts in addressing plastic pollution`}
                                htmlFor="program"
                                validateStatus={validateStatus}
                              >
                                <Input.TextArea
                                  // size="small"
                                  onChange={(e) =>
                                    input.onChange(e.target.value)
                                  }
                                  value={input.value}
                                  className={`${
                                    meta.touched && meta.error && !meta.valid
                                      ? 'ant-input-status-error'
                                      : ''
                                  }`}
                                />{' '}
                                {meta.touched && meta.error && (
                                  <p
                                    color="error"
                                    className="error transitionDiv"
                                    style={
                                      meta.touched && meta.error
                                        ? mountedStyle
                                        : unmountedStyle
                                    }
                                  >
                                    {meta.error}
                                  </p>
                                )}
                              </FormLabel>
                            )
                          }}
                        </Field>
                        <Field name="type" validate={required}>
                          {({ input, meta }) => {
                            const hasError = meta.error && !meta.valid
                            const validVal =
                              input?.value && meta.valid ? 'success' : null
                            const validateStatus =
                              hasError && meta.touched ? 'error' : validVal

                            return (
                              <FormLabel
                                label={t`Which representative group fits your Entity?`}
                                htmlFor="type"
                                validateStatus={validateStatus}
                              >
                                <Radio.Group {...input} value={input.value}>
                                  <Space direction="vertical">
                                    {representativeGroup.map((g) => (
                                      <Radio key={g.code} value={g.code}>
                                        {g.name}
                                      </Radio>
                                    ))}
                                  </Space>
                                </Radio.Group>{' '}
                                {meta.touched && meta.error && (
                                  <p
                                    color="error"
                                    className="error transitionDiv"
                                    style={
                                      meta.touched && meta.error
                                        ? mountedStyle
                                        : unmountedStyle
                                    }
                                  >
                                    {meta.error}
                                  </p>
                                )}
                              </FormLabel>
                            )
                          }}
                        </Field>
                        <Field name="url" validate={required}>
                          {({ input, meta }) => {
                            const hasError = meta.error && !meta.valid
                            const validVal =
                              input?.value && meta.valid ? 'success' : null
                            const validateStatus =
                              hasError && meta.touched ? 'error' : validVal

                            return (
                              <FormLabel
                                label={t`Organisation’s Website`}
                                htmlFor="url"
                                validateStatus={validateStatus}
                              >
                                <Input
                                  size="small"
                                  onChange={(e) =>
                                    input.onChange(e.target.value)
                                  }
                                  value={input.value}
                                  className={`${
                                    meta.touched && meta.error && !meta.valid
                                      ? 'ant-input-status-error'
                                      : ''
                                  }`}
                                />{' '}
                                {meta.touched && meta.error && (
                                  <p
                                    color="error"
                                    className="error transitionDiv"
                                    style={
                                      meta.touched && meta.error
                                        ? mountedStyle
                                        : unmountedStyle
                                    }
                                  >
                                    {meta.error}
                                  </p>
                                )}
                              </FormLabel>
                            )
                          }}
                        </Field>
                        <Field name="picture">
                          {({ input: { value, onChange, ...input } }) => (
                            <FormLabel
                              label={t`Organisation’s Logo`}
                              htmlFor="url"
                            >
                              <Dragger
                                {...input}
                                beforeUpload={() => false}
                                onChange={({ file, fileList }) => {
                                  if (file.status !== 'uploading') {
                                    const base64 = getBase64(file)
                                    base64
                                      .then((res) => {
                                        onChange(res)
                                      })
                                      .catch((err) => {
                                        onChange(err || null)
                                      })
                                  }
                                }}
                                onDrop={(e) => {
                                  const files = e.dataTransfer.files
                                  if (files && files.length > 0) {
                                    const file = files[0]
                                    getBase64(file)
                                      .then((res) => {
                                        onChange(res)
                                      })
                                      .catch((err) => {
                                        console.error(
                                          'Error converting file to base64:',
                                          err
                                        )
                                        onChange(null)
                                      })
                                  }
                                }}
                                multiple={false}
                                accept=".jpg,.png"
                              >
                                <p className="ant-upload-drag-icon">
                                  <UploadFileIcon />
                                </p>
                                <p className="ant-upload-text">
                                  <Trans>Accepts .jpg and .png</Trans>
                                </p>
                                <p className="add-btn">
                                  <Trans>Add a File</Trans>
                                </p>
                              </Dragger>
                            </FormLabel>
                          )}
                        </Field>
                        <Field
                          name="tags"
                          style={{ width: '100%' }}
                          validate={required}
                        >
                          {({ input, meta }) => {
                            const handleChange = (selectedValue) => {
                              const isSelected = input.value.includes(
                                selectedValue.toLowerCase()
                              )
                              let newValue
                              if (isSelected) {
                                newValue = input.value.filter(
                                  (value) =>
                                    value !== selectedValue.toLowerCase()
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

                            const hasError = meta.error && !meta.valid
                            const validVal =
                              input?.value && meta.valid ? 'success' : null
                            const validateStatus =
                              hasError && meta.touched ? 'error' : validVal

                            return (
                              <FormLabel
                                label={t`Areas of expertise`}
                                htmlFor="tags"
                                validateStatus={validateStatus}
                              >
                                <CatTagSelect
                                  handleChange={handleChange}
                                  meta={meta}
                                  error={meta.touched && hasError}
                                  value={input.value ? input.value : undefined}
                                  handleRemove={handleRemove}
                                />{' '}
                                {meta.touched && meta.error && (
                                  <p
                                    color="error"
                                    className="error transitionDiv"
                                    style={
                                      meta.touched && meta.error
                                        ? mountedStyle
                                        : unmountedStyle
                                    }
                                  >
                                    {meta.error}
                                  </p>
                                )}
                              </FormLabel>
                            )
                          }}
                        </Field>

                        <div className="geo">
                          <h2>
                            <Trans>Geo-coverage</Trans>
                          </h2>
                          <Row gutter={[16, 16]}>
                            <Col span={12} xs={24}>
                              <Field name="geoCoverageType" validate={required}>
                                {({ input, meta }) => {
                                  const hasError = meta.error && !meta.valid
                                  const validVal =
                                    input?.value && meta.valid
                                      ? 'success'
                                      : null
                                  const validateStatus =
                                    hasError && meta.touched
                                      ? 'error'
                                      : validVal

                                  return (
                                    <FormLabel
                                      label={t`Geo-coverage type`}
                                      htmlFor="geoCoverageType"
                                      validateStatus={validateStatus}
                                    >
                                      <Select
                                        {...input}
                                        size="small"
                                        onChange={(value) =>
                                          input.onChange(value)
                                        }
                                        onBlur={() => input.onBlur()}
                                        value={input.value}
                                        allowClear
                                        className={`dont-show ${
                                          meta.touched && !meta.valid
                                            ? 'ant-input-status-error'
                                            : ''
                                        }`}
                                      >
                                        <Option value="global">
                                          <Trans>Global</Trans>
                                        </Option>
                                        <Option value="transnational">
                                          <Trans>Transnational</Trans>
                                        </Option>
                                        <Option value="national">
                                          <Trans>National</Trans>
                                        </Option>
                                      </Select>{' '}
                                      {meta.touched && meta.error && (
                                        <p
                                          color="error"
                                          className="error transitionDiv"
                                          style={
                                            meta.touched && meta.error
                                              ? mountedStyle
                                              : unmountedStyle
                                          }
                                        >
                                          {meta.error}
                                        </p>
                                      )}
                                    </FormLabel>
                                  )
                                }}
                              </Field>
                              {values.geoCoverageType === 'transnational' && (
                                <Field
                                  name="geo_coverage_country_groups"
                                  validate={required}
                                >
                                  {({ input, meta }) => {
                                    const hasError = meta.error && !meta.valid
                                    const validVal =
                                      input?.value && meta.valid
                                        ? 'success'
                                        : null
                                    const validateStatus =
                                      hasError && meta.touched
                                        ? 'error'
                                        : validVal

                                    return (
                                      <FormLabel
                                        label={t`Geo Coverage (Transnational)`}
                                        htmlFor="geo_coverage_country_groups"
                                        validateStatus={validateStatus}
                                      >
                                        <Select
                                          {...input}
                                          size="small"
                                          onChange={(value) =>
                                            input.onChange(value)
                                          }
                                          onBlur={() => input.onBlur()}
                                          value={input.value}
                                          placeholder="Geo-coverage type"
                                          allowClear
                                          className={`dont-show ${
                                            meta.touched && !meta.valid
                                              ? 'ant-input-status-error'
                                              : ''
                                          }`}
                                        >
                                          {transnationalOptions.map((it) => (
                                            <Option key={it.id} value={it.id}>
                                              {it.name}
                                            </Option>
                                          ))}
                                        </Select>{' '}
                                        {meta.touched && meta.error && (
                                          <p
                                            color="error"
                                            className="error transitionDiv"
                                            style={
                                              meta.touched && meta.error
                                                ? mountedStyle
                                                : unmountedStyle
                                            }
                                          >
                                            {meta.error}
                                          </p>
                                        )}
                                      </FormLabel>
                                    )
                                  }}
                                </Field>
                              )}
                              {(values.geoCoverageType === 'transnational' ||
                                values.geoCoverageType === 'national') && (
                                <Field
                                  name="geo_coverage_countries"
                                  validate={required}
                                >
                                  {({ input, meta }) => {
                                    const hasError = meta.error && !meta.valid
                                    const validVal =
                                      input?.value && meta.valid
                                        ? 'success'
                                        : null
                                    const validateStatus =
                                      hasError && meta.touched
                                        ? 'error'
                                        : validVal

                                    return (
                                      <FormLabel
                                        label={t`Geo Coverage (countries)`}
                                        htmlFor="geo_coverage_countries"
                                        validateStatus={validateStatus}
                                      >
                                        <Select
                                          {...input}
                                          size="small"
                                          onChange={(value) =>
                                            input.onChange(value)
                                          }
                                          onBlur={() => input.onBlur()}
                                          value={input.value ? input.value : []}
                                          placeholder="Geo-coverage type"
                                          allowClear
                                          className={`dont-show ${
                                            meta.touched && !meta.valid
                                              ? 'ant-input-status-error'
                                              : ''
                                          }`}
                                          mode="multiple"
                                        >
                                          {countries
                                            .filter(
                                              (country) =>
                                                country.description.toLowerCase() ===
                                                'member state'
                                            )
                                            .map((it) => (
                                              <Option key={it.id} value={it.id}>
                                                {it.name}
                                              </Option>
                                            ))}
                                        </Select>{' '}
                                        {meta.touched && meta.error && (
                                          <p
                                            color="error"
                                            className="error transitionDiv"
                                            style={
                                              meta.touched && meta.error
                                                ? mountedStyle
                                                : unmountedStyle
                                            }
                                          >
                                            {meta.error}
                                          </p>
                                        )}
                                      </FormLabel>
                                    )
                                  }}
                                </Field>
                              )}
                            </Col>

                            <Col span={12} xs={24}>
                              <Field name="orgHeadquarter" validate={required}>
                                {({ input, meta }) => {
                                  const hasError = meta.error && !meta.valid
                                  const validVal =
                                    input?.value && meta.valid
                                      ? 'success'
                                      : null
                                  const validateStatus =
                                    hasError && meta.touched
                                      ? 'error'
                                      : validVal

                                  return (
                                    <FormLabel
                                      label={t`Headquarters`}
                                      htmlFor="orgHeadquarter"
                                      validateStatus={validateStatus}
                                    >
                                      <Select
                                        {...input}
                                        size="small"
                                        onChange={(value) =>
                                          input.onChange(value)
                                        }
                                        filterOption={(input, option) =>
                                          option.children
                                            .toLowerCase()
                                            .indexOf(input.toLowerCase()) >= 0
                                        }
                                        onBlur={() => input.onBlur()}
                                        value={input.value}
                                        placeholder="Countries"
                                        allowClear
                                        showSearch
                                        className={`dont-show ${
                                          meta.touched && !meta.valid
                                            ? 'ant-input-status-error'
                                            : ''
                                        }`}
                                      >
                                        {countries
                                          .filter(
                                            (country) =>
                                              country.description.toLowerCase() ===
                                              'member state'
                                          )
                                          .map((it) => (
                                            <Option key={it.id} value={it.id}>
                                              {it.name}
                                            </Option>
                                          ))}
                                      </Select>
                                      {meta.touched && meta.error && (
                                        <p
                                          color="error"
                                          className="error transitionDiv"
                                          style={
                                            meta.touched && meta.error
                                              ? mountedStyle
                                              : unmountedStyle
                                          }
                                        >
                                          {meta.error}
                                        </p>
                                      )}
                                    </FormLabel>
                                  )
                                }}
                              </Field>
                            </Col>
                          </Row>
                        </div>

                        <Field
                          name="acceptTerms"
                          type="checkbox"
                          validate={required}
                        >
                          {({ input, meta }) => (
                            <FormLabel
                              validateStatus={
                                meta.error && meta.touched ? 'error' : ''
                              }
                            >
                              <Checkbox {...input}>
                                <Trans>
                                  By submitting this form, I will be included in
                                  the public database of GPML Digital Platform
                                  members and acknowledge that the provided
                                  information will be made public and used to
                                  find and connect via smart-matchmaking
                                  functionalities with other stakeholders and
                                  resources.
                                </Trans>
                              </Checkbox>
                            </FormLabel>
                          )}
                        </Field>

                        {profile && Object.keys(profile).length > 0 ? (
                          <Field name="email">
                            {({ input, meta }) => {
                              return (
                                <FormLabel label="Email" htmlFor="email">
                                  <Input
                                    size="small"
                                    value={profile.email}
                                    disabled
                                  />
                                </FormLabel>
                              )
                            }}
                          </Field>
                        ) : (
                          <div className="auth-container">
                            <div className="header">
                              <h2>
                                <Trans>Focal Point Account in GPML</Trans>
                              </h2>
                              <div className="login-btn">
                                {!login && (
                                  <span>
                                    <Trans>Already have an account?</Trans>
                                  </span>
                                )}
                                <Button
                                  type="link"
                                  onClick={() => setLogin(!login)}
                                >
                                  {login ? 'Sign Up' : 'Login'}
                                </Button>
                              </div>
                            </div>
                            {login ? (
                              <Login required={required} />
                            ) : (
                              <SignUp required={required} />
                            )}
                          </div>
                        )}
                      </Col>
                    </Row>

                    <div className="buttons">
                      <Button
                        type="primary"
                        size="large"
                        withArrow
                        disabled={submitting}
                        htmlType="submit"
                      >
                        <Trans>Submit Application</Trans>
                      </Button>
                    </div>
                  </form>
                )
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

const SignUp = ({ required }) => {
  return (
    <>
      <div>
        <Field name="email" validate={required}>
          {({ input, meta }) => {
            const hasError = meta.error && !meta.valid
            const validVal = input?.value && meta.valid ? 'success' : null
            const validateStatus = hasError && meta.touched ? 'error' : validVal

            return (
              <FormLabel
                label="Email"
                htmlFor="email"
                validateStatus={validateStatus}
              >
                <Input
                  size="small"
                  onChange={(e) => input.onChange(e.target.value)}
                  placeholder={t`Email`}
                  className={`${
                    meta.touched && meta.error && !meta.valid
                      ? 'ant-input-status-error'
                      : ''
                  }`}
                />{' '}
                {meta.touched && meta.error && (
                  <p
                    color="error"
                    className="error transitionDiv"
                    style={
                      meta.touched && meta.error ? mountedStyle : unmountedStyle
                    }
                  >
                    {meta.error}
                  </p>
                )}
              </FormLabel>
            )
          }}
        </Field>
        <Row gutter={[16, 16]}>
          <Col span={12} lg={12} xs={24}>
            <Field
              name="password"
              validate={(value, allValues) =>
                required(value, allValues, 'password')
              }
            >
              {({ input, meta }) => {
                const hasError = meta.error && !meta.valid
                const validVal = input?.value && meta.valid ? 'success' : null
                const validateStatus =
                  hasError && meta.touched ? 'error' : validVal

                return (
                  <FormLabel
                    label={t`Password`}
                    htmlFor="password"
                    validateStatus={validateStatus}
                  >
                    <Input.Password
                      size="small"
                      onChange={(e) => input.onChange(e.target.value)}
                      className={`${
                        meta.touched && meta.error && !meta.valid
                          ? 'ant-input-status-error'
                          : ''
                      }`}
                    />{' '}
                    {meta.touched && meta.error && (
                      <p
                        color="error"
                        className="error transitionDiv"
                        style={
                          meta.touched && meta.error
                            ? mountedStyle
                            : unmountedStyle
                        }
                      >
                        {meta.error}
                      </p>
                    )}
                  </FormLabel>
                )
              }}
            </Field>
          </Col>
          <Col span={12} lg={12} xs={24}>
            <Field
              name="rpassword"
              validate={(value, allValues) =>
                required(value, allValues, 'rpassword')
              }
            >
              {({ input, meta }) => {
                const hasError = meta.error && !meta.valid
                const validVal = input?.value && meta.valid ? 'success' : null
                const validateStatus =
                  hasError && meta.touched ? 'error' : validVal

                return (
                  <FormLabel
                    label="Retype Password"
                    htmlFor="rpassword"
                    validateStatus={validateStatus}
                  >
                    <Input.Password
                      size="small"
                      onChange={(e) => input.onChange(e.target.value)}
                      className={`${
                        meta.touched && meta.error && !meta.valid
                          ? 'ant-input-status-error'
                          : ''
                      }`}
                    />{' '}
                    {meta.touched && meta.error && (
                      <p
                        color="error"
                        className="error transitionDiv"
                        style={
                          meta.touched && meta.error
                            ? mountedStyle
                            : unmountedStyle
                        }
                      >
                        {meta.error}
                      </p>
                    )}
                  </FormLabel>
                )
              }}
            </Field>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12} lg={12} xs={24}>
            <Field name="fname" validate={required}>
              {({ input, meta }) => {
                const hasError = meta.error && !meta.valid
                const validVal = input?.value && meta.valid ? 'success' : null
                const validateStatus =
                  hasError && meta.touched ? 'error' : validVal

                return (
                  <FormLabel
                    label={t`First Name`}
                    htmlFor="fname"
                    validateStatus={validateStatus}
                  >
                    <Input
                      size="small"
                      onChange={(e) => input.onChange(e.target.value)}
                      className={`${
                        meta.touched && meta.error && !meta.valid
                          ? 'ant-input-status-error'
                          : ''
                      }`}
                    />{' '}
                    {meta.touched && meta.error && (
                      <p
                        color="error"
                        className="error transitionDiv"
                        style={
                          meta.touched && meta.error
                            ? mountedStyle
                            : unmountedStyle
                        }
                      >
                        {meta.error}
                      </p>
                    )}
                  </FormLabel>
                )
              }}
            </Field>
          </Col>
          <Col span={12} lg={12} xs={24}>
            <Field name="lname" validate={required}>
              {({ input, meta }) => {
                const hasError = meta.error && !meta.valid
                const validVal = input?.value && meta.valid ? 'success' : null
                const validateStatus =
                  hasError && meta.touched ? 'error' : validVal

                return (
                  <FormLabel
                    label={t`Last Name`}
                    htmlFor="lname"
                    validateStatus={validateStatus}
                  >
                    <Input
                      size="small"
                      onChange={(e) => input.onChange(e.target.value)}
                      className={`${
                        meta.touched && meta.error && !meta.valid
                          ? 'ant-input-status-error'
                          : ''
                      }`}
                    />{' '}
                    {meta.touched && meta.error && (
                      <p
                        color="error"
                        className="error transitionDiv"
                        style={
                          meta.touched && meta.error
                            ? mountedStyle
                            : unmountedStyle
                        }
                      >
                        {meta.error}
                      </p>
                    )}
                  </FormLabel>
                )
              }}
            </Field>
          </Col>
        </Row>
      </div>
    </>
  )
}
const Login = ({ required }) => {
  return (
    <>
      <div>
        <Field name="email" validate={required}>
          {({ input, meta }) => {
            const hasError = meta.error && !meta.valid
            const validVal = input?.value && meta.valid ? 'success' : null
            const validateStatus = hasError && meta.touched ? 'error' : validVal

            return (
              <FormLabel
                label={t`Email`}
                htmlFor="email"
                validateStatus={validateStatus}
              >
                <Input
                  size="small"
                  onChange={(e) => input.onChange(e.target.value)}
                  className={`${
                    meta.touched && meta.error && !meta.valid
                      ? 'ant-input-status-error'
                      : ''
                  }`}
                />
              </FormLabel>
            )
          }}
        </Field>
        <Field name="password" validate={required}>
          {({ input, meta }) => {
            const hasError = meta.error && !meta.valid
            const validVal = input?.value && meta.valid ? 'success' : null
            const validateStatus = hasError && meta.touched ? 'error' : validVal

            return (
              <FormLabel
                label="Password"
                htmlFor="password"
                validateStatus={validateStatus}
              >
                <Input.Password
                  size="small"
                  onChange={(e) => input.onChange(e.target.value)}
                  className={`${
                    meta.touched && meta.error && !meta.valid
                      ? 'ant-input-status-error'
                      : ''
                  }`}
                />
              </FormLabel>
            )
          }}
        </Field>
      </div>
    </>
  )
}

const ensureHttps = (url) => {
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`
  }
  return url
}

const handleSubmissionError = (err) => {
  const defaultMessage =
    'An error occurred during form submission. Please try again later.'
  const message = err?.response?.data?.reason
    ? err.response.data.reason
    : defaultMessage
  notification.error({
    message,
  })
}

const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    var reader = new FileReader()
    if (file) {
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(reader.result)
    }
    if (!file) {
      reject('discard')
    }
  })
}

const mountedStyle = {
  animation: 'inAnimation 250ms ease-in',
}
const unmountedStyle = {
  animation: 'outAnimation 270ms ease-out',
  animationFillMode: 'forwards',
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default Partnership
