import { Form, Input, Spin } from 'antd'
import Button from '../../components/button'
import api from '../../utils/api'
import { useEffect, useRef, useState } from 'react'
import ResourceCard, {
  ResourceCardSkeleton,
} from '../../components/resource-card/resource-card'
import bodyScrollLock from '../../modules/details-page/scroll-utils'
import styles from './index.module.scss'
import DetailModal from '../../modules/details-page/modal'
import { useRouter } from 'next/router'
import StakeholderCard from '../../components/stakeholder-card/stakeholder-card'
import { LoadingOutlined } from '@ant-design/icons'
import { Pointer, ThoughtBubble } from '../../components/icons'
import { loadCatalog } from '../../translations/utils'

const emptyObj = { resources: [], stakeholders: [], datasets: [] }

const Search = ({ setLoginVisible, isAuthenticated }) => {
  const [loading, setLoading] = useState(false)
  const [val, setVal] = useState('')
  const [items, setItems] = useState({ ...emptyObj })
  const router = useRouter()
  const [params, setParams] = useState(null)
  const holderRef = useRef()
  const moreBtnRef = useRef()
  const onSearch = () => {
    setLoading(true)
    setItems({ ...emptyObj })
    api.get(`search?q=${val.replace(/ /g, '+')}`).then((d) => {
      const obj = { ...emptyObj }
      obj.resources = d.data.results.filter(
        (it) =>
          it.type !== 'stakeholder' &&
          it.type !== 'organisation' &&
          it.type !== 'dataset'
      )
      obj.stakeholders = d.data.results.filter(
        (it) => it.type === 'stakeholder' || it.type === 'organisation'
      )
      obj.datasets = d.data.results.filter((it) => it.type === 'dataset')
      setItems(obj)
      setLoading(false)
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
  const handleMoreClick = () => {
    holderRef.current.scrollTo({
      left: holderRef.current.clientWidth - 200,
      behavior: 'smooth',
    })
  }
  const handleScroll = () => {
    if (holderRef.current.scrollLeft === holderRef.current.scrollLeftMax) {
      moreBtnRef.current.style.display = 'none'
    } else {
      moreBtnRef.current.style.display = ''
    }
  }
  const suggestions = [
    'Data on plastic waste in Africa',
    'Potential partners for recycling in Cambodia',
    'Is there any legislation currently in force regarding waste management in Guatemala',
    'Data on protected marine areas',
    'Funds on plastic pollution in Asia',
    'What initiatives is UNEP a partner of',
    'What technical resources are funded by UNEP',
    'Datasets on beach litter',
  ]
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
            {!loading && (
              <Button type="primary" size="small" onClick={onSearch}>
                Search
              </Button>
            )}
            {loading && (
              <div className="loading">
                <Spin
                  indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />}
                />
              </div>
            )}
          </Form>
          <div className="suggestions">
            <div className="caption">
              <div className="icon">
                <ThoughtBubble />
              </div>
              <span>suggestions</span>
            </div>
            <div className="holder" ref={holderRef} onScroll={handleScroll}>
              <ul>
                {suggestions.map((it) => (
                  <li
                    key={it}
                    onClick={() => {
                      setVal(it)
                    }}
                  >
                    {it}
                  </li>
                ))}
              </ul>
              <div
                className="more-btn"
                onClick={handleMoreClick}
                ref={moreBtnRef}
              >
                <Pointer />
              </div>
            </div>
          </div>
        </div>
        <div className="content">
          {loading && (
            <>
              <div className="results">
                <ResourceCardSkeleton />
                <ResourceCardSkeleton />
                <ResourceCardSkeleton />
              </div>
            </>
          )}
          {items.resources.length > 0 && (
            <>
              <h4 className="caps-heading-1">knowledge hub</h4>
              <div className="results">
                {items.resources.map((it) => (
                  <ResourceCard
                    item={it}
                    key={`${it.type}-${it.id}`}
                    onClick={showModal}
                  />
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
          {items.datasets.length > 0 && (
            <>
              <h4 className="caps-heading-1">data hub</h4>
              <div className="results">
                {items.datasets.map((it) => (
                  <ResourceCard item={it} key={`${it.type}-${it.id}`} />
                ))}
              </div>
            </>
          )}

          {items.resources.length === 0 &&
            items.stakeholders.length === 0 &&
            items.datasets.length === 0 &&
            !loading && (
              <>
                <div className="no-results">
                  <h4 className="caps-heading-s">
                    We couldn't find any matches.
                  </h4>
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

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default Search
