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
import { uniqBy, sortBy, cloneDeep } from 'lodash'
import { withNewLayout } from '../layouts/new-layout'
import axios from 'axios'

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const { profile, menuList } = UIStore.useState((s) => ({
    profile: s.profile,
    disclaimer: s.disclaimer,
    nav: s.nav,
    tags: s.tags,
    menuList: s.menuList,
  }))
  const [state, setState] = useState({
    _expiresAt: null,
    idToken: null,
    authResult: null,
    loadingProfile: true,
    loginVisible: false,
  })

  const {
    _expiresAt,
    idToken,
    authResult,
    loadingProfile,
    loginVisible,
  } = state

  useEffect(() => {
    const updatedMenu = processAndCategorizeData(pageProps, menuList)

    UIStore.update((s) => {
      s.menuList = updatedMenu
    })
  }, [])

  const isMounted = useRef(true)

  const isAuthenticated = new Date().getTime() < _expiresAt

  const setSession = useCallback((authResult) => {
    setState((prevState) => ({
      ...prevState,
      _expiresAt: authResult.expiresIn * 1000 + new Date().getTime(),
      idToken: authResult.idToken,
      authResult,
    }))
    scheduleTokenRenewal()
  }, [])

  const fetchData = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    if (!isMounted.current) return
    fetchData()
    return () => {
      isMounted.current = false
    }
  }, [fetchData])

  const renewToken = useCallback((cb) => {
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
        const redirectLocation = localStorage.getItem('redirect_on_login')
          ? JSON.parse(localStorage.getItem('redirect_on_login'))
          : null
        if (redirectLocation) {
          router.push({
            pathname: redirectLocation,
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
        setState((prevState) => ({
          ...prevState,
          loadingProfile: false,
        }))
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
        setState((prevState) => ({ ...prevState, loadingProfile: true }))
        let resp = await api.get('/profile')
        setState((prevState) => ({ ...prevState, loadingProfile: false }))
        if (resp.data && Object.keys(resp.data).length === 0) {
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
      setLoginVisible: (value) =>
        setState((prevState) => ({
          ...prevState,
          loginVisible: value,
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
        {getLayout(<Component {...pageProps} {...componentProps} />)}
      </Auth0Provider>
    </div>
  )
}

MyApp.getInitialProps = async (context) => {
  try {
    const domainName = process.env.REACT_APP_FEENV
      ? 'unep-gpml.akvotest.org'
      : getDomainName(context.req.headers.host)

    const response = await axios.get(buildApiUrl(domainName))
    return {
      pageProps: response.data.data,
    }
  } catch (error) {
    return {
      props: { notFound: true },
    }
  }
}

const buildApiUrl = (domainName) => {
  const sections = [
    'about-network',
    'about-platform',
    'plastic-topics',
    'plastic-basics',
  ]
  const filters = sections
    .map((section) => `filters[section][$eq]=${section}`)
    .join('&')
  return `https://${domainName}/strapi/api/pages?locale=all&${filters}&fields=title&fields=subtitle&fields=section`
}

const getDomainName = (host) => {
  return host.split(':')[0]
}

const MENU_MAPPING = {
  'about-platform': {
    key: 'About Us',
    subKey: 'The platform',
  },
  'about-network': {
    key: 'About Us',
    subKey: 'Our Network',
  },
  'plastic-topics': {
    key: 'Plastic',
    subKey: 'Topics',
  },
  'plastic-basics': {
    key: 'Plastic',
    subKey: 'Basics',
  },
}

const processAndCategorizeData = (responseData, menuList) => {
  const menu = cloneDeep(menuList)

  responseData.forEach((item) => {
    const { section, title, subtitle } = item.attributes

    const menuMapping = MENU_MAPPING[section]
    if (!menuMapping) return

    const sectionIndex = menu.findIndex(
      (menuItem) => menuItem.key === menuMapping.key
    )
    if (sectionIndex === -1) return

    const subSection = menu[sectionIndex].children.find(
      (child) => child.key === menuMapping.subKey
    )
    if (!subSection) return

    if (!subSection.children) {
      subSection.children = []
    }

    subSection.children.push({
      title,
      subtitle,
    })
  })

  return menu
}

export default MyApp
