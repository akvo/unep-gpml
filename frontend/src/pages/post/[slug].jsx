import axios from 'axios'
import styles from './style.module.scss'
import moment from 'moment'
import Head from 'next/head'
import { transformStrapiResponse } from '../../utils/misc'
import Image from 'next/image'
import { loadCatalog } from '../../translations/utils'

const StrapiPage = ({ pageData }) => {
  return (
    <div className={styles.page}>
      <Head>
        <title>{pageData.title}</title>
      </Head>
      <div className="container">
        <div className="cover">
          <Image
            src={pageData.cover.data.attributes.url}
            fill
            objectFit="contain"
          />
        </div>
        <p className="date">
          {moment(pageData.publishedAt).format('MMMM DD, YYYY')}
        </p>
        <h1 className="h-l">{pageData.title}</h1>
        <div
          className="content"
          dangerouslySetInnerHTML={{ __html: pageData.content }}
        />
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  const { slug } = context.params
  const text = slug.split('-')
  const id = text.shift()
  const result = text.join('-')

  try {
    const domainName = process.env.REACT_APP_FEENV
      ? 'unep-gpml.akvotest.org'
      : getDomainName(context.req.headers.host)

    const response = await axios.get(
      `https://${domainName}/strapi/api/posts?filters[slug][$eq]=${result}&populate=*`
    )
    if (response.data.data.length === 0) {
      return { notFound: true }
    }
    const pageData = transformStrapiResponse(response.data.data)[0]

    return {
      props: { pageData, i18n: await loadCatalog(context.locale) },
    }
  } catch (error) {
    console.error(error)
    return {
      props: { notFound: true },
    }
  }
}

const getDomainName = (host) => {
  return host.split(':')[0]
}

export default StrapiPage
