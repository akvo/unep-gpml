import { useEffect, useState } from 'react'
import { PageLayout } from '..'
import api from '../../../../utils/api'
import ResourceCards from '../../../../modules/workspace/ps/resource-cards'
import { iso2id, isoA2 } from '../../../../modules/workspace/ps/config'
import { useRouter } from 'next/router'
import { Trans, t } from '@lingui/macro'

const sectionKey = 'stakeholder-initiatives'

const View = ({ setLoginVisible, isAuthenticated }) => {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const country = router.query.slug?.replace('plastic-strategy-', '')
    const countryCode = isoA2[country]
    const countryId = iso2id[countryCode]
    if (countryId != null) {
      api
        .get(
          `/browse?country=${countryId}&topic=initiative&badges=true&ps_country_iso_code_a2=${countryCode}`
        )
        .then((d) => {
          setItems(d.data?.results)
          setLoading(false)
          console.log(d.data)
        })
    }
  }, [router])
  return (
    <>
      <h4 className="caps-heading-m">
        <Trans>Stakeholder Consultation Process</Trans>
      </h4>
      <h2 className="h-xxl w-bold">
        <Trans>Initiatives</Trans>
      </h2>
      <p>
        <Trans>Description - Section 2 - Initatives</Trans>
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
