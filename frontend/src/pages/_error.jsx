import * as Sentry from '@sentry/nextjs'
import { Button, Result } from 'antd'
import Error from 'next/error'
import { t } from '@lingui/macro'
import { useRouter } from 'next/router'
import { loadCatalog } from '../translations/utils'

const CustomErrorComponent = (props) => {
  const router = useRouter()

  return (
    <div style={{ background: 'white' }}>
      <Result
        status="404"
        title="404"
        subTitle={t`Sorry, the page you visited does not exist.`}
        extra={
          <Button type="primary" onClick={() => router.push('/')}>
            {t`Back Home`}
          </Button>
        }
      />
    </div>
  )
}

CustomErrorComponent.getInitialProps = async (contextData) => {
  await Sentry.captureUnderscoreErrorException(contextData)

  const errorInitialProps = await Error.getInitialProps(contextData)

  const i18n = await loadCatalog(contextData.locale)

  return { ...errorInitialProps, i18n }
}

export default CustomErrorComponent
