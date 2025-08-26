import { useEffect, useState } from 'react'
import { PageLayout } from '..'
import api from '../../../../utils/api'
import ResourceCards from '../../../../modules/workspace/ps/resource-cards'
import { useRouter } from 'next/router'
import { isoA2 } from '../../../../modules/workspace/ps/config'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'
import { useStepInstructions } from '../../../../hooks/useStepInstructions'
import { MarkdownRenderer } from '../../../../components/markdown-renderer/MarkdownRenderer'

const sectionKey = 'stakeholder-case-studies'

const View = () => {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { data } = useStepInstructions('plastic-waste-management')

  return (
    <>
      <h4 className="caps-heading-m">
        <Trans>Plastic Waste Management</Trans>
      </h4>
      <MarkdownRenderer content={data?.content} allowSlides={true} />
    </>
  )
}

View.getLayout = PageLayout

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

export default View
