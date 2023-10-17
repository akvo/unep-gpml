import { useEffect, useState } from 'react'
import { PageLayout } from '..'
import api from '../../../../utils/api'
import ResourceCard from '../../../../components/resource-card/resource-card'
import styles from '../ps.module.scss'

const View = () => {
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
