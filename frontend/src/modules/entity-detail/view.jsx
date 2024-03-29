/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback } from 'react'
import styles from './styles.module.scss'
import { UIStore } from '../../store'
import {
  Row,
  Col,
  Avatar,
  List,
  Card,
  Pagination,
  Modal,
  notification,
  Typography,
  Tooltip,
} from 'antd'

import TrashIcon from '../../images/resource-detail/trash-icn.svg'
import EditIcon from '../../images/resource-detail/edit-icn.svg'
import FollowIcon from '../../images/resource-detail/follow-icn.svg'
import {
  LinkOutlined,
  LoadingOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import api from '../../utils/api'
import { Trans, t } from '@lingui/macro'
import { resourceTypeToTopicType, getBadgeTitle } from '../../utils/misc'

import isEmpty from 'lodash/isEmpty'
import { redirectError } from '../error/error-util'
import { useAuth0 } from '@auth0/auth0-react'
import { randomColor, eventTrack } from '../../utils/misc'
import ResourceCards from '../../components/resource-cards/resource-cards'
import { useRouter } from 'next/router'

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
  handleRelationChange,
  handleEditBtn,
  history,
}) => {
  const noEditTopics = new Set(['stakeholder'])

  const canEdit = () =>
    isAuthenticated &&
    profile.reviewStatus === 'APPROVED' &&
    (profile.role === 'ADMIN' ||
      profile.id === data.createdBy ||
      data.owners.includes(profile.id))

  const canDelete = () =>
    isAuthenticated &&
    profile.reviewStatus === 'APPROVED' &&
    profile.role === 'ADMIN'

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
      topic: resourceTypeToTopicType('organisation'),
    })
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
            ? eventTrack('Entity view', 'Unfollow', 'Button')
            : eventTrack('Entity view', 'Follow', 'Button')
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
                eventTrack('Entity view', 'Delete', 'Button')
                return api
                  .delete(`/detail/organisation/${id}`)
                  .then((res) => {
                    notification.success({
                      message: 'Entity deleted successfully',
                    })
                    history.push({
                      pathname: `/connect/community`,
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
  setStakeholderSignupModalVisible,
  setFilterMenu,
  isAuthenticated,
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
  const { loginWithPopup } = useAuth0()
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
  const { id } = router.query

  const relation = relations.find(
    (it) =>
      it.topicId === parseInt(id) &&
      it.topic === resourceTypeToTopicType('organisation')
  )

  const isConnectStakeholders = ['organisation', 'stakeholder'].includes(
    'organisation'
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
      const url = `/organisation/${id}/content?${String(searchParms)}`
      api
        .get(url)
        .then((d) => {
          setOwnedResources(d.data.results)
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
      searchParms.set('limit', 3)
      searchParms.set('page', n)
      const url = `/organisation/${id}/members?${String(searchParms)}`
      api
        .get(url)
        .then((d) => {
          setBookedResources(d.data.members)
          setBookedResourcesCount(d.data.count)
        })
        .catch((err) => {
          console.error(err)
          // redirectError(err, history);
        })
    },
    [router]
  )

  const handleEditBtn = () => {
    eventTrack('Entity view', 'Edit', 'Button')
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
        entity: 1,
      }
    })
    router.push(
      {
        pathname: `/edit/entity/${id}`,
        query: { formType: 'entity' },
      },
      `/edit/entity/${id}`
    )
  }

  useEffect(() => {
    if (isLoaded()) {
      !data &&
        id &&
        api
          .get(`/detail/organisation/${id}`)
          .then((d) => {
            setData(d.data)
            getOwnedResources(0)
            getBookedResources(0)
          })
          .catch((err) => {
            console.error(err)
            redirectError(err, router)
          })
      if (isLoaded() && profile.reviewStatus === 'APPROVED') {
        setTimeout(() => {
          api.get(`/favorite/organisation/${id}`).then((resp) => {
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

  const handleRelationChange = (relation) => {
    if (!isAuthenticated) {
      loginWithPopup()
    }
    if (profile.reviewStatus === 'SUBMITTED') {
      setWarningVisible(true)
    }
    if (isAuthenticated && profile.reviewStatus === undefined) {
      setStakeholderSignupModalVisible(true)
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
    <div className={styles.entityDetail}>
      <div className="topbar-container">
        <div className="ui container">
          <Row>
            <Col xs={24} lg={24}>
              <div className="topbar-wrapper">
                <div className="topbar-image-holder">
                  <Avatar
                    size={{
                      xs: 60,
                      sm: 60,
                      md: 60,
                      lg: 100,
                      xl: 150,
                      xxl: 150,
                    }}
                    src={
                      data?.logo ? (
                        data?.logo
                      ) : (
                        <Avatar
                          style={{
                            backgroundColor: randomColor(
                              data?.name?.substring(0, 1)
                            ),
                            fontSize: '62px',
                            fontWeight: 'bold',
                            verticalAlign: 'middle',
                            border: '4px solid #fff',
                          }}
                          size={{
                            xs: 55,
                            sm: 55,
                            md: 55,
                            lg: 95,
                            xl: 145,
                            xxl: 145,
                          }}
                        >
                          {data?.name?.substring(0, 1)}
                        </Avatar>
                      )
                    }
                  />
                </div>
                <div className="topbar-title-holder">
                  <h1>{data?.name}</h1>
                  {data?.assignedBadges?.length > 0 && (
                    <div className="badges-wrapper">
                      {data.assignedBadges.map((b) => {
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
              <CardComponent title="Basic info">
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
                    {data?.geoCoverageType && (
                      <List.Item className="location">
                        <List.Item.Meta
                          avatar={<Avatar src="/transnational.svg" />}
                          title={
                            <>
                              <span style={{ textTransform: 'capitalize' }}>
                                {data?.geoCoverageType}
                              </span>
                            </>
                          }
                        />
                      </List.Item>
                    )}
                  </List>
                </div>
              </CardComponent>
              <CardComponent title="Contact info">
                <div className="list social-list">
                  <List itemLayout="horizontal">
                    {data?.url && (
                      <List.Item className="location">
                        <List.Item.Meta
                          avatar={<LinkOutlined />}
                          title={
                            <a
                              href={
                                data?.url?.includes('https://') ||
                                data?.url?.includes('http://')
                                  ? data?.url
                                  : 'https://' + data?.url
                              }
                              target="_blank"
                            >
                              {data?.url}
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
                    style={{
                      height: '100%',
                      boxShadow: 'none',
                      borderRadius: 'none',
                      width: '100%',
                    }}
                  >
                    <p>{data?.program}</p>

                    {data?.tags && Array.isArray(data?.tags) && (
                      <div className="exta-info">
                        <div className="exta-info-head-title">
                          <Trans>Area of expertise</Trans>
                        </div>
                        <List>
                          {data?.tags
                            ?.filter((item) => !item.private)
                            .map((str) => (
                              <List.Item key={str.id}>
                                <Typography.Text>{str.tag}</Typography.Text>
                              </List.Item>
                            ))}
                        </List>
                      </div>
                    )}
                  </CardComponent>
                  <SharePanel
                    profile={profile}
                    isAuthenticated={isAuthenticated}
                    data={data}
                    id={id}
                    relation={relation}
                    handleEditBtn={handleEditBtn}
                    history={router}
                    handleRelationChange={handleRelationChange}
                  />
                </div>
              </div>
            </Col>
          </Row>
          <div className="owned-resources-wrapper">
            {ownedResources.length > 0 && (
              <CardComponent
                title={
                  <div className="related-content-title-wrapper">
                    <div className="related-content-title">
                      <Trans>Content on the platform</Trans>
                    </div>
                    <div className="related-content-count">
                      <Trans>Total</Trans> {ownedResourcesCount}
                    </div>
                  </div>
                }
              >
                <ResourceCards
                  items={ownedResources}
                  showMoreCardAfter={10}
                  showMoreCardHref={`/knowledge/library?entity=${data.id}`}
                />
              </CardComponent>
            )}
          </div>
          <div>
            {bookedResources.length > 0 && (
              <CardComponent
                title={`Individuals (${bookedResourcesCount})`}
                style={{
                  height: '100%',
                  boxShadow: 'none',
                  borderRadius: 'none',
                }}
              >
                <div style={{ padding: '0 10px' }} className="individuals">
                  <Row gutter={[16, 16]} style={{ width: '100%' }}>
                    {bookedResources.map((item) => (
                      <Col xs={6} lg={8} key={item.id}>
                        <div
                          className="slider-card"
                          onClick={() => {
                            router.push({
                              pathname: `/stakeholder/${item.id}`,
                            })
                          }}
                        >
                          <Row style={{ width: '100%' }}>
                            <Col className="individual-details" xs={6} lg={14}>
                              <div className="profile-image">
                                <Avatar
                                  style={{ border: 'none' }}
                                  key={item?.picture}
                                  size={{
                                    xs: 60,
                                    sm: 60,
                                    md: 60,
                                    lg: 100,
                                    xl: 150,
                                    xxl: 150,
                                  }}
                                  src={
                                    item?.picture ? (
                                      item?.picture
                                    ) : (
                                      <Avatar
                                        style={{
                                          backgroundColor: randomColor(
                                            item?.name?.substring(0, 1)
                                          ),
                                          verticalAlign: 'middle',
                                          fontSize: '62px',
                                          fontWeight: 'bold',
                                        }}
                                        size={{
                                          xs: 55,
                                          sm: 55,
                                          md: 55,
                                          lg: 95,
                                          xl: 145,
                                          xxl: 145,
                                        }}
                                      >
                                        {item?.name?.substring(0, 1)}
                                      </Avatar>
                                    )
                                  }
                                />
                              </div>
                            </Col>
                            <Col className="individual-details" xs={6} lg={10}>
                              <div className="profile-detail">
                                <h5>{item.name}</h5>
                                {/* <p>
                                  <span>
                                    <img src={LocationImage} />
                                  </span>
                                  Location
                                </p> */}
                                <h4>{data?.name}</h4>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    ))}
                  </Row>
                  {bookedResourcesCount > 3 && (
                    <div className="pagination-wrapper">
                      <Pagination
                        showSizeChanger={false}
                        defaultCurrent={1}
                        current={bookedResourcesPage + 1}
                        pageSize={3}
                        total={bookedResourcesCount || 0}
                        onChange={(n, size) => getBookedResources(n - 1)}
                      />
                    </div>
                  )}
                </div>
              </CardComponent>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StakeholderDetail
