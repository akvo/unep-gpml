/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState, useCallback } from 'react'
import styles from './styles.module.scss'
import { UIStore } from '../../store'
import {
  Row,
  Col,
  Typography,
  Avatar,
  List,
  Card,
  Modal,
  notification,
  Tooltip,
  Switch,
} from 'antd'
import StickyBox from 'react-sticky-box'
import ReadMoreReact from 'read-more-less-react'
import 'read-more-less-react/dist/index.css'
import LocationImage from '../../images/location.svg'
import TrashIcon from '../../images/resource-detail/trash-icn.svg'
import EditIcon from '../../images/resource-detail/edit-icn.svg'
import FollowIcon from '../../images/resource-detail/follow-icn.svg'
import {
  LinkedinOutlined,
  TwitterOutlined,
  MailOutlined,
  LoadingOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { useHistory } from 'react-router-dom'
import api from '../../utils/api'
import { getBadgeTitle, resourceTypeToTopicType } from '../../utils/misc'
import isEmpty from 'lodash/isEmpty'
import { eventTrack, randomColor } from '../../utils/misc'
import ResourceCards from '../../components/resource-cards/resource-cards'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Trans, t } from '@lingui/macro'

const usePrevious = (value) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const CardComponent = ({ title, style, children, getRef }) => {
  return (
    <div className="card-wrapper" style={style} ref={getRef}>
      <Card title={title} bordered={false} style={style}>
        {children}
      </Card>
    </div>
  )
}

const SharePanel = ({
  profile,
  isAuthenticated,
  data,
  id,
  relation,
  history,
  handleRelationChange,
}) => {
  const canEdit = () =>
    isAuthenticated &&
    profile.reviewStatus === 'APPROVED' &&
    (profile.role === 'ADMIN' ||
      profile.id === Number(id) ||
      data.owners.includes(id))

  const handleChangeRelation = (relationType) => {
    let association = relation ? [...relation.association] : []
    if (!association.includes(relationType)) {
      association = [...association, relationType]
    } else {
      association = association.filter((it) => it !== relationType)
    }
    handleRelationChange({
      topicId: parseInt(id),
      association,
      topic: resourceTypeToTopicType('stakeholder'),
    })
  }

  const canDelete = () =>
    isAuthenticated &&
    profile.reviewStatus === 'APPROVED' &&
    profile.role === 'ADMIN'

  const handleEditBtn = () => {
    eventTrack('Stakeholder view', 'Update', 'Button')
    UIStore.update((e) => {
      e.formEdit = {
        ...e.formEdit,
        signUp: {
          status: 'edit',
          id: id,
        },
      }
      e.formStep = {
        ...e.formStep,
        stakeholder: 1,
      }
    })
    history.push(
      {
        pathname: `/edit/stakeholder/${id}`,
        query: { formType: 'stakeholder' },
      },
      `/edit/stakeholder/${id}`
    )
  }

  return (
    <div className="sticky-panel">
      <div
        className="sticky-panel-item"
        onClick={() => {
          handleChangeRelation('interested in')
          relation &&
          relation.association &&
          relation.association.indexOf('interested in') !== -1
            ? eventTrack('Stakeholder view', 'Unfollow', 'Button')
            : eventTrack('Stakeholder view', 'Follow', 'Button')
        }}
      >
        <FollowIcon className="svg-icon" />
        {relation &&
        relation.association &&
        relation.association.indexOf('interested in') !== -1 ? (
          <h2>
            <Trans>Unfollow</Trans>
          </h2>
        ) : (
          <h2>
            <Trans>Follow</Trans>
          </h2>
        )}
      </div>

      {canEdit() && (
        <div className="sticky-panel-item" onClick={() => handleEditBtn()}>
          <EditIcon className="edit-icon" />
          <h2>
            <Trans>Update</Trans>
          </h2>
        </div>
      )}

      {canDelete() && (
        <div
          className="sticky-panel-item"
          onClick={() => {
            Modal.error({
              className: 'popup-delete',
              centered: true,
              closable: true,
              icon: <DeleteOutlined />,
              title: t`Are you sure you want to delete this entity?`,
              content: t`Please be aware this action cannot be undone.`,
              okText: t`Delete`,
              okType: 'danger',
              onOk() {
                eventTrack('Stakeholder view', 'Delete', 'Button')
                return api
                  .delete(`/detail/stakeholder/${id}`)
                  .then((res) => {
                    notification.success({
                      message: t`Entity deleted successfully`,
                    })
                    history.push({
                      pathname: `/connect/community`,
                    })
                  })
                  .catch((err) => {
                    console.error(err)
                    notification.error({
                      message: t`Oops, something went wrong`,
                    })
                  })
              },
            })
          }}
        >
          <TrashIcon className="svg-icon" />
          <h2>
            <Trans>Delete</Trans>
          </h2>
        </div>
      )}
    </div>
  )
}

