import axios from 'axios'
import styles from './style.module.scss'
import moment from 'moment'
import Head from 'next/head'
import { getStrapiUrl, transformStrapiResponse } from '../../utils/misc'
import Image from 'next/image'
import { loadCatalog } from '../../translations/utils'

const StrapiPage = ({ pageData }) => {
  return (
    <div className={styles.page}>
      <Head>
        <title>{pageData.title}</title>
      </Head>
      <div className="container" id="main-content">
        <div className="cover">
          <Image
            src={pageData.cover.data.attributes.url}
            fill
            objectFit="contain"
          />
        </div>
        <p className="date caps-heading-m">
          {moment(pageData.updatedAt).format('MMMM DD, YYYY')}
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
    const strapiUrl = getStrapiUrl()

    const response = await axios.get(
      `${strapiUrl}/api/posts?filters[slug][$eq]=${result}&populate=*&locale=${context.locale}`
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

export default StrapiPage
