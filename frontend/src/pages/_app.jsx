import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Auth0Provider } from '@auth0/auth0-react'
import Head from 'next/head'
// import '../main.scss'
// import '../buttons.scss'
import { withLayout } from '../layouts/MainLayout'
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

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  if (router.pathname !== '/landing') {
    import('../main.scss')
    import('../buttons.scss')
  } else {
    import('../styles/base.scss')
  }
  const { profile } = UIStore.useState((s) => ({
    profile: s.profile,
    disclaimer: s.disclaimer,
    nav: s.nav,
    tags: s.tags,
  }))
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [_expiresAt, setExpiresAt] = useState(null)
  const [idToken, setIdToken] = useState(null)
  const [authResult, setAuthResult] = useState(null)
  const [loginVisible, setLoginVisible] = useState(false)

  const LayoutRef = useRef(null)
  const NewLayoutRef = useRef(null)

  const isAuthenticated = new Date().getTime() < _expiresAt

  const setSession = (authResult) => {
    setExpiresAt(authResult.expiresIn * 1000 + new Date().getTime())
    setIdToken(authResult.idToken)
    setAuthResult(authResult)
    scheduleTokenRenewal()
  }

  console.log(new Date().getTime() < _expiresAt)

  useEffect(() => {
    const fetchData = async () => {
      const res = await Promise.all([
        api.get('/tag'),
        api.get('/currency'),
        api.get('/country'),
        api.get('/country-group'),
        api.get('/organisation'),
        api.get('/nav'),
        api.get('/stakeholder'),
        api.get('/non-member-organisation'),
        api.get('/community?representativeGroup=Government'),
      ])

      const [
        tag,
        currency,
        country,
        countryGroup,
        organisation,
        nav,
        stakeholder,
        nonMemberOrganisations,
        community,
      ] = res

      const data = {
        tags: tag.data,
        currencies: currency.data,
        countries: uniqBy(country.data).sort((a, b) =>
          a.name?.localeCompare(b.name)
        ),
        regionOptions: countryGroup.data.filter((x) => x.type === 'region'),
        meaOptions: countryGroup.data.filter((x) => x.type === 'mea'),
        transnationalOptions: countryGroup.data.filter(
          (x) => x.type === 'transnational'
        ),
        organisations: uniqBy(
          sortBy(organisation.data, ['name'])
        ).sort((a, b) => a.name?.localeCompare(b.name)),
        nonMemberOrganisations: uniqBy(
          sortBy(nonMemberOrganisations.data, ['name'])
        ).sort((a, b) => a.name?.localeCompare(b.name)),
        nav: nav.data,
        stakeholders: stakeholder.data,
        community: community.data,
      }
      UIStore.update((s) => {
        Object.assign(s, data)
      })
    }
    fetchData()
  }, [])

  const renewToken = (cb) => {
    auth0Client.checkSession({}, (err, result) => {
      if (err) {
        console.log(`Error: ${err.error} - ${err.error_description}.`)
      } else {
        setSession(result)
      }

      if (cb) {
        cb(err, result)
      }
    })
  }

  const scheduleTokenRenewal = () => {
    const delay = _expiresAt - Date.now()
    if (delay > 0) {
      setTimeout(() => renewToken(), delay)
    }
  }

  useEffect(() => {
    auth0Client.parseHash((err, authResult) => {
      if (err) {
        return console.log(err)
      }
      if (authResult) {
        const storedLocation = localStorage.getItem('redirect_on_login')
        const redirectLocation = storedLocation
          ? JSON.parse(storedLocation)
          : null

        if (redirectLocation) {
          router.push({
            pathname: redirectLocation.pathname,
            query: redirectLocation.query,
          })
        } else {
          router.push('/')
        }
        setSession(authResult)
        api.setToken(authResult.idToken)
        if (
          authResult?.idTokenPayload?.hasOwnProperty(
            'https://digital.gpmarinelitter.org/is_new'
          )
        ) {
          if (
            authResult?.idTokenPayload?.[
              'https://digital.gpmarinelitter.org/is_new'
            ]
          ) {
            UIStore.update((e) => {
              e.profile = {
                emailVerified: authResult?.idTokenPayload?.email_verified,
              }
            })
            console.log(authResult?.idTokenPayload, authResult)
            router.push(
              {
                pathname: '/onboarding',
                query: { data: JSON.stringify(authResult?.idTokenPayload) },
              },
              '/onboarding'
            )
          }
        }
      }
      localStorage.removeItem('redirect_on_login')
    })
  }, [])

  useEffect(() => {
    auth0Client.checkSession({}, async (err, authResult) => {
      if (err) {
        console.log(err)
        setLoadingProfile(true)
        // history.push("/login");
      }
      if (authResult) {
        setSession(authResult)
      }
    })
  }, [])

  useEffect(() => {
    ;(async function fetchData() {
      if (isAuthenticated && idToken) {
        api.setToken(idToken)
      } else {
        api.setToken(null)
      }
      if (isAuthenticated && idToken && authResult) {
        let resp = await api.get('/profile')
        setLoadingProfile(false)
        if (resp.data && Object.keys(resp.data).length === 0) {
          console.log(authResult, 'authResult')
          router.push(
            {
              pathname: '/onboarding',
              query: { data: JSON.stringify(authResult?.idTokenPayload) },
            },
            '/onboarding'
          )
        }
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
  }, [idToken, authResult])

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
      setLoginVisible,
      loadingProfile,
    }),
    [
      isAuthenticated,
      auth0Client,
      profile,
      loginVisible,
      setLoginVisible,
      loadingProfile,
    ]
  )

  if (router.pathname.startsWith('/knowledge/library/')) {
    if (!LayoutRef.current) {
      LayoutRef.current = withLayout(Component)
    }

    if (!NewLayoutRef.current) {
      NewLayoutRef.current = withNewLayout(Component)
    }
  } else {
    LayoutRef.current = null
    NewLayoutRef.current = null
  }

  const Layout = LayoutRef.current || withLayout(Component)
  const NewLayout = NewLayoutRef.current || withNewLayout(Component)

  return (
    <div id="root">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="GPML Digital Platform" />
        <title>UNEP GPML Digital Platform</title>
      </Head>
      <Auth0Provider
        domain={domain}
        clientId={
          typeof window !== 'undefined' ? window.__ENV__.auth0.clientId : ''
        }
        redirectUri={
          typeof window !== 'undefined' ? window.location.origin : ''
        }
      >
        {router.pathname !== '/landing' ? (
          <Layout {...pageProps} {...componentProps} />
        ) : (
          <NewLayout {...pageProps} {...componentProps} />
        )}
      </Auth0Provider>
    </div>
  )
}

export default MyApp
