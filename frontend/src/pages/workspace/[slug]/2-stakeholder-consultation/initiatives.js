import { useEffect, useState } from 'react'
import { PageLayout } from '..'
import api from '../../../../utils/api'
import ResourceCard from '../../../../components/resource-card/resource-card'
import styles from '../ps.module.scss'

const View = () => {
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

      <div className={styles.cardsList} style={{ display: 'flex' }}>
        {items.map((item) => (
          <ResourceCard item={item} onBookmark={handleBookmark} />
        ))}
      </div>
    </>
  )
}

View.getLayout = PageLayout

export default View
