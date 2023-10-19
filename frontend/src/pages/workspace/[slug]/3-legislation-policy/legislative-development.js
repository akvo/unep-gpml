import { useRouter } from 'next/router'
import { PageLayout } from '..'
import Button from '../../../../components/button'

const View = () => {
  return (
    <>
      <h4 className="caps-heading-m">Legislation & Policy Review Report</h4>
      <h2 className="h-xxl w-bold">Legislative Development Guide</h2>
      <p>
        Review the evolution of South Africa’s legislative framework. Access a
        wide range of resources ranging from source documents, analysis and
        reports.
      </p>
      <a
        href="https://leap.unep.org/knowledge/toolkits/legislative-guide"
        target="_blank"
      >
        <Button type="primary" withArrow>
          Open The Guide
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
