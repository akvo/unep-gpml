import { useState } from 'react'
import axios from 'axios'
import styles from './style.module.scss'
import moment from 'moment'
import Head from 'next/head'
import { loadCatalog } from '../../translations/utils'
import { getStrapiUrl } from '../../utils/misc'
import { Form as AntdForm, Input, Row, Col, notification } from 'antd'
import { Form as FinalForm, Field } from 'react-final-form'
import Button from '../../components/button'
import { Trans, t } from '@lingui/macro'
import api from '../../utils/api'

const required = (value) => (value ? undefined : 'Required')

const StrapiPage = ({ pageData }) => {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      const data = {
        ...values,
        source: 'gpml',
        subject: 'Contact us form submission',
      }
      await api.post('/contact', data)
      setSubmitted(true)
      setLoading(false)

      setTimeout(() => {
        setSubmitted(false)
      }, 5000)
    } catch (error) {
      if (error) {
        notification.error({
          message: error.response.data
            ? error.response.data.errorDetails
            : 'An error occured',
        })
      }
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <Head>
        <title>{pageData.attributes.title} | Global Plastics Hub</title>
      </Head>
      <div className="container" id="main-content">
        <h1 className="h-l">{pageData.attributes.title}</h1>
        <div
          className="content"
          dangerouslySetInnerHTML={{ __html: pageData.attributes.content }}
        />

        {pageData.attributes.slug === 'contact-us' &&
          (!submitted ? (
            <FinalForm
              onSubmit={handleSubmit}
              render={({ handleSubmit, submitting }) => (
                <form onSubmit={handleSubmit} layout="vertical">
                  <Row>
                    <Col xs={24} sm={24} lg={16} xl={16}>
                      <Field name="name" validate={required}>
                        {({ input, meta }) => {
                          const hasError = meta.error && meta.touched
                          return (
                            <AntdForm.Item
                              label="Name"
                              validateStatus={hasError ? 'error' : ''}
                              help={hasError ? meta.error : ''}
                            >
                              <Input {...input} />
                            </AntdForm.Item>
                          )
                        }}
                      </Field>
                    </Col>
                    <Col xs={24} sm={24} lg={16} xl={16}>
                      <Field name="organization" validate={required}>
                        {({ input, meta }) => {
                          const hasError = meta.error && meta.touched
                          return (
                            <AntdForm.Item
                              label="Organization"
                              validateStatus={hasError ? 'error' : ''}
                              help={hasError ? meta.error : ''}
                            >
                              <Input {...input} />
                            </AntdForm.Item>
                          )
                        }}
                      </Field>
                    </Col>
                    <Col xs={24} sm={24} lg={16} xl={16}>
                      <Field name="email" validate={required}>
                        {({ input, meta }) => {
                          const hasError = meta.error && meta.touched
                          return (
                            <AntdForm.Item
                              label="Email"
                              validateStatus={hasError ? 'error' : ''}
                              help={hasError ? meta.error : ''}
                            >
                              <Input {...input} />
                            </AntdForm.Item>
                          )
                        }}
                      </Field>
                    </Col>
                    <Col xs={24} sm={24} lg={16} xl={16}>
                      <Field name="message" validate={required}>
                        {({ input, meta }) => {
                          const hasError = meta.error && meta.touched
                          return (
                            <AntdForm.Item
                              label="Message"
                              validateStatus={hasError ? 'error' : ''}
                              help={hasError ? meta.error : ''}
                            >
                              <Input.TextArea {...input} rows={4} />
                            </AntdForm.Item>
                          )
                        }}
                      </Field>
                    </Col>
                  </Row>
                  <Button
                    type="primary"
                    size="large"
                    withArrow
                    disabled={submitting || loading}
                    htmlType="submit"
                  >
                    <Trans>Submit</Trans>
                  </Button>
                </form>
              )}
            />
          ) : (
            <div className="submitted-text">
              <Trans>Your message has been sent!</Trans>
            </div>
          ))}
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  const { slug } = context.params
  const text = slug.split('-')

  try {
    const strapiUrl = getStrapiUrl()
    const response = await axios.get(
      `${strapiUrl}/api/pages?filters[slug][$eq]=${slug}`
    )
    if (response.data.data.length === 0) {
      return { notFound: true }
    }
    const pageData = response.data.data[0]

    return {
      props: { pageData, i18n: await loadCatalog(context.locale) },
    }
  } catch (error) {
    console.error(error, 'error')
    return {
      props: { notFound: true },
    }
  }
}

const getDomainName = (host) => {
  return host.split(':')[0]
}

export default StrapiPage
