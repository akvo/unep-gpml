import { Form, Input } from 'antd'
import Button from '../../components/button'
import api from '../../utils/api'
import { useEffect, useState } from 'react'
import ResourceCard from '../../components/resource-card/resource-card'
import bodyScrollLock from '../../modules/details-page/scroll-utils'
import styles from './index.module.scss'
import DetailModal from '../../modules/details-page/modal'
import { useRouter } from 'next/router'
import StakeholderCard from '../../components/stakeholder-card/stakeholder-card'

const emptyObj = { resources: [], stakeholders: [], datasets: [] }

const Search = ({ setLoginVisible, isAuthenticated }) => {
  const [val, setVal] = useState('')
  const [items, setItems] = useState({ ...emptyObj })
  const router = useRouter()
  const [params, setParams] = useState(null)
  const onSearch = () => {
    api.get(`search?q=${val.replace(/ /g, '+')}`).then((d) => {
      console.log(d.data.results)
      const obj = { ...emptyObj }
      obj.resources = d.data.results.filter(
        (it) => it.type !== 'stakeholder' && it.type !== 'organisation'
      )
      obj.stakeholders = d.data.results.filter(
        (it) => it.type === 'stakeholder' || it.type === 'organisation'
      )
      setItems(obj)
    })
  }
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
  const showModal = ({ e, item }) => {
    const { type, id } = item
    e?.preventDefault()
    if (type && id) {
      const detailUrl = `/${type.replace(/_/g, '-')}/${id}`
      setParams({ type, id, item })
      window.history.pushState({}, '', detailUrl)
      setModalVisible(true)
      bodyScrollLock.enable()
    }
  }
  return (
    <div className={styles.search}>
      <div className="container">
        <div className="search-bar">
          <Form onFinish={onSearch}>
            <Input
              placeholder="Search all platform content..."
              value={val}
              onChange={(e) => {
                setVal(e.target.value)
              }}
            />
            <Button type="primary" size="small" onClick={onSearch}>
              Search
            </Button>
          </Form>
        </div>
        <div className="content">
          {items.resources.length > 0 && (
            <>
              <h4 className="caps-heading-1">knowledge hub</h4>
              <div className="results">
                {items.resources.map((it) => (
                  <ResourceCard item={it} key={it.id} onClick={showModal} />
                ))}
              </div>
            </>
          )}
          {items.stakeholders.length > 0 && (
            <>
              <h4 className="caps-heading-1">community</h4>
              <div className="results">
                {items.stakeholders.map((it) => (
                  <StakeholderCard item={it} key={`${it.type}-${it.id}`} />
                ))}
              </div>
            </>
          )}
        </div>
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
    </div>
  )
}

export default Search
