import { Form, Input, Modal, Spin } from 'antd'
import Button from '../../components/button'
import api from '../../utils/api'
import { useEffect, useRef, useState } from 'react'
import ResourceCard, {
  ResourceCardSkeleton,
} from '../../components/resource-card/resource-card'
import bodyScrollLock from '../../modules/details-page/scroll-utils'
import styles from './index.module.scss'
import DetailModal from '../../modules/details-page/modal'
import MemberDetailModal from '../../modules/community-hub/modal'
import { useRouter } from 'next/router'
import StakeholderCard from '../../components/stakeholder-card/stakeholder-card'
import { LoadingOutlined } from '@ant-design/icons'
import { Pointer, ThoughtBubble } from '../../components/icons'
import { loadCatalog } from '../../translations/utils'
import classNames from 'classnames'
// import { Trans } from '@lingui/react'
import { t, Trans } from '@lingui/macro'

const emptyObj = { resources: [], stakeholders: [], datasets: [] }

const Search = ({ setLoginVisible, isAuthenticated }) => {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState({ ...emptyObj })
  const [memberModalVisible, setMemberModalVisible] = useState(false)
  const [openMemberItem, setOpenMemberItem] = useState(null)
  const router = useRouter()
  const [params, setParams] = useState(null)
  const handleSearch = (val) => {
    setLoading(true)
    setItems({ ...emptyObj })
    api
      .get(`search?q=${val.replace(/ /g, '+')}`)
      .then((d) => {
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
      .catch(() => {
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
  const handleClickMember = (result) => (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isAuthenticated) {
      setMemberModalVisible(true)
      setOpenMemberItem(result)
    } else {
      setLoginVisible(true)
    }
  }
  return (
    <div className={styles.search}>
      <div className="container">
        <SearchBar onSearch={handleSearch} {...{ loading }} />
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
              <h4 className="caps-heading-1">
                <Trans>knowledge hub</Trans>
              </h4>
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
              <h4 className="caps-heading-1">
                <Trans>community</Trans>
              </h4>
              <div className="results">
                {items.stakeholders.map((it) => (
                  <div onClick={handleClickMember(it)}>
                    <StakeholderCard item={it} key={`${it.type}-${it.id}`} />
                  </div>
                ))}
              </div>
            </>
          )}
          {items.datasets.length > 0 && (
            <>
              <h4 className="caps-heading-1">
                <Trans>data hub</Trans>
              </h4>
              <div className="results">
                {items.datasets.map((it) => (
                  <ResourceCard
                    item={it}
                    key={`${it.type}-${it.id}`}
                    onClick={({ e, item }) => {
                      router.push(
                        `/data/maps?categoryId=${item.categoryId}&subcategoryId=${item.subcategoryId}&layer=${item.arcgislayerId}`
                      )
                    }}
                  />
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

      <MemberDetailModal
        visible={memberModalVisible}
        setVisible={setMemberModalVisible}
        isServer={false}
        openItem={openMemberItem}
        {...{
          setLoginVisible,
          isAuthenticated,
        }}
      />
    </div>
  )
}

export const SearchBar = ({ onSearch, loading }) => {
  const router = useRouter()
  const [val, setVal] = useState('')
  const holderRef = useRef()
  const moreBtnRef = useRef()
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
    t`Potential partners for recycling in Cambodia`,
    t`Data on beach litter`,
    t`Funds on plastic pollution in Asia`,
    t`Is there any legislation currently in force regarding waste management in Guatemala`,
    t`Data on protected marine areas`,
    t`What initiatives is UNEP a partner of`,
    t`What technical resources are funded by UNEP`,
  ]
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (router.query.q) {
      setVal(router.query.q)
      onSearch(router.query.q)
    }
  }, [router.query])
  return (
    <div className={classNames(styles.searchBar, 'search-bar')}>
      <Form
        onFinish={() => {
          router.push(`/search?q=${val.replace(/ /g, '+')}`)
        }}
        role="search"
      >
        <Form.Item name="search" style={{ marginBottom: 0, width: '100%' }}>
          <label htmlFor="global-search" className="sr-only">
            {t`Search all platform content`}
          </label>
          <Input
            id="global-search"
            type="search"
            placeholder={t`Search all platform content...`}
            aria-label={t`Search all platform content`}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="search-input"
          />
        </Form.Item>
        {!loading && (
          <Button type="primary" size="small" htmlType="submit">
            <span className="hide-desktop">
              <Pointer aria-hidden="true" />
            </span>
            <span className="hide-mobile">
              <Trans>Search</Trans>
            </span>
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
          <span>
            <Trans>suggestions</Trans>
          </span>
        </div>
        <div className="powered" onClick={() => setShowModal(true)}>
          <Trans>Powered by OpenAI</Trans>
        </div>
        <Modal
          visible={showModal}
          onCancel={() => setShowModal(false)}
          footer={null}
          closable
        >
          <Trans>
            Our platform-wide search is powered by OpenAI in order to translate
            human-language questions into queries to our database. This feature
            is experimental and does not support broad conversation-like
            interaction similar to ChatGPT. You may ask questions following a
            pattern similar to the suggestions provided.
          </Trans>
        </Modal>
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
          <div className="more-btn" onClick={handleMoreClick} ref={moreBtnRef}>
            <Pointer />
          </div>
        </div>
      </div>
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
