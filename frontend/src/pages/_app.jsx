import React, { useState, useEffect } from 'react'
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

const res = await Promise.all([
  api.get('https://digital.gpmarinelitter.org/api/tag'),
  api.get('https://digital.gpmarinelitter.org/api/currency'),
  api.get('https://digital.gpmarinelitter.org/api/country'),
  api.get('https://digital.gpmarinelitter.org/api/country-group'),
  api.get('https://digital.gpmarinelitter.org/api/organisation'),
  api.get('https://digital.gpmarinelitter.org/api/nav'),
  api.get('https://digital.gpmarinelitter.org/api/stakeholder'),
  api.get('https://digital.gpmarinelitter.org/api/non-member-organisation'),
  api.get(
    'https://digital.gpmarinelitter.org/api/community?representativeGroup=Government'
  ),
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
  countries: uniqBy(country.data).sort((a, b) => a.name?.localeCompare(b.name)),
  regionOptions: countryGroup.data.filter((x) => x.type === 'region'),
  meaOptions: countryGroup.data.filter((x) => x.type === 'mea'),
  transnationalOptions: countryGroup.data.filter(
    (x) => x.type === 'transnational'
  ),
  organisations: uniqBy(sortBy(organisation.data, ['name'])).sort((a, b) =>
    a.name?.localeCompare(b.name)
  ),
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

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  if (router.pathname !== '/landing') {
    import('../main.scss')
    // import('../buttons.scss')
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

  const isAuthenticated = new Date().getTime() < _expiresAt

  const setSession = (authResult) => {
    setExpiresAt(authResult.expiresIn * 1000 + new Date().getTime())
    setIdToken(authResult.idToken)
    setAuthResult(authResult)
    scheduleTokenRenewal()
  }

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
        const redirectLocation =
          localStorage.getItem('redirect_on_login') === 'undefined'
            ? '/'
            : JSON.parse(localStorage.getItem('redirect_on_login'))
        router.push({
          pathname: redirectLocation.pathname,
          ...(redirectLocation?.search && { query: redirectLocation?.search }),
        })
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
            router.push(
              {
                pathname: '/onboarding',
                query: { data: authResult?.idTokenPayload },
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
          router.push(
            {
              pathname: '/onboarding',
              query: { data: authResult?.idTokenPayload },
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

  const Layout = withLayout(Component)
  const NewLayout = withNewLayout(Component)

  const domain = 'https://unep-gpml-test.eu.auth0.com/'.replace(
    /(https:\/\/|\/)/gi,
    ''
  )

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
        clientId="dxfYNPO4D9ovQr5NHFkOU3jwJzXhcq5J"
        redirectUri={
          typeof window !== 'undefined' ? window.location.origin : ''
        }
      >
        {router.pathname !== '/landing' && (
          <Layout
            {...pageProps}
            {...{
              isAuthenticated,
              auth0Client,
              profile,
            }}
          />
        )}
        {router.pathname === '/landing' && (
          <NewLayout
            {...pageProps}
            {...{
              isAuthenticated,
              auth0Client,
              profile,
            }}
          />
        )}
      </Auth0Provider>
    </div>
  )
}

export default MyApp
