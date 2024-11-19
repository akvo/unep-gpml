import React, { memo } from 'react'
import { useRouter } from 'next/router'
import NewDetailsView from '../../modules/details-page/view'
import api from '../../utils/api'
import { getTypeByResource } from '../../modules/flexible-forms/view'
import { loadCatalog } from '../../translations/utils'
import Head from 'next/head'
import ProjectDetail from '../../modules/project-detail/project-detail'

const VALID_TYPES = [
  'initiative',
  'action-plan',
  'policy',
  'technical-resource',
  'financing-resource',
  'technology',
  'event',
  'case-study',
  'data-catalog',
  'project',
]

const Details = ({
  data,
  translations,
  setLoginVisible,
  isAuthenticated,
  domainValue,
}) => {
  const router = useRouter()
  const { type, id } = router.query
  if (!VALID_TYPES.includes(type)) {
    return <p>Invalid type!</p>
  }

  const sliceMetaDesc = (words = '', maxLength = 158) => {
    if (words?.length <= maxLength) {
      return words
    }
    let slicedWords = words?.slice(0, maxLength)
    let lastSpaceIndex = slicedWords?.lastIndexOf(' ')
    if (lastSpaceIndex !== -1) {
      slicedWords = slicedWords?.slice(0, lastSpaceIndex)
    }
    return slicedWords
  }

  return (
    <>
      <Head>
        {/* HTML Meta Tags */}
        <title>{data?.title}</title>
        <meta name="description" content={sliceMetaDesc(data?.summary)} />
        <meta property="og:type" content="website" />

        {/* Facebook Meta Tags */}
        <meta
          property="og:url"
          content={`https://${domainValue}/${type}/${id}`}
        />
        <meta property="og:title" content={data?.title} />
        <meta
          property="og:description"
          content={sliceMetaDesc(data?.summary)}
        />
        <meta property="og:image" content={data?.image} />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content={domainValue} />
        <meta
          property="twitter:url"
          content={`https://${domainValue}/${type}/${id}`}
        />
        <meta name="twitter:title" content={data?.title} />
        <meta
          name="twitter:description"
          content={sliceMetaDesc(data?.summary)}
        />
        <meta name="twitter:image" content={data?.image} />
      </Head>
      {type === 'project' ? (
        <ProjectDetail
          {...{ data, setLoginVisible, isAuthenticated, isServer: true }}
        />
      ) : (
        <NewDetailsView
          serverData={data}
          serverTranslations={translations}
          type={type}
          id={id}
          setLoginVisible={setLoginVisible}
          isAuthenticated={isAuthenticated}
          isServer={true}
        />
      )}
    </>
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
      `${API_ENDPOINT}detail/${type.replace('-', '_')}/${id}`
    )
    let translationsRes = null
    if (type !== 'project') {
      translationsRes = await api.get(
        `${API_ENDPOINT}/translations/${
          getTypeByResource(type.replace('-', '_')).translations
        }/${id}`
      )
    }
    // console.log(dataRes.data)
    return {
      props: {
        data: dataRes.data,
        translations: translationsRes != null ? translationsRes?.data : null,
        url: baseUrl,
        i18n: await loadCatalog(context.locale),
        domainValue: req?.headers?.host,
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
