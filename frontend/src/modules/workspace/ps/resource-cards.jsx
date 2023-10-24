import { useState, useEffect } from 'react'
import ResourceCard from '../../../components/resource-card/resource-card'
import DetailModal from '../../details-page/modal'
import { useRouter } from 'next/router'
import styles from './resource-cards.module.scss'
import bodyScrollLock from '../../details-page/scroll-utils'
import { LoadingOutlined } from '@ant-design/icons'
import { Spin } from 'antd'
import api from '../../../utils/api'
import { isoA2 } from './config'
import { cloneDeep } from 'lodash'

const ResourceCards = ({
  items,
  setLoginVisible,
  isAuthenticated,
  loading,
  sectionKey,
}) => {
  const [stateItems, setStateItems] = useState([])
  const router = useRouter()
  const [params, setParams] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  useEffect(() => {
    setStateItems(items)
  }, [items])
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
  const showModal = ({ e, item }) => {
    const { type, id } = item
    e?.preventDefault()
    if (type && id) {
      const detailUrl = `/${type}/${id}`
      setParams({ type, id, item })
      window.history.pushState({}, '', detailUrl)
      setModalVisible(true)
      bodyScrollLock.enable()
    }
  }
  const handleBookmark = (item, bookmark = true) => {
    const country = router.query.slug?.replace('plastic-strategy-', '')
    const countryCode = isoA2[country]
    let entityType = item.type
    const subtypes = ['action_plan', 'technical_resource', 'financing_resource']
    if (subtypes.indexOf(entityType) !== -1) entityType = 'resource'
    api.post(`/plastic-strategy/${countryCode}/bookmark`, {
      bookmark,
      entityId: item.id,
      entityType,
      sectionKey,
    })
    if (bookmark) {
      setStateItems((_stateItems) => {
        const __stateItems = cloneDeep(_stateItems)
        const _stateItem = __stateItems.find((it) => it.id === item.id)
        if (
          _stateItem.plasticStrategyBookmarks.findIndex(
            (it) => it.sectionKey === sectionKey
          ) === -1
        ) {
          _stateItem.plasticStrategyBookmarks.push({ sectionKey })
        }
        return __stateItems
      })
    } else {
      setStateItems((_stateItems) => {
        const __stateItems = cloneDeep(_stateItems)
        const _stateItem = __stateItems.find((it) => it.id === item.id)
        const _bookmarkIndex = _stateItem.plasticStrategyBookmarks.findIndex(
          (it) => it.sectionKey === sectionKey
        )
        if (_bookmarkIndex !== -1) {
          _stateItem.plasticStrategyBookmarks.splice(_bookmarkIndex, 1)
        }
        return __stateItems
      })
    }
  }
  useEffect(() => {
    if (params != null) {
      const _stateItem = stateItems.find((it) => it.id === params.item.id)
      setParams({ type: _stateItem.type, id: _stateItem.id, item: _stateItem })
    }
  }, [stateItems])
  return (
    <>
      <div className={styles.cardsList} style={{ display: 'flex' }}>
        {loading && (
          <Spin
            indicator={
              <LoadingOutlined
                style={{
                  fontSize: 34,
                }}
                spin
              />
            }
          />
        )}
        {!loading && stateItems.length === 0 && (
          <h5>No relevant resources found</h5>
        )}
        {stateItems.map((item) => (
          <ResourceCard
            item={item}
            bookmarked={
              item?.plasticStrategyBookmarks?.findIndex(
                (it) => it.sectionKey === sectionKey
              ) !== -1
            }
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
        onBookmark2PS={handleBookmark}
        bookmark2PS={
          params?.item?.plasticStrategyBookmarks?.findIndex(
            (it) => it.sectionKey === sectionKey
          ) !== -1
        }
        {...{
          setLoginVisible,
          isAuthenticated,
        }}
      />
    </>
  )
}

export default ResourceCards
