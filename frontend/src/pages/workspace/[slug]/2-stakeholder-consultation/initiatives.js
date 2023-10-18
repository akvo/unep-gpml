import { useEffect, useState } from 'react'
import { PageLayout } from '..'
import api from '../../../../utils/api'
import ResourceCard from '../../../../components/resource-card/resource-card'
import styles from '../ps.module.scss'
import ResourceCards from '../../../../modules/workspace/ps/resource-cards'

const View = ({ setLoginVisible, isAuthenticated }) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get('/browse?country=710&topic=initiative').then((d) => {
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
      <h2 className="h-xxl w-bold">Initiatives</h2>
      <p>
        Find country initiatives across a wide variety of subjects and sectors
        currently ongoing. Filter either directly on the map or using the
        sidebar navigation to easily find relevant initatives.{' '}
      </p>

      <ResourceCards
        {...{ items, handleBookmark, setLoginVisible, isAuthenticated }}
      />
    </>
  )
}

View.getLayout = PageLayout

export default View
