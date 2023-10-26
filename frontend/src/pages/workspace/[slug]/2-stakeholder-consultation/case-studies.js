import { useEffect, useState } from 'react'
import { PageLayout } from '..'
import api from '../../../../utils/api'
import ResourceCards from '../../../../modules/workspace/ps/resource-cards'
import { useRouter } from 'next/router'
import { isoA2 } from '../../../../modules/workspace/ps/config'
import { Trans, t } from '@lingui/macro'

const sectionKey = 'stakeholder-case-studies'

const View = ({ setLoginVisible, isAuthenticated }) => {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const country = router.query.slug?.replace('plastic-strategy-', '')
  const countryCode = isoA2[country]
  useEffect(() => {
    if (countryCode)
      api
        .get(
          `/browse?tag=stakeholder+consultation+process&ps_country_iso_code_a2=${countryCode}`
        )
        .then((d) => {
          setItems(d.data?.results)
          setLoading(false)
          console.log(d.data)
        })
  }, [countryCode])

  return (
    <>
      <h4 className="caps-heading-m">
        <Trans>Stakeholder Consultation Process</Trans>
      </h4>
      <h2 className="h-xxl w-bold">
        <Trans>Case Studies</Trans>
      </h2>
      <p>
        <Trans>Description - Section 2 - Case Studies</Trans>
      </p>

      <ResourceCards
        {...{
          items,
          setLoginVisible,
          isAuthenticated,
          loading,
          sectionKey,
        }}
      />
    </>
  )
}

View.getLayout = PageLayout

export default View
