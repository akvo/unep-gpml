import React from 'react'
import ProjectPage from '../../modules/projects/view'

function Project({ profile }) {
  return <ProjectPage profile={profile} />
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

export default Project
