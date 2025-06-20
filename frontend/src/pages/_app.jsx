import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Auth0Provider } from '@auth0/auth0-react'
import Head from 'next/head'
import '../styles/base.scss'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { UIStore } from '../store'
import { auth0Client } from '../utils/misc'
import api from '../utils/api'
import { useRouter } from 'next/router'
import { updateStatusProfile } from '../utils/profile'
import { uniqBy, sortBy } from 'lodash'
import { withNewLayout } from '../layouts/new-layout'
import { I18nProvider } from '@lingui/react'
import { useLinguiInit } from '../translations/utils'
import Script from 'next/script'

function MyApp({ Component, pageProps }) {
  const i18n = useLinguiInit(pageProps.i18n)
  const router = useRouter()
  const { profile } = UIStore.useState((s) => ({
    profile: s.profile,
    disclaimer: s.disclaimer,
    nav: s.nav,
    tags: s.tags,
  }))
  const [state, setState] = useState({
    _expiresAt: null,
    idToken: null,
    authResult: null,
    loadingProfile: true,
    loginVisible: false,
    shouldLoginClose: false,
    shouldJoin: false,
  })

  const { authResult } = state

  const [loadScript, setLoadScript] = useState(false)

  const {
    _expiresAt,
    loadingProfile,
    loginVisible,
    shouldLoginClose,
    shouldJoin,
  } = state

  const isAuthenticated = new Date().getTime() < _expiresAt

  const setSession = useCallback((authResult) => {
    const expiresAt = authResult.expiresIn * 1000 + new Date().getTime()
    localStorage.setItem('idToken', authResult.idToken)
    localStorage.setItem('expiresAt', expiresAt.toString())
    localStorage.setItem(
      'idTokenPayload',
      JSON.stringify(authResult.idTokenPayload)
    )

    setState((prevState) => ({
      ...prevState,
      _expiresAt: expiresAt,
      idToken: authResult.idToken,
      authResult,
    }))
    scheduleTokenRenewal()
  }, [])

  const renewToken = useCallback((cb) => {
    auth0Client.checkSession({}, (err, result) => {
      if (err) {
        setState((prevState) => ({
          ...prevState,
          loadingProfile: false,
          isAuthenticated: false,
        }))
      } else {
        setSession(result)
      }

      if (cb) {
        cb(err, result)
      }
    })
  }, [])

  const scheduleTokenRenewal = useCallback(() => {
    const delay = _expiresAt - Date.now()
    if (delay > 0) {
      setTimeout(() => renewToken(), delay)
    }
  }, [])

  useEffect(() => {
    auth0Client.parseHash((err, authResult) => {
      if (err) {
        return console.log(err)
      }
      if (authResult) {
        api.setToken(authResult.idToken)
        setSession(authResult)
      }
    })
  }, [])

  const isTokenNearlyExpired = (expiresAt, threshold = 300000) => {
    const now = new Date().getTime()
    return expiresAt - now < threshold
  }

  useEffect(() => {
    const checkToken = () => {
      const storedIdToken = localStorage.getItem('idToken')
      const storedIdTokenPayload = localStorage.getItem('idTokenPayload')
      const storedExpiresAt = parseInt(localStorage.getItem('expiresAt'), 10)
      const now = new Date().getTime()

      if (storedIdToken && now < storedExpiresAt) {
        const authResult = {
          idToken: storedIdToken,
          idTokenPayload: JSON.parse(storedIdTokenPayload),
        }
        api.setToken(storedIdToken)
        setSession({ ...authResult, expiresIn: (storedExpiresAt - now) / 1000 })

        if (isTokenNearlyExpired(storedExpiresAt)) {
          renewToken()
        }
      } else if (storedIdToken) {
        renewToken((err, renewedAuthResult) => {
          if (err) {
            localStorage.removeItem('idToken')
            localStorage.removeItem('expiresAt')
            setState((prevState) => ({
              ...prevState,
              loadingProfile: false,
              isAuthenticated: false,
            }))
          } else {
            api.setToken(renewedAuthResult.idToken)
          }
        })
      } else {
        renewToken((err, renewedAuthResult) => {
          if (renewedAuthResult) {
            api.setToken(renewedAuthResult.idToken)
          }
        })
      }
    }

    checkToken()
    const intervalId = setInterval(checkToken, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [setSession, renewToken])

  useEffect(() => {
    ;(async function fetchData() {
      const idToken = localStorage.getItem('idToken')
      if (isAuthenticated && idToken && authResult) {
        setState((prevState) => ({ ...prevState, loadingProfile: true }))
        let resp = await api.get('/profile')
        setState((prevState) => ({ ...prevState, loadingProfile: false }))
        if (resp.data && Object.keys(resp.data).length === 0) {
          const formData = {
            firstName: authResult.idTokenPayload[
              'https://globalplasticshub.org/user_metadata'
            ]
              ? authResult.idTokenPayload[
                  'https://globalplasticshub.org/user_metadata'
                ].firstName
              : authResult.idTokenPayload['given_name']
              ? authResult.idTokenPayload['given_name']
              : '',
            lastName: authResult.idTokenPayload[
              'https://globalplasticshub.org/user_metadata'
            ]
              ? authResult.idTokenPayload[
                  'https://globalplasticshub.org/user_metadata'
                ].lastName
              : authResult.idTokenPayload['family_name']
              ? authResult.idTokenPayload['family_name']
              : '',
            title: authResult.idTokenPayload[
              'https://globalplasticshub.org/user_metadata'
            ]
              ? authResult.idTokenPayload[
                  'https://globalplasticshub.org/user_metadata'
                ].title
              : '',
            publicEmail: false,
            publicDatabase: true,
          }
          api.post('/profile', formData).then((res) => {
            UIStore.update((e) => {
              e.profile = {
                ...res.data,
                email: authResult?.idTokenPayload?.email,
                emailVerified: authResult?.idTokenPayload?.email_verified,
              }
            })
          })
        }
        const redirectLocation = localStorage.getItem('redirect_on_login')
          ? JSON.parse(localStorage.getItem('redirect_on_login'))
          : null
        if (redirectLocation) {
          router.push(redirectLocation)
        }
        localStorage.removeItem('redirect_on_login')
        UIStore.update((e) => {
          e.profile = {
            ...resp.data,
            email: authResult?.idTokenPayload?.email,
            emailVerified: authResult?.idTokenPayload?.email_verified,
          }
        })
        updateStatusProfile(resp.data)
      }
    })()
  }, [authResult])

  useEffect(() => {
    const host = window?.location?.hostname
    if (host === 'globalplasticshub.org') {
      setLoadScript(true)
    }
  }, [])

  const domain =
    typeof window !== 'undefined'
      ? window.__ENV__.auth0.domain.replace(/(https:\/\/|\/)/gi, '')
      : ''

  const componentProps = useMemo(
    () => ({
      isAuthenticated,
      auth0Client,
      profile,
      loginVisible,
      shouldLoginClose,
      shouldJoin,
      setLoginVisible: (value) =>
        setState((prevState) => ({
          ...prevState,
          loginVisible: value,
        })),
      setShouldLoginClose: (value) =>
        setState((prevState) => ({
          ...prevState,
          shouldLoginClose: value,
        })),
      setShouldJoin: (value) =>
        setState((prevState) => ({
          ...prevState,
          shouldJoin: value,
        })),
      loadingProfile,
    }),
    [isAuthenticated, auth0Client, profile, loginVisible, loadingProfile]
  )

  const DefaultLayout = useMemo(() => {
    return withNewLayout(Component)
  }, [Component])

  const getLayout =
    Component.getLayout ||
    ((page) => (
      <DefaultLayout {...pageProps} {...componentProps}>
        {page}
      </DefaultLayout>
    ))

  return (
    <div id="root">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#020A5C" />
        <meta
          name="description"
          content="The Global Plastics Hub is the largest global platform for technical resources, integrated data, and collaborative action on plastic pollution."
        />
        <title>Global Plastics Hub</title>
      </Head>
      <Auth0Provider
        domain={domain}
        clientId={
          typeof window !== 'undefined' ? window.__ENV__.auth0.clientId : ''
        }
        redirectUri={
          typeof window !== 'undefined' ? window.location.origin : ''
        }
        cacheLocation="localstorage"
        useRefreshTokens
      >
        <I18nProvider i18n={i18n}>
          {loadScript && (
            <>
              <Script
                src="https://www.googletagmanager.com/gtag/js?id=G-NCNKDZ0R29"
                strategy="afterInteractive"
              />
              <Script id="google-analytics" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-NCNKDZ0R29');
        `}
              </Script>
            </>
          )}
          {getLayout(<Component {...pageProps} {...componentProps} />)}
        </I18nProvider>
      </Auth0Provider>
    </div>
  )
}

export default MyApp
