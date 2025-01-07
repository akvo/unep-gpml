import Image from 'next/image'
import { useEffect, useState } from 'react'
import api from '../../utils/api'
import styles from './style.module.scss'
import { Swiper, SwiperSlide } from 'swiper/react'
import ResourceCard from '../../components/resource-card/resource-card'
import StakeholderCard, {
  badgeTitles,
} from '../../components/stakeholder-card/stakeholder-card'
import {
  badges,
  Email,
  Globe,
  LinkedinOutlined,
  LinkIcon,
  LocationPin,
} from '../../components/icons'
import { UIStore } from '../../store'
import {
  Button,
  Modal,
  notification,
  Popover,
  Row,
  Skeleton,
  Tooltip,
} from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import Link from 'next/link'
import classNames from 'classnames'
import DetailModal from '../details-page/modal'
import { useRouter } from 'next/router'
import bodyScrollLock from '../../modules/details-page/scroll-utils'

export const AdminBadges = ({ data, badgeOpts }) => {
  const [assigned, setAssigned] = useState(
    data?.assignedBadges?.map((it) => it.badgeName)
  )
  // const badgeOpts =
  const handleClick = (badge, assign) => () => {
    api.post(`/badge/${badge}/assign`, {
      assign,
      entityId: data.id,
      entityType: data.type,
    })
    setAssigned((_assigned) => {
      if (assign) {
        return [..._assigned, badge]
      } else {
        return _assigned.filter((it) => it !== badge)
      }
    })
  }
  return (
    <span className="admin badges">
      {badgeOpts.map((badge) => {
        const enabled = assigned?.indexOf(badge) !== -1
        return (
          <Tooltip
            title={`${enabled ? 'Remove' : 'Assign'} ${badgeTitles[badge]}`}
          >
            <span
              onClick={handleClick(badge, !enabled)}
              className={classNames('badge', badge, {
                enabled,
              })}
            >
              {badges.verified}
            </span>
          </Tooltip>
        )
      })}
    </span>
  )
}

