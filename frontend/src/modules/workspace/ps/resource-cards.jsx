import { useState, useEffect } from 'react'
import ResourceCard from '../../../components/resource-card/resource-card'
import DetailModal from '../../details-page/modal'
import { useRouter } from 'next/router'
import styles from './resource-cards.module.scss'
import bodyScrollLock from '../../details-page/scroll-utils'

const ResourceCards = ({
  items,
  setLoginVisible,
  isAuthenticated,
  handleBookmark,
}) => {
  const router = useRouter()
  const [params, setParams] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
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

export default ResourceCards