const StakeholderDetail = ({
  setLoginVisible,
  isAuthenticated,
  loadingProfile,
}) => {
  const {
    profile,
    countries,
    languages,
    regionOptions,
    meaOptions,
    transnationalOptions,
    icons,
  } = UIStore.useState((s) => ({
    profile: s.profile,
    countries: s.countries,
    languages: s.languages,
    regionOptions: s.regionOptions,
    meaOptions: s.meaOptions,
    transnationalOptions: s.transnationalOptions,
    icons: s.icons,
  }))
  const router = useRouter()
  const [data, setData] = useState(null)
  const [relations, setRelations] = useState([])
  const [ownedResources, setOwnedResources] = useState([])
  const [bookedResources, setBookedResources] = useState([])
  const [ownedResourcesCount, setOwnedResourcesCount] = useState(0)
  const [bookedResourcesCount, setBookedResourcesCount] = useState(0)
  const [ownedResourcesPage, setOwnedResourcesPage] = useState(0)
  const [bookedResourcesPage, setBookedResourcesPage] = useState(0)
  const [warningVisible, setWarningVisible] = useState(false)

  const prevValue = usePrevious(data)
  const { id } = router.query

  const relation = relations.find(
    (it) => it.topicId === parseInt(id) && it.topic === 'stakeholder'
  )

  const isConnectStakeholders = ['organisation', 'stakeholder'].includes(
    'stakeholder'
  )
  const breadcrumbLink = isConnectStakeholders ? 'stakeholders' : 'browse'

  const isLoaded = useCallback(
    () =>
      Boolean(
        !isEmpty(countries) &&
          (isConnectStakeholders ? !isEmpty(profile) : true)
      ),
    [countries, profile, isConnectStakeholders]
  )

  const getOwnedResources = useCallback(
    (n) => {
      setOwnedResourcesPage(n)
      const searchParms = new URLSearchParams()
      searchParms.set('limit', 20)
      searchParms.set('page', n)
      searchParms.set('association', 'owner')
      const url = `/stakeholder/${id}/associated-topics?${String(searchParms)}`
      api
        .get(url)
        .then((d) => {
          setOwnedResources(
            d?.data?.associatedTopics?.filter(
              (item) => item.reviewStatus === 'APPROVED'
            )
          )
          setOwnedResourcesCount(d.data.count)
        })
        .catch((err) => {
          console.error(err)
          // redirectError(err, history);
        })
    },
    [router]
  )

  const getBookedResources = useCallback(
    (n) => {
      setBookedResourcesPage(n)
      const searchParms = new URLSearchParams()
      searchParms.set('limit', 20)
      searchParms.set('page', n)
      searchParms.set('association', 'interested in')
      const url = `/stakeholder/${id}/associated-topics?${String(searchParms)}`
      api
        .get(url)
        .then((d) => {
          setBookedResources(
            d?.data?.associatedTopics?.filter(
              (item) => item.reviewStatus === 'APPROVED'
            )
          )
          setBookedResourcesCount(d.data.count)
        })
        .catch((err) => {
          console.error(err)
          // redirectError(err, history);
        })
    },
    [router]
  )

  useEffect(() => {
    if (isLoaded()) {
      !data &&
        id &&
        api
          .get(`/detail/stakeholder/${id}`)
          .then((d) => {
            setData(d.data)
            getOwnedResources(0)
            getBookedResources(0)
          })
          .catch((err) => {
            console.error(err)
            // redirectError(err, history);
          })
      if (isLoaded() && profile.reviewStatus === 'APPROVED') {
        setTimeout(() => {
          api.get(`/favorite/stakeholder/${id}`).then((resp) => {
            setRelations(resp.data)
          })
        }, 100)
      }
      UIStore.update((e) => {
        e.disclaimer = null
      })
      window.scrollTo({ top: 0 })
    }
  }, [isLoaded])

  useEffect(() => {
    if (!isAuthenticated && !loadingProfile) {
      // setLoginVisible(true)
    }
    if (isAuthenticated) {
      setLoginVisible(false)
    }
  }, [isAuthenticated])

  const handleRelationChange = (relation) => {
    if (!isAuthenticated) {
      setLoginVisible(true)
    }
    if (profile.reviewStatus === 'SUBMITTED') {
      setWarningVisible(true)
    }
    if (isAuthenticated && profile.reviewStatus === undefined) {
      setLoginVisible(true)
    }
    if (profile.reviewStatus === 'APPROVED') {
      api.post('/favorite', relation).then((res) => {
        const relationIndex = relations.findIndex(
          (it) => it.topicId === relation.topicId
        )
        if (relationIndex !== -1) {
          setRelations([
            ...relations.slice(0, relationIndex),
            relation,
            ...relations.slice(relationIndex + 1),
          ])
        } else {
          setRelations([...relations, relation])
        }
      })
    }
  }

  if (!data) {
    return (
      <div className="details-view">
        <div className="loading">
          <LoadingOutlined spin />
          <i>
            <Trans>Loading...</Trans>
          </i>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.stakeholderDetail}>
      <div className="topbar-container">
        <div className="ui container">
          <Row>
            <Col xs={24} lg={24}>
              <div className="topbar-wrapper">
                <div className="topbar-image-holder">
                  <Avatar
                    size={150}
                    src={
                      data?.picture ? (
                        data?.picture
                      ) : (
                        <Avatar
                          style={{
                            backgroundColor: randomColor(
                              data?.firstName?.substring(0, 1)
                            ),
                            verticalAlign: 'middle',
                            border: '4px solid #fff',
                            fontSize: '62px',
                            fontWeight: 'bold',
                          }}
                          size={145}
                        >
                          {data?.firstName?.substring(0, 1)}
                        </Avatar>
                      )
                    }
                  />
                  {data.affiliation && (
                    <div className="topbar-entity-image-holder">
                      <Avatar
                        size={50}
                        src={
                          data?.affiliation?.logo ? (
                            data?.affiliation?.logo
                          ) : (
                            <Avatar
                              style={{
                                backgroundColor: randomColor(
                                  data?.affiliation?.name?.substring(0, 1)
                                ),
                                verticalAlign: 'middle',
                              }}
                              size={50}
                            >
                              {data?.affiliation?.name?.substring(0, 1)}
                            </Avatar>
                          )
                        }
                      />
                    </div>
                  )}
                </div>
                <div className="topbar-title-holder">
                  <h1>{data?.firstName + ' ' + data?.lastName}</h1>
                  {data?.jobTitle && data?.affiliation && (
                    <p className="role">
                      {data?.jobTitle} @ {data?.affiliation?.name}
                    </p>
                  )}
                  {data?.assignedBadges?.length > 0 && (
                    <div className="badges-wrapper">
                      {data?.assignedBadges?.map((b) => {
                        const badgeDetails = getBadgeTitle(b.badgeName)
                        return (
                          <Tooltip
                            placement="top"
                            title={badgeDetails.title}
                            color="#020A5B"
                          >
                            <div key={b.badgeName}>
                              <img src={badgeDetails.image} />
                            </div>
                          </Tooltip>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
      <div className="info-container">
        <div className="ui container">
          <Row gutter={[16, 16]}>
            <Col xs={6} lg={6} className="flex-col">
              <CardComponent title={<Trans>Basic info</Trans>}>
                <div className="list ">
                  <List itemLayout="horizontal">
                    <List.Item className="location">
                      <List.Item.Meta
                        avatar={<Avatar src="/location.svg" />}
                        title={
                          countries.find((it) => it.id === data?.country)?.name
                        }
                      />
                    </List.Item>
                    {data?.affiliation && (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              size={55}
                              className="info-entity-icon"
                              src={
                                data?.affiliation?.logo ? (
                                  data?.affiliation?.logo
                                ) : (
                                  <Avatar
                                    style={{
                                      backgroundColor: randomColor(
                                        data?.affiliation?.name
                                      ),
                                      verticalAlign: 'middle',
                                    }}
                                    size={55}
                                  >
                                    {data?.affiliation?.name?.substring(0, 1)}
                                  </Avatar>
                                )
                              }
                            />
                          }
                          title={
                            <Link
                              href={`/organisation/${data?.affiliation?.id}`}
                              legacyBehavior
                            >
                              <a>{data?.affiliation?.name}</a>
                            </Link>
                          }
                          description={'Entity'}
                        />
                      </List.Item>
                    )}
                  </List>
                </div>
              </CardComponent>
              <CardComponent title={<Trans>Contact info</Trans>}>
                <div className="list social-list">
                  <List itemLayout="horizontal">
                    {data?.linkedIn && (
                      <List.Item className="location">
                        <List.Item.Meta
                          avatar={<LinkedinOutlined />}
                          title={
                            <a
                              href={
                                data?.linkedIn.includes('https://')
                                  ? data?.linkedIn
                                  : 'https://' + data?.linkedIn
                              }
                              target="_blank"
                            >
                              {data?.linkedIn}
                            </a>
                          }
                        />
                      </List.Item>
                    )}
                    {data?.twitter && (
                      <List.Item className="location">
                        <List.Item.Meta
                          avatar={<TwitterOutlined />}
                          title={
                            <a
                              href={
                                data?.twitter.includes('https://')
                                  ? data?.twitter
                                  : 'https://' + data?.twitter
                              }
                              target="_blank"
                            >
                              {data?.twitter}
                            </a>
                          }
                        />
                      </List.Item>
                    )}
                    {/* <List.Item className="location">
                      <List.Item.Meta
                        avatar={<FilePdfOutlined />}
                        title="Link to CV"
                      />
                    </List.Item> */}
                    {data?.email && (
                      <List.Item className="location">
                        <List.Item.Meta
                          avatar={<MailOutlined />}
                          title={
                            <a href={`mailto:${data?.email}`} target="_blank">
                              {data?.email}
                            </a>
                          }
                        />
                      </List.Item>
                    )}
                  </List>
                </div>
              </CardComponent>
            </Col>
            <Col xs={18} lg={18}>
              <div className="description-container">
                <div className="description-wrapper">
                  <CardComponent
                    title={<Trans>Bio</Trans>}
                    style={{
                      height: '100%',
                      boxShadow: 'none',
                      borderRadius: 'none',
                      width: '100%',
                    }}
                  >
                    <div className="bio">
                      <ReadMoreReact
                        text={data?.about ? data?.about : ''}
                        lines={5}
                        readMoreText="Read more"
                        readLessText="Read less"
                      />
                    </div>
                    <div className="exta-info">
                      <Row gutter={[16, 16]}>
                        <Col xs={12} lg={12}>
                          {data?.tags &&
                            data?.tags?.filter(
                              (item) => item.tagRelationCategory === 'seeking'
                            ).length > 0 && (
                              <CardComponent>
                                <div className="ant-card-head-wrapper">
                                  <div className="ant-card-head-title">
                                    <Trans>Seeking</Trans>{' '}
                                    <span>
                                      (
                                      {
                                        data?.tags?.filter(
                                          (item) =>
                                            item.tagRelationCategory ===
                                            'seeking'
                                        ).length
                                      }{' '}
                                      Keywords)
                                    </span>
                                  </div>
                                </div>
                                <List>
                                  {data?.tags
                                    ?.filter(
                                      (item) =>
                                        item.tagRelationCategory === 'seeking'
                                    )
                                    ?.map((str) => (
                                      <List.Item key={str.tag}>
                                        <Typography.Text>
                                          {str.tag}
                                        </Typography.Text>
                                      </List.Item>
                                    ))}
                                </List>
                              </CardComponent>
                            )}
                        </Col>
                        <Col xs={12} lg={12}>
                          {data?.tags &&
                            data?.tags?.filter(
                              (item) => item.tagRelationCategory === 'offering'
                            ).length > 0 && (
                              <CardComponent>
                                <div className="ant-card-head-wrapper">
                                  <div className="ant-card-head-title">
                                    <Trans>Offering</Trans>{' '}
                                    <span>
                                      (
                                      {
                                        data?.tags?.filter(
                                          (item) =>
                                            item.tagRelationCategory ===
                                            'offering'
                                        ).length
                                      }{' '}
                                      Keywords)
                                    </span>
                                  </div>
                                </div>
                                <List>
                                  {data?.tags
                                    ?.filter(
                                      (item) =>
                                        item.tagRelationCategory === 'offering'
                                    )
                                    ?.map((str) => (
                                      <List.Item key={str.tag}>
                                        <Typography.Text>
                                          {str.tag}
                                        </Typography.Text>
                                      </List.Item>
                                    ))}
                                </List>
                              </CardComponent>
                            )}
                        </Col>
                      </Row>
                    </div>
                  </CardComponent>
                  <SharePanel
                    profile={profile}
                    isAuthenticated={isAuthenticated}
                    data={data}
                    id={id}
                    relation={relation}
                    history={router}
                    handleRelationChange={handleRelationChange}
                  />
                </div>
              </div>
            </Col>
          </Row>
          {ownedResources.length > 0 && (
            <div className="owned-resources-wrapper">
              <div className="card-wrapper resource-cards-wrapper">
                <CardComponent title={'Owned resources'}>
                  <ResourceCards
                    items={ownedResources}
                    showMoreCardAfter={20}
                    showMoreCardHref={'/knowledge/library'}
                  />
                </CardComponent>
              </div>
            </div>
          )}

          {bookedResources.length > 0 && (
            <div className="bookmarked-resources-wrapper">
              <CardComponent title={'Bookmarked resources'}>
                <ResourceCards
                  items={bookedResources}
                  showMoreCardAfter={20}
                  showMoreCardHref={'/knowledge/library'}
                />
              </CardComponent>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StakeholderDetail
