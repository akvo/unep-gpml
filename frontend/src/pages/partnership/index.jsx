import React, { useEffect, useState } from 'react'
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

function Partnership({}) {
  const router = useRouter()
  const { representativeGroup, countries, profile, tags } = UIStore.currentState
  const [login, setLogin] = useState(false)
  const [submited, setSubmited] = useState(false)
  const [initialValues, setInitialValues] = useState(null)

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
      // geo_coverage_countries: [1],
      // geo_coverage_country_groups: [1],
    }
    if (profile && Object.keys(profile).length > 0) {
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
        localStorage.setItem('redirect_on_login', JSON.stringify(router.asPath))
        auth0Client.login(
          {
            realm: 'Username-Password-Authentication',
            username,
            password,
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
        localStorage.setItem('redirect_on_login', JSON.stringify(router.asPath))
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
    delete data.isMember
    try {
      const profileRes = await api.put('/profile', {
        org: {
          id: data.id,
        },
      })
      await api.put(`/organisation/${data.id}/request-membership`, {
        ...data,
        type: representativeGroup.find((item) => item.code === type)?.name,
        authorize_submission: true,
      })

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
      setSubmited(true)
      localStorage.removeItem('partnerValue')
    } catch (err) {
      handleSubmissionError(err)
      localStorage.removeItem('partnerValue')
      setSubmited(false)
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
        }
        setInitialValues({
          orgName: data.name,
          url: data.url,
          is_member: false,
          orgHeadquarter: data.country,
          geoCoverageType: data.geo_coverage_type,
          tags: data.tags,
          program: data.program,
          acceptTerms: true,
          type: values.type,
        })
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
      }
    }

    submitData()
  }, [])

  const required = (value) => (value ? undefined : 'Required')

  return (
    <div className={styles.partnership}>
      <div className="hero">
        <Row align="middle" gutter={[24, 16]}>
          <Col xs={24} sm={24} lg={18} xl={18}>
            <div class="header">
              <h1>
                <span>Join the multi-stakeholder partnership</span> which brings
                together all the actors working on plastic pollution and marine
                litter prevention and reduction.
              </h1>
            </div>
          </Col>
          <Col xs={24} sm={24} lg={6} xl={6}>
            <Image src="/partnership.png" alt="hero" preview={false} />
          </Col>
        </Row>
        <div className="steps-container">
          <h2 className="steps-header">
            3 STEPS FOR AN ENTITY TO BECOME A MEMBER
          </h2>
          <div class="steps">
            <div class="step">
              <h2>1</h2>
              <p>
                <strong>Fill in the form.</strong>
                <br />
                Tell us about your organisation's work in preventing and
                reducing plastic pollution and marine litter.
              </p>
            </div>
            <div class="step">
              <h2>2</h2>
              <p>
                <strong>Be approved</strong> and certified by the GPML as a
                member of the partnership.
              </p>
            </div>
            <div class="step">
              <h2>3</h2>
              <p>
                <strong>Receive</strong> an entity profile and focal point
                profile on the GPML Digital Platform.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="activity-box">
        <h2>Why become a certified GPML member?</h2>
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
                Access to a unique global audience for sharing knowledge and
                experiences in preventing and reducing plastic pollution and
                marine litter.
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
                Opportunities to collaborate with other stakeholders to create
                and advance solutions.
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
                Exclusive invites to online and in-person events and the
                opportunity to showcase your work.
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
                Opportunities to access a variety of resources, data and
                trainings to enhance capacity development.
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
                Your organisation will receive a certificate, which officially
                acknowledges its GPML membership.
              </p>
            </li>
          </ul>
        </div>
      </div>
      {submited ? (
        <Row>
          <Col span={24}>
            <Card
              style={{
                padding: '30px',
              }}
            >
              <div>
                <h3>Thank you for signing up!</h3>
                <p>we'll let you know once an admin has approved it</p>
              </div>
            </Card>
          </Col>
        </Row>
      ) : (
        <div className="form-container">
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
                              label="Name of Organisation"
                              htmlFor="orgName"
                              validateStatus={validateStatus}
                            >
                              <Input
                                size="small"
                                onChange={(e) => input.onChange(e.target.value)}
                                placeholder={t`Name of Organisation`}
                                value={input.value}
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
                      <Field name="program" validate={required}>
                        {({ input, meta }) => {
                          const hasError = meta.error && !meta.valid
                          const validVal =
                            input?.value && meta.valid ? 'success' : null
                          const validateStatus =
                            hasError && meta.touched ? 'error' : validVal

                          return (
                            <FormLabel
                              label="Organisation's efforts in addressing plastic pollution"
                              htmlFor="program"
                              validateStatus={validateStatus}
                            >
                              <Input.TextArea
                                size="small"
                                onChange={(e) => input.onChange(e.target.value)}
                                placeholder={t`Organisation's efforts in addressing plastic pollution`}
                                value={input.value}
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
                      <Field name="type" validate={required}>
                        {({ input, meta }) => {
                          const hasError = meta.error && !meta.valid
                          const validVal =
                            input?.value && meta.valid ? 'success' : null
                          const validateStatus =
                            hasError && meta.touched ? 'error' : validVal

                          return (
                            <FormLabel
                              label="Which representative group fits your Entity?"
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
                              </Radio.Group>
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
                              label="Organisation’s Website"
                              htmlFor="url"
                              validateStatus={validateStatus}
                            >
                              <Input
                                size="small"
                                onChange={(e) => input.onChange(e.target.value)}
                                placeholder={t`Organisation’s Website`}
                                value={input.value}
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
                      <Field name="picture">
                        {({ input: { value, onChange, ...input } }) => (
                          <FormLabel label="Organisation’s Logo" htmlFor="url">
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
                              onDrop={(e) => {}}
                              multiple={false}
                              accept=".jpg,.png"
                            >
                              <p className="ant-upload-drag-icon">
                                <UploadFileIcon />
                              </p>
                              <p className="ant-upload-text">
                                Accepts .jpg and .png
                              </p>
                              <p className="add-btn">Add Files</p>
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

                          const hasError = meta.error && !meta.valid
                          const validVal =
                            input?.value && meta.valid ? 'success' : null
                          const validateStatus =
                            hasError && meta.touched ? 'error' : validVal

                          return (
                            <FormLabel
                              label="Areas of expertise"
                              htmlFor="tags"
                              validateStatus={validateStatus}
                            >
                              <CatTagSelect
                                handleChange={handleChange}
                                meta={meta}
                                error={meta.touched && hasError}
                                value={input.value ? input.value : undefined}
                                handleRemove={handleRemove}
                              />
                            </FormLabel>
                          )
                        }}
                      </Field>

                      <div className="geo">
                        <h2>Geo-coverage</h2>
                        <Row gutter={[16, 16]}>
                          <Col span={12}>
                            <Field name="geoCoverageType" validate={required}>
                              {({ input, meta }) => {
                                const hasError = meta.error && !meta.valid
                                const validVal =
                                  input?.value && meta.valid ? 'success' : null
                                const validateStatus =
                                  hasError && meta.touched ? 'error' : validVal

                                return (
                                  <FormLabel
                                    label="Geo-coverage type"
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
                                      placeholder="Geo-coverage type"
                                      allowClear
                                      className={`dont-show ${
                                        meta.touched && !meta.valid
                                          ? 'ant-input-status-error'
                                          : ''
                                      }`}
                                    >
                                      <Option value="global">Global</Option>
                                      <Option value="transnational">
                                        Transnational
                                      </Option>
                                      <Option value="national">National</Option>
                                    </Select>
                                  </FormLabel>
                                )
                              }}
                            </Field>
                          </Col>
                          <Col span={12}>
                            <Field name="orgHeadquarter" validate={required}>
                              {({ input, meta }) => {
                                const hasError = meta.error && !meta.valid
                                const validVal =
                                  input?.value && meta.valid ? 'success' : null
                                const validateStatus =
                                  hasError && meta.touched ? 'error' : validVal

                                return (
                                  <FormLabel
                                    label="Countries"
                                    htmlFor="orgHeadquarter"
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
                                      placeholder="Countries"
                                      allowClear
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
                              By submitting this form, I will be included in the
                              public database of GPML Digital Platform members
                              and acknowledge that the provided information will
                              be made public and used to find and connect via
                              smart-matchmaking functionalities with other
                              stakeholders and resources.
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
                                  placeholder={t`Email`}
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
                            <h2>Focal Point Account in GPML</h2>
                            <div className="login-btn">
                              {!login && <span>Already have an account?</span>}
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
                />
              </FormLabel>
            )
          }}
        </Field>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Field name="password" validate={required}>
              {({ input, meta }) => {
                const hasError = meta.error && !meta.valid
                const validVal = input?.value && meta.valid ? 'success' : null
                const validateStatus =
                  hasError && meta.touched ? 'error' : validVal

                return (
                  <FormLabel
                    label="Password"
                    htmlFor="password"
                    validateStatus={validateStatus}
                  >
                    <Input.Password
                      size="small"
                      onChange={(e) => input.onChange(e.target.value)}
                      placeholder={t`Password`}
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
          </Col>
          <Col span={12}>
            <Field name="rpassword" validate={required}>
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
                      placeholder={t`Password`}
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
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Field name="fname" validate={required}>
              {({ input, meta }) => {
                const hasError = meta.error && !meta.valid
                const validVal = input?.value && meta.valid ? 'success' : null
                const validateStatus =
                  hasError && meta.touched ? 'error' : validVal

                return (
                  <FormLabel
                    label="First Name"
                    htmlFor="fname"
                    validateStatus={validateStatus}
                  >
                    <Input
                      size="small"
                      onChange={(e) => input.onChange(e.target.value)}
                      placeholder={t`First Name`}
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
          </Col>
          <Col span={12}>
            <Field name="lname" validate={required}>
              {({ input, meta }) => {
                const hasError = meta.error && !meta.valid
                const validVal = input?.value && meta.valid ? 'success' : null
                const validateStatus =
                  hasError && meta.touched ? 'error' : validVal

                return (
                  <FormLabel
                    label="Last Name"
                    htmlFor="lname"
                    validateStatus={validateStatus}
                  >
                    <Input
                      size="small"
                      onChange={(e) => input.onChange(e.target.value)}
                      placeholder={t`First Name`}
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
                  placeholder={t`Password`}
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

export default Partnership