const DetailView = ({ item, profile, setLoginVisible, isAuthenticated }) => {
  console.log('item', item)
  const router = useRouter()
  const [data, setData] = useState({ ...item })
  const [loading, setLoading] = useState(true)
  const [resources, setResources] = useState(null)
  const [members, setMembers] = useState(null)
  const { countries } = UIStore.useState((s) => ({
    countries: s.countries,
  }))
  const [modalVisible, setModalVisible] = useState(false)
  const [params, setParams] = useState(null)
  useEffect(() => {
    if (data.type)
      api.get(`/detail/${data.type}/${data.id}`).then((d) => {
        setData((_data) => {
          return { ..._data, ...d.data }
        })
        setLoading(false)
        if (data.type === 'organisation') {
          api
            .get(`/organisation/${data.id}/content?limit=20&page=0`)
            .then((d) => {
              setResources(d.data.results)
            })
          api
            .get(`/organisation/${data.id}/members?limit=20&page=0`)
            .then((d) => {
              setMembers(d.data.members)
            })
        }
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

  const assignedBadges = (
    <span className="badges">
      {data?.assignedBadges?.map((it) => (
        <Tooltip title={badgeTitles[it.badgeName]}>
          <span className={`badge ${it.badgeName}`}>{badges.verified}</span>
        </Tooltip>
      ))}
    </span>
  )

  const showModal = ({ e, item }) => {
    const { type, id } = item
    e?.preventDefault()
    if (type && id) {
      const detailUrl = `/${type.replace(/_/g, '-')}/${id}`
      setParams({ type: type.replace(/_/g, '-'), id, item })
      window.history.pushState({}, '', detailUrl)
      setModalVisible(true)
      bodyScrollLock.enable()
    }
  }

  if (data.type === 'stakeholder') {
    return (
      <div className={`${styles.detailView} ${styles.stakeholderDetailView}`}>
        <div className="header">
          <h4 className="h-caps-m">member individual</h4>
          <h1>
            {data.name}
            {profile?.role === 'ADMIN' ? (
              <AdminBadges
                {...{ data }}
                badgeOpts={['user-verified', 'user-focal-point-verified']}
              />
            ) : (
              assignedBadges
            )}
          </h1>
          <h5>
            {data.jobTitle}{' '}
            {data.affiliation && (
              <>
                @{' '}
                <span>
                  <Link href={`/organisation/${data.affiliation.id}`}>
                    {data.affiliation.name}
                  </Link>
                </span>
              </>
            )}
          </h5>
        </div>
        <div className="content">
          {loading && (
            <Row
              style={{ margin: '20px 40px' }}
              gutter={{
                lg: 24,
              }}
            >
              <Skeleton
                paragraph={{
                  rows: 7,
                }}
                active
              />
            </Row>
          )}
          {data.picture && (
            <div className="img">
              <Image src={data.picture} fill alt="picture" />
            </div>
          )}
          {!loading && (
            <>
              <div className="meta">
                {data.country && (
                  <div className="item location">
                    <LocationPin />
                    <span>
                      {data.country &&
                        countries.find((it) => it.id === data.country)?.name}
                    </span>
                  </div>
                )}
                {data.email && (
                  <div className="item email">
                    <Email />
                    <span>{data.email}</span>
                  </div>
                )}
                {data.linkedin && (
                  <div className="item link linkedin">
                    <LinkedinOutlined />
                    <span>{data.linkedin}</span>
                  </div>
                )}
                {profile?.role === 'ADMIN' && <AdminDropdown {...{ data }} />}
                {/* {profile.role === 'ADMIN' && (
                  <Link href={`/edit/entity/${data.id}?formType=stakeholder`}>
                    <Button size="small" type="link">
                      Edit
                    </Button>
                  </Link>
                )} */}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }
  const imageSrc = data.picture || data.logo
  return (
    <div className={styles.detailView}>
      <div className="org">
        <div className="header">
          <h4 className="h-caps-m">member organisation</h4>
          <h1>
            {data.name}
            {profile?.role === 'ADMIN' ? (
              <AdminBadges
                {...{ data }}
                badgeOpts={['org-verified', 'org-partner-verified']}
              />
            ) : (
              assignedBadges
            )}
          </h1>
          <div className="meta">
            {data.country && (
              <div className="item location">
                <LocationPin />
                <span>
                  {countries.find((it) => it.id === data.country)?.name}
                </span>
              </div>
            )}
            {data.geoCoverageType && (
              <div className="item geo">
                <Globe />
                <span>{data.geoCoverageType}</span>
              </div>
            )}
            {data.url && (
              <a href={data.url} target="_blank">
                <div className="item link">
                  <LinkIcon />
                  <span>{data.url}</span>
                </div>
              </a>
            )}
            {/* <div className="item link linkedin">
              <LinkedinOutlined />
              <span>http...</span>
            </div> */}
            {profile?.role === 'ADMIN' && <AdminDropdown {...{ data }} />}
          </div>
        </div>
        <div className="content">
          {loading && (
            <Row
              style={{ margin: '20px 40px' }}
              gutter={{
                lg: 24,
              }}
            >
              <Skeleton
                paragraph={{
                  rows: 7,
                }}
                active
              />
            </Row>
          )}
          {!loading && (
            <p>
              {imageSrc && (
                <div className="img">
                  <Image src={imageSrc} fill />
                </div>
              )}
              {data.program}
            </p>
          )}
          <div className="clearfix"></div>
          {resources != null && resources.length > 0 && (
            <>
              <h4 className="h-caps-m">Associated content</h4>
              <Swiper
                spaceBetween={15}
                slidesPerGroup={4}
                slidesPerView={'auto'}
                className="resource-cards"
              >
                {resources.map((item) => (
                  <SwiperSlide>
                    <ResourceCard item={item} onClick={showModal} />
                  </SwiperSlide>
                ))}
                {resources.length === 20 && (
                  <SwiperSlide>
                    <Link
                      href={`/search?q=resources+by+${data.name.replace(
                        / /g,
                        '+'
                      )}`}
                    >
                      <div className="more-card">View All</div>
                    </Link>
                  </SwiperSlide>
                )}
              </Swiper>
            </>
          )}
          {members != null && members.length > 0 && (
            <>
              <h4 className="h-caps-m">Individual members</h4>
              <Swiper
                spaceBetween={15}
                slidesPerGroup={4}
                slidesPerView={'auto'}
                className="members-slider"
              >
                {members.map((member) => (
                  <SwiperSlide>
                    <StakeholderCard
                      item={{ type: 'stakeholder', ...member }}
                      key={`${member.type}-${member.id}`}
                      className="resource-card"
                    />
                  </SwiperSlide>
                ))}
                {members.length === 20 && (
                  <SwiperSlide>
                    <Link
                      href={`/search?q=members+of+${data.name.replace(
                        / /g,
                        '+'
                      )}`}
                    >
                      <div className="more-card individual">View All</div>
                    </Link>
                  </SwiperSlide>
                )}
              </Swiper>
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

const AdminDropdown = ({ data }) => {
  return (
    <Popover
      placement="bottomLeft"
      // overlayClassName={styles.forumOptions}
      content={
        <ul>
          <li>
            <Link href={`/edit/entity/${data.id}?formType=${data.type}`}>
              <Button size="small" type="link">
                Edit
              </Button>
            </Link>
          </li>
          <li>
            <Button
              size="small"
              type="link"
              onClick={() => {
                Modal.error({
                  className: 'popup-delete',
                  centered: true,
                  closable: true,
                  title: `Are you sure you want to delete this ${data.type}?`,
                  content: `Please be aware this action cannot be undone.`,
                  okText: `Delete`,
                  okType: 'danger',
                  onOk() {
                    return api
                      .delete(`/detail/${data.type}/${data.id}`)
                      .then((res) => {
                        notification.success({
                          message: 'Entity deleted successfully',
                        })
                      })
                      .catch((err) => {
                        console.error(err)
                        notification.error({
                          message: 'Oops, something went wrong',
                        })
                      })
                  },
                })
              }}
            >
              Delete
            </Button>
          </li>
        </ul>
      }
      trigger="click"
    >
      <div className="admin-btn">
        <MoreOutlined />
      </div>
    </Popover>
  )
}

export default DetailView
