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
  const [authStateVersion, setAuthStateVersion] = useState(0)
  const tokenRenewalTimeoutRef = useRef(null)
  const isRenewingRef = useRef(false)

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

    if (tokenRenewalTimeoutRef.current) {
      clearTimeout(tokenRenewalTimeoutRef.current)
    }

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

    setAuthStateVersion((prev) => prev + 1)
    scheduleTokenRenewal(expiresAt)
  }, [])

  const renewToken = useCallback(
    (cb) => {
      if (isRenewingRef.current) {
        if (cb) cb(new Error('Token renewal already in progress'), null)
        return
      }

      isRenewingRef.current = true

      auth0Client.checkSession({}, (err, result) => {
        isRenewingRef.current = false

        if (err) {
          console.error('Token renewal failed:', err)
          if (
            err.error === 'login_required' ||
            err.error === 'consent_required'
          ) {
            localStorage.removeItem('idToken')
            localStorage.removeItem('expiresAt')
            localStorage.removeItem('idTokenPayload')
            setState((prevState) => ({
              ...prevState,
              _expiresAt: null,
              idToken: null,
              authResult: null,
              loadingProfile: false,
            }))
            setAuthStateVersion((prev) => prev + 1)
          }
        } else if (result) {
          api.setToken(result.idToken)
          setSession(result)
        }

        if (cb) cb(err, result)
      })
    },
    [setSession]
  )

  const scheduleTokenRenewal = useCallback(
    (expiresAt) => {
      const now = Date.now()
      const timeUntilRenewal = expiresAt - now - 300000

      if (timeUntilRenewal > 0) {
        tokenRenewalTimeoutRef.current = setTimeout(() => {
          renewToken()
        }, timeUntilRenewal)
      }
    },
    [renewToken]
  )

  useEffect(() => {
    const initializeAuth = () => {
      auth0Client.parseHash((err, authResult) => {
        if (err) {
          console.error('Auth hash parse error:', err)
          return
        }

        if (authResult) {
          api.setToken(authResult.idToken)
          setSession(authResult)
          return
        }

        const storedIdToken = localStorage.getItem('idToken')
        const storedIdTokenPayload = localStorage.getItem('idTokenPayload')
        const storedExpiresAt = parseInt(localStorage.getItem('expiresAt'), 10)
        const now = Date.now()

        if (storedIdToken && storedExpiresAt && now < storedExpiresAt) {
          const authResult = {
            idToken: storedIdToken,
            idTokenPayload: JSON.parse(storedIdTokenPayload || '{}'),
            expiresIn: (storedExpiresAt - now) / 1000,
          }

          api.setToken(storedIdToken)
          setState((prevState) => ({
            ...prevState,
            _expiresAt: storedExpiresAt,
            idToken: storedIdToken,
            authResult,
          }))

          scheduleTokenRenewal(storedExpiresAt)

          if (storedExpiresAt - now < 300000) {
            renewToken()
          }
        } else {
          renewToken((err, result) => {
            if (!err && result) {
              api.setToken(result.idToken)
            } else {
              setState((prevState) => ({
                ...prevState,
                loadingProfile: false,
              }))
            }
          })
        }
      })
    }

    initializeAuth()

    return () => {
      if (tokenRenewalTimeoutRef.current) {
        clearTimeout(tokenRenewalTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated || !authResult || loadingProfile === false) {
        return
      }

      setState((prevState) => ({ ...prevState, loadingProfile: true }))

      try {
        const resp = await api.get('/profile')

        if (resp.data && Object.keys(resp.data).length === 0) {
          const formData = {
            firstName:
              authResult.idTokenPayload?.[
                'https://globalplasticshub.org/user_metadata'
              ]?.firstName ||
              authResult.idTokenPayload?.['given_name'] ||
              '',
            lastName:
              authResult.idTokenPayload?.[
                'https://globalplasticshub.org/user_metadata'
              ]?.lastName ||
              authResult.idTokenPayload?.['family_name'] ||
              '',
            title:
              authResult.idTokenPayload?.[
                'https://globalplasticshub.org/user_metadata'
              ]?.title || '',
            publicEmail: false,
            publicDatabase: true,
          }

          const newProfileResp = await api.post('/profile', formData)
          UIStore.update((e) => {
            e.profile = {
              ...newProfileResp.data,
              email: authResult?.idTokenPayload?.email,
              emailVerified: authResult?.idTokenPayload?.email_verified,
            }
          })
        } else {
          UIStore.update((e) => {
            e.profile = {
              ...resp.data,
              email: authResult?.idTokenPayload?.email,
              emailVerified: authResult?.idTokenPayload?.email_verified,
            }
          })
        }

        updateStatusProfile(resp.data)

        const redirectLocation = localStorage.getItem('redirect_on_login')
        if (redirectLocation) {
          try {
            const parsedLocation = JSON.parse(redirectLocation)
            router.push(parsedLocation)
          } catch (e) {
            console.error('Invalid redirect location:', e)
          }
          localStorage.removeItem('redirect_on_login')
        }
      } catch (error) {
        console.error('Profile loading failed:', error)
      } finally {
        setState((prevState) => ({ ...prevState, loadingProfile: false }))
      }
    }

    loadProfile()
  }, [authResult, isAuthenticated])

  useEffect(() => {
    const syncCheck = setInterval(() => {
      const storedExpiresAt = parseInt(localStorage.getItem('expiresAt'), 10)
      const currentlyAuthenticated = new Date().getTime() < storedExpiresAt

      if (currentlyAuthenticated !== isAuthenticated) {
        console.log('Auth state mismatch detected, forcing sync')
        setAuthStateVersion((prev) => prev + 1)

        if (currentlyAuthenticated && storedExpiresAt) {
          const storedIdToken = localStorage.getItem('idToken')
          const storedIdTokenPayload = localStorage.getItem('idTokenPayload')

          if (storedIdToken) {
            setState((prevState) => ({
              ...prevState,
              _expiresAt: storedExpiresAt,
              idToken: storedIdToken,
              authResult: {
                idToken: storedIdToken,
                idTokenPayload: JSON.parse(storedIdTokenPayload || '{}'),
                expiresIn: (storedExpiresAt - Date.now()) / 1000,
              },
            }))
            api.setToken(storedIdToken)
          }
        }
      }
    }, 10000)

    return () => clearInterval(syncCheck)
  }, [isAuthenticated])

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
    [
      isAuthenticated,
      auth0Client,
      profile,
      loginVisible,
      loadingProfile,
      authStateVersion,
    ]
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
