import React from 'react'
import EntityDetail from '../../modules/entity-detail/view'
import { loadCatalog } from '../../translations/utils'
import withAuth from '../../components/withAuth'
import DetailView from '../../modules/community-hub/detail-view'
import { useRouter } from 'next/router'
import styles from '../../modules/community-hub/style.module.scss'
import classNames from 'classnames'

function Organisation({ isAuthenticated, profile }) {
  const router = useRouter()
  return (
    <div className={styles.detailViewContainer}>
      <div className="container">
        <DetailView
          item={{ id: router.query.id, type: 'organisation' }}
          {...{ profile }}
        />
      </div>
    </div>
  )
}

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default withAuth(Organisation)
