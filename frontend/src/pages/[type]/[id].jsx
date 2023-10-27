import React, { memo } from 'react'
import { useRouter } from 'next/router'
import NewDetailsView from '../../modules/details-page/view'
import api from '../../utils/api'
import { getTypeByResource } from '../../modules/flexible-forms/view'
import { loadCatalog } from '../../translations/utils'

const VALID_TYPES = [
  'initiative',
  'action-plan',
  'policy',
  'technical-resource',
  'financing-resource',
  'technology',
  'event',
  'case-study',
]

const Details = ({ data, translations, setLoginVisible, isAuthenticated }) => {
  const router = useRouter()
  const { type, id } = router.query
  if (!VALID_TYPES.includes(type)) {
    return <p>Invalid type!</p>
  }

  return (
    <NewDetailsView
      serverData={data}
      serverTranslations={translations}
      type={type}
      id={id}
      setLoginVisible={setLoginVisible}
      isAuthenticated={isAuthenticated}
      isServer={true}
    />
  )
}

export default memo(Details)

export async function getServerSideProps(context) {
  const { type, id } = context.query

  const { req } = context

  const forwardedProtos = (req.headers['x-forwarded-proto'] || '').split(',')

  const protocol = forwardedProtos[0] || 'http'

  const baseUrl = `${protocol}://${req.headers.host}/`

  const API_ENDPOINT = process.env.REACT_APP_FEENV
    ? 'https://unep-gpml.akvotest.org/api/'
    : `${baseUrl}/api/`

  if (!VALID_TYPES.includes(type)) {
    return {
      props: {
        invalidType: true,
      },
    }
  }

  try {
    const dataRes = await api.get(
      `${API_ENDPOINT}/detail/${type.replace('-', '_')}/${id}`
    )
    const translationsRes = await api.get(
      `${API_ENDPOINT}/translations/${
        getTypeByResource(type.replace('-', '_')).translations
      }/${id}`
    )
    return {
      props: {
        data: dataRes.data,
        translations: translationsRes.data,
        url: baseUrl,
        i18n: await loadCatalog(context.locale),
      },
    }
  } catch (error) {
    return {
      props: {
        error: error,
        url: `${API_ENDPOINT}/detail/${type.replace('-', '_')}/${id}`,
      },
    }
  }
}
