import React from 'react'
import { loadCatalog } from '../translations/utils'
import Landing from '../pages/landing'
import api from '../utils/api'
import axios from 'axios'
import { getStrapiUrl } from '../utils/misc'

function HomePage({
  isAuthenticated,
  setLoginVisible,
  i18n,
  data,
  cop,
  layers,
}) {
  return (
    <Landing
      isAuthenticated={isAuthenticated}
      setLoginVisible={setLoginVisible}
      data={data?.counts}
      i18n={i18n}
      cop={cop?.meta?.pagination?.total}
      layers={layers?.meta?.pagination?.total}
    />
  )
}

export async function getServerSideProps(ctx) {
  const strapiUrl = getStrapiUrl()
  try {
    const urls = [
      'https://globalplasticshub.org/api/browse?limit=1',
      `${strapiUrl}/api/cops?locale=en&populate=attachments`,
      `${strapiUrl}/api/layers?locale=en`,
    ]

    const responses = await Promise.all(urls.map((url) => axios.get(url)))

    const [data, cop, layers] = responses.map((res) => res.data)

    const i18n = await loadCatalog(ctx.locale)

    return {
      props: {
        i18n,
        data,
        cop,
        layers,
      },
    }
  } catch (error) {
    return {
      props: {
        i18n: {},
        data: {},
        error: JSON.stringify(error),
      },
    }
  }
}

export default HomePage
