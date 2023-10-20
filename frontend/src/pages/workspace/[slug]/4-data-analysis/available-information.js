import { useEffect, useState } from 'react'
import { PageLayout } from '..'
import api from '../../../../utils/api'
import ResourceCards from '../../../../modules/workspace/ps/resource-cards'
import { useRouter } from 'next/router'
import { iso2id, isoA2 } from '../../../../modules/workspace/ps/config'

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
          `/browse?country=${iso2id[countryCode]}&ps_country_iso_code_a2=${countryCode}`
        )
        .then((d) => {
          setItems(d.data?.results)
          setLoading(false)
          console.log(d.data)
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
      <h4 className="caps-heading-m">Data Analysis</h4>
      <h2 className="h-xxl w-bold">Available Tools</h2>
      <p>Placeholder for description here</p>

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
