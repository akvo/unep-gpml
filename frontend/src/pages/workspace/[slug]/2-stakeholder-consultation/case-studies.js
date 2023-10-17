import { useEffect, useState } from 'react'
import { PageLayout } from '..'
import api from '../../../../utils/api'
import ResourceCard from '../../../../components/resource-card/resource-card'
import styles from '../ps.module.scss'
import DetailModal from '../../../../modules/details-page/modal'
import { useRouter } from 'next/router'
import bodyScrollLock from '../../../../modules/details-page/scroll-utils'

const View = ({ setLoginVisible, isAuthenticated }) => {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [params, setParams] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  useEffect(() => {
    api.get('/browse?tag=stakeholder+consultation+process').then((d) => {
      setItems(d.data?.results)
      setLoading(false)
      console.log(d.data)
    })
  }, [])
  useEffect(() => {
    if (!modalVisible) {
      const previousHref = router.asPath
      window.history.pushState(
        { urlPath: `/${previousHref}` },
        '',
        `${previousHref}`
      )
    }
  }, [modalVisible])
  const handleBookmark = () => {
    console.log('TODO')
  }
  const showModal = ({ e, type, id }) => {
    console.log('setModalVisible')
    e.preventDefault()
    if (type && id) {
      e.preventDefault()
      const detailUrl = `/${type}/${id}`
      setParams({ type, id })
      window.history.pushState({}, '', detailUrl)
      setModalVisible(true)
      bodyScrollLock.enable()
    }
  }
  return (
    <>
      <h4 className="caps-heading-m">Stakeholder Consultation Process</h4>
      <h2 className="h-xxl w-bold">Case Studies</h2>
      <p>Placeholder for description here</p>

      <div className={styles.cardsList} style={{ display: 'flex' }}>
        {items.map((item) => (
          <ResourceCard
            item={item}
            onBookmark={handleBookmark}
            onClick={showModal}
          />
        ))}
      </div>
      <DetailModal
        match={{ params }}
        visible={modalVisible}
        setVisible={setModalVisible}
        isServer={false}
        {...{
          setLoginVisible,
          isAuthenticated,
        }}
      />
    </>
  )
}

View.getLayout = PageLayout

export default View
