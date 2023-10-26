import { useRouter } from 'next/router'
import { PageLayout } from '..'
import Button from '../../../../components/button'
import { Trans, t } from '@lingui/macro'

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
        href="https://leap.unep.org/knowledge/toolkits/legislative-guide"
        target="_blank"
      >
        <Button type="primary" withArrow>
          <Trans>Open The Guide</Trans>
        </Button>
      </a>
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

export default View
