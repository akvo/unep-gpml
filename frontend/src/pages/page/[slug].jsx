import axios from 'axios'
import styles from './style.module.scss'
import moment from 'moment'
import Head from 'next/head'
import { loadCatalog } from '../../translations/utils'
import { getStrapiUrl } from '../../utils/misc'

const StrapiPage = ({ pageData }) => {
  console.log(pageData)
  return (
    <div className={styles.forum}>
      <Head>
        <title>{pageData.attributes.title}</title>
      </Head>
      <div className="container">
        <h1 className="h-l">{pageData.attributes.title}</h1>
        <p className="date">
          {moment(pageData.attributes.publishedAt).format('MMMM DD, YYYY')}
        </p>
        <div
          className="content"
          dangerouslySetInnerHTML={{ __html: pageData.attributes.content }}
        />
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  const { slug } = context.params
  const text = slug.split('-')

  try {
    const strapiUrl = getStrapiUrl()
    const response = await axios.get(
      `${strapiUrl}/api/pages?filters[slug][$eq]=${slug}`
    )
    if (response.data.data.length === 0) {
      return { notFound: true }
    }
    const pageData = response.data.data[0]

    return {
      props: { pageData, i18n: await loadCatalog(context.locale) },
    }
  } catch (error) {
    console.error(error, 'error')
    return {
      props: { notFound: true },
    }
  }
}

const getDomainName = (host) => {
  return host.split(':')[0]
}

export default StrapiPage
