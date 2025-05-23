import React, { useState, useRef, useEffect } from 'react'
import styles from './styles.module.scss'
import { notification } from 'antd'
import { Form } from 'react-final-form'
import AffiliationOption from './affiliation-option'
import FormOne from './form-one'
import FormTwo from './form-two'
import FormThree from './form-three'
import FormFour from './form-four'
import { UIStore } from '../../store'
import { useLocation } from 'react-router-dom'
import api from '../../utils/api'
import { setIn } from 'final-form'
import { useRouter } from 'next/router'
import { useDeviceSize } from '../landing/landing'
import Button from '../../components/button'
import { LongArrowRight } from '../../components/icons'
import { Trans, t } from '@lingui/macro'

function Authentication() {
  const formRef = useRef()
  const surferRef = useRef()
  const router = useRouter()
  const query = router.query.data ? JSON.parse(router.query.data) : {}
  const [affiliation, setAffiliation] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const [initialValues, setInitialValues] = useState({})
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [width, height] = useDeviceSize()
  const {
    tags,
    nonMemberOrganisations,
    organisations,
    countries,
  } = UIStore.currentState

  const containsOAuthProvider =
    query?.sub?.toLowerCase().includes('google-oauth2'.toLowerCase()) ||
    query?.sub?.toLowerCase().includes('linkedin'.toLowerCase())

  const next = (skip = 0) => {
    if (
      formRef?.current?.getFieldState('jobTitle').valid &&
      formRef?.current?.getFieldState('orgName').valid &&
      formRef?.current?.getFieldState('offering').valid &&
      formRef?.current?.getFieldState('seeking').valid &&
      formRef?.current?.getFieldState('publicDatabase').valid &&
      formRef?.current?.getFieldState('about').valid &&
      (!containsOAuthProvider ||
        (formRef?.current?.getFieldState('firstName').valid &&
          formRef?.current?.getFieldState('lastName').valid &&
          formRef?.current?.getFieldState('country').valid))
    ) {
      setError(false)
      setCurrentStep(currentStep + 1 + skip)
    } else {
      setError(true)
    }
  }

  const previous = () => {
    setCurrentStep(Math.max(currentStep - 1, 0))
  }

  const isLastPage = () => currentStep === (affiliation ? 5 : 6 - 1)

  const handleSubmit = (values) => {
    if (isLastPage()) {
      return onSubmit(values)
    } else {
      next()
    }
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

  const onSubmit = async (values) => {
    setLoading(true)
    let data = {
      ...values,
      ...(query && !query?.hasOwnProperty('exp') && query?.data),
      ...(query &&
        query?.hasOwnProperty(
          'https://globalplasticshub.org/user_metadata'
        ) &&
        query?.['https://globalplasticshub.org/user_metadata']),
    }

    data.offering = [
      ...(values?.offering ? values?.offering : []),
      ...(values?.offeringSuggested ? values?.offeringSuggested : []),
    ]

    data.seeking = [
      ...(values?.seeking ? values?.seeking : []),
      ...(values?.seekingSuggested ? values?.seekingSuggested : []),
    ]

    data.org = {}
    delete data.confirm
    delete data.offeringSuggested
    delete data.seekingSuggested
    delete data.password
    delete data.privateCitizen

    if (data.cv) {
      data.cv = await getBase64(data.cv)
    }

    data.email = query?.hasOwnProperty('email') ? query?.email : ''

    data.photo = query?.hasOwnProperty('picture') ? query?.picture : ''

    if (data.country) {
      data.country = Number(data.country)
    }

    if (data.publicEmail) {
      data.publicEmail = data.publicEmail === 'true' ? true : false
    }
    if (data.orgName) {
      data.org.id = data.orgName
      data.orgName = {
        [data.orgName]: [...organisations, ...nonMemberOrganisations].find(
          (item) => item.id === data.orgName
        )?.name,
      }
    }

    api
      .post('/profile', data)
      .then((res) => {
        setLoading(false)
        UIStore.update((e) => {
          e.profile = {
            ...res.data,
            emailVerified: query?.email_verified,
          }
        })
        router.push('/workspace')
      })
      .catch((err) => {
        setLoading(false)
        notification.error({
          message: 'Oops, something went wrong',
        })
      })
  }

  const required = (value) => {
    return value ? undefined : 'Required'
  }

  const handleAffiliationChange = (value) => {
    setAffiliation(value)
    formRef?.current?.change('privateCitizen', value)
  }

  const handleSeekingSuggestedTag = (value) => {
    formRef?.current?.change('seeking', [
      ...(formRef?.current?.getFieldState('seeking')?.value
        ? formRef?.current?.getFieldState('seeking')?.value
        : []),
      Object.values(tags)
        .flat()
        .find((o) => o.tag.toLowerCase() === value.toLowerCase())?.tag ||
        value.toLowerCase(),
    ])
  }

  const handleOfferingSuggestedTag = (value) => {
    formRef?.current?.change('offering', [
      ...(formRef?.current?.getFieldState('offering')?.value
        ? formRef?.current?.getFieldState('offering')?.value
        : []),
      Object.values(tags)
        .flat()
        .find((o) => o.tag.toLowerCase() === value.toLowerCase())?.tag ||
        value.toLowerCase(),
    ])
  }

  const handleRemove = (v) => {
    formRef?.current?.change(
      'offering',
      formRef?.current
        ?.getFieldState('offering')
        ?.value.filter(function (item) {
          return item !== v
        })
    )
  }

  const setEntity = (res) => {
    formRef?.current?.change('orgName', res.id)
  }

  return (
    <div className={styles.onboarding}>
      <Form
        initialValues={initialValues}
        validate={(values) => {
          let errors = {}
          const setError = (key, value) => {
            errors = setIn(errors, key, value)
          }
          if (
            (!values.offering || values.offering.length === 0) &&
            currentStep === 3 &&
            (!values.offeringSuggested || values.offeringSuggested.length === 0)
          ) {
            setError('offering', 'Required')
          }
          if (
            (!values.offering || values.offering.length === 0) &&
            currentStep === 3 &&
            (!values.offeringSuggested || values.offeringSuggested.length === 0)
          ) {
            setError('offeringSuggested', 'Required')
          }
          if (
            (!values.seeking || values.seeking.length === 0) &&
            currentStep === 4 &&
            (!values.seekingSuggested || values.seekingSuggested.length === 0)
          ) {
            setError('seeking', 'Required')
          }
          if (
            (!values.seeking || values.seeking.length === 0) &&
            currentStep === 4 &&
            (!values.seekingSuggested || values.seekingSuggested.length === 0)
          ) {
            setError('seekingSuggested', 'Required')
          }
          return errors
        }}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, submitting, form, values }) => {
          formRef.current = form
          return (
            <form onSubmit={handleSubmit} className="step-form">
              <div className={`waveboard s${currentStep}`}>
                <div
                  className="slide getting-started"
                  style={{
                    marginLeft: -(
                      currentStep *
                      (width - 2 * (width < 1024 ? 20 : 170))
                    ),
                  }}
                >
                  <div className="text-wrapper">
                    <h2>
                      <Trans>
                        You’re almost set! <br /> We need to ask a few more
                        questions to make the platform relevant to you.
                      </Trans>
                    </h2>
                  </div>
                  <div className="image-wrapper">
                    <img
                      src="/auth/surfer.svg"
                      alt="getting-started"
                      ref={surferRef}
                    />
                  </div>
                  <div className="button-bottom-panel">
                    <Button
                      size="small"
                      className="step-button-next"
                      withArrow={<LongArrowRight />}
                      onClick={() => next()}
                    >
                      <Trans>Next</Trans>
                    </Button>
                  </div>
                </div>
                <div className="slide">
                  <AffiliationOption
                    {...{ handleAffiliationChange, affiliation, next }}
                  />
                </div>
                <div className="slide">
                  <FormOne
                    validate={currentStep === 2 ? required : null}
                    error={error}
                    setEntity={setEntity}
                  />
                </div>
                <div className="slide">
                  <FormTwo
                    handleOfferingSuggestedTag={handleOfferingSuggestedTag}
                    validate={currentStep === 3 ? required : null}
                    error={error}
                    handleRemove={handleRemove}
                  />
                </div>
                <div className="slide">
                  <FormThree
                    handleSeekingSuggestedTag={handleSeekingSuggestedTag}
                    validate={currentStep === 4 ? required : null}
                    error={error}
                  />
                </div>
                <div className="slide last">
                  <FormFour
                    validate={currentStep === 5 ? required : null}
                    error={error}
                    containsOAuthProvider={containsOAuthProvider}
                  />
                </div>
                <Wave
                  step={currentStep}
                  surferRef={surferRef}
                  width={width}
                  height={height}
                />
                {currentStep > 0 && (
                  <Button
                    size="small"
                    className="step-button-back"
                    ghost
                    back
                    onClick={previous}
                  >
                    <LongArrowRight />
                    <Trans>Back</Trans>
                  </Button>
                )}
                {currentStep < 5 && currentStep > 1 && (
                  <Button
                    size="small"
                    className="step-button-next abs"
                    onClick={() => next()}
                    withArrow
                  >
                    <Trans>Next</Trans>
                  </Button>
                )}
                {currentStep === 5 && (
                  <Button
                    size="small"
                    className="step-button-next abs"
                    onClick={handleSubmit}
                    loading={loading}
                  >
                    <Trans>Submit</Trans>
                  </Button>
                )}
              </div>
            </form>
          )
        }}
      </Form>
    </div>
  )
}

const Wave = ({ step, surferRef, width, height }) => {
  const ref = useRef()
  const listener = (e) => {
    const axx = (width / 2 - e.x) / (width / 2)
    const axy = Math.max(0, (height / 1.2 - e.y) / (height / 1.2))
    ref.current.style.marginLeft = `${axx * 100}px`
    ref.current.style.marginBottom = `${-axy * 100}px`
    surferRef.current.style.transform = `translate(${axx * 70}px, ${
      axy * 200 - 50
    }px)`
  }
  useEffect(() => {
    document.addEventListener('mousemove', listener)
    return () => {
      document.removeEventListener('mousemove', listener)
    }
  }, [])
  return (
    <div className="wave" style={{ left: -(step * (width + 200)) }}>
      <img src="/auth/wave.svg" ref={ref} />
    </div>
  )
}

export default Authentication
