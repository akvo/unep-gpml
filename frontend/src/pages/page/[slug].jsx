import axios from 'axios'
import styles from './style.module.scss'
import moment from 'moment'

const StrapiPage = ({ pageData }) => {
  return (
    <div className={styles.forum}>
      <div className="container">
        <h1 className="h-l">{pageData.attributes.Title}</h1>
        <p className="date">
          {moment(pageData.attributes.publishedAt).format('MMMM DD, YYYY')}
        </p>
        <div
          className="content"
          dangerouslySetInnerHTML={{ __html: pageData.attributes.Content }}
        />
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  const { slug } = context.params
  const text = slug.split('-')
  text.shift()
  const result = text.join('-')

  try {
    const domainName = process.env.REACT_APP_FEENV
      ? 'unep-gpml.akvotest.org'
      : getDomainName(context.req.headers.host)
    const response = await axios.get(
      `https://${domainName}/strapi/api/pages?filters[Slug][$eq]=${result}`
    )

    const pageData = response.data.data[0]

    return {
      props: { pageData },
    }
  } catch (error) {
    console.error(error)
    return {
      notFound: true,
    }
  }
}

const getDomainName = (host) => {
  return host.split(':')[0]
}

export default StrapiPage
