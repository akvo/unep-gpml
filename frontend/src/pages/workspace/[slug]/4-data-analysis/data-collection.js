import { useEffect, useState } from 'react'
import { PageLayout } from '..'
import api from '../../../../utils/api'
import ResourceCards from '../../../../modules/workspace/ps/resource-cards'
import { useRouter } from 'next/router'
import { isoA2 } from '../../../../modules/workspace/ps/config'
import { Trans, t } from '@lingui/macro'

const sectionKey = 'data-collection'

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
          `/browse?tag=data+analysis+-+data+collection&badges=true&ps_country_iso_code_a2=${countryCode}`
        )
        .then((d) => {
          setItems(d.data?.results)
          setLoading(false)
        })
  }, [countryCode])
  const handleBookmark = (item, bookmark = true) => {
    let entityType = item.type
    const subtypes = ['action_plan', 'technical_resource', 'financing_resource']
    if (subtypes.indexOf(entityType) !== -1) entityType = 'resource'
    api.post(`/plastic-strategy/${countryCode}/bookmark`, {
      bookmark,
      entityId: item.id,
      entityType,
      sectionKey,
    })
  }
  return (
    <>
      <h4 className="caps-heading-m">
        <Trans>Data Analysis</Trans>
      </h4>
      <h2 className="h-xxl w-bold">
        <Trans>Data Collection</Trans>
      </h2>
      <p>
        <Trans>Description - Section 4 - Data Collection</Trans>
      </p>

      <ResourceCards
        {...{
          items,
          handleBookmark,
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
