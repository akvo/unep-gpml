import { useEffect, useState } from 'react'
import { PageLayout } from '..'
import api from '../../../../utils/api'
import ResourceCards from '../../../../modules/workspace/ps/resource-cards'

const View = ({ setLoginVisible, isAuthenticated }) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get('/browse?tag=stakeholder+consultation+process').then((d) => {
      setItems(d.data?.results)
      setLoading(false)
      console.log(d.data)
    })
  }, [])
  const handleBookmark = () => {
    console.log('TODO')
  }
  return (
    <>
      <h4 className="caps-heading-m">Stakeholder Consultation Process</h4>
      <h2 className="h-xxl w-bold">Case Studies</h2>
      <p>Placeholder for description here</p>

      <ResourceCards
        {...{
          items,
          handleBookmark,
          setLoginVisible,
          isAuthenticated,
          loading,
        }}
      />
    </>
  )
}

View.getLayout = PageLayout

export default View
