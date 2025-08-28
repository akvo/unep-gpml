import { useRouter } from 'next/router'
import { PageLayout } from '..'
import Button from '../../../../components/button'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'

const View = () => {
  return (
    <>
      <h4 className="caps-heading-m">
        <Trans>Legislation & Policy Review Report</Trans>
      </h4>
      <h2 className="h-xxl w-bold">
        <Trans>Legislative Development Guide</Trans>
      </h2>
      <p>
        <Trans>Description - Section 3 - Legislative Development Guide</Trans>
        {/* Review the evolution of South Africa’s legislative framework. Access a
        wide range of resources ranging from source documents, analysis and
        reports. */}
      </p>
      <a
        href="https://leap.unep.org/en/knowledge/toolkits/plastic"
        target="_blank"
      >
        <Button type="primary" withArrow>
          <Trans>Open The Guide</Trans>
        </Button>
      </a>
      <ul style={{ marginTop: '20px' }}>
        <li>
          <a
            href="https://leap.unep.org/en/knowledge/legislative-guidance/tackling-plastic-pollution-legislative-guide-regulation-single-use"
            target="_blank"
          >
            <Button size="small" type="link">
              Tackling Plastic Pollution – Legislative Guide for the Regulation
              of Single-Use Plastic Products
            </Button>
          </a>
        </li>
        <li style={{ margin: '10px 0' }}>
          <a
            href="https://leap.unep.org/en/knowledge/legislative-guidance/marine-litter-legislation-toolkit-policymakers"
            target="_blank"
          >
            <Button size="small" type="link">
              Marine Litter Legislation: A Toolkit for Policymakers
            </Button>
          </a>
        </li>
        <li style={{ margin: '10px 0' }}>
          <a
            href="https://leap.unep.org/en/knowledge/reports/legal-limits-single-use-plastics-and-microplastics-global-review"
            target="_blank"
          >
            <Button size="small" type="link">
              Legal Limits on Single-Use Plastics and Microplastics: A Global
              Review of National Laws and Regulations
            </Button>
          </a>
        </li>
      </ul>
      {/* <iframe
        src="https://leap.unep.org/knowledge/toolkits/legislative-guide"
        frameborder="0"
        width="900"
        height="542"
        allowfullscreen="true"
        mozallowfullscreen="true"
        webkitallowfullscreen="true"
        style={{ marginTop: 30 }}
      ></iframe> */}
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
