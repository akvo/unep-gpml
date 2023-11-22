import React, { useCallback, useEffect, useState } from 'react'
import {
  Row,
  Col,
  Carousel,
  Avatar,
  Typography,
  Modal,
  notification,
  List,
} from 'antd'
const { Title } = Typography
import kebabCase from 'lodash/kebabCase'
import styles from './styles.module.scss'
import { FilePdfOutlined, DeleteOutlined } from '@ant-design/icons'
import api from '../../utils/api'
import Link from 'next/link'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { PREFIX_SLUG, getParentChecked, stepsState } from './ps/config'
import classNames from 'classnames'
import SkeletonItems from './ps/skeleton-items'
import Button from '../../components/button'
import ForumCard from '../../components/forum-card/forum-card'
import ForumMembers from '../forum/forum-members'
import { Trans, t } from '@lingui/macro'
import { ChatStore } from '../../store'

const DynamicForumModal = dynamic(
  () => import('../../modules/forum/forum-modal'),
  {
    ssr: false,
  }
)

const Workspace = ({ profile, isAuthenticated, setLoginVisible }) => {
  const router = useRouter()
  const [isFocal, setIsFocal] = useState(false)
  const [projects, setProjects] = useState([])
  const [psAll, setPSAll] = useState([])
  const [psLoading, setPsLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [forumFetched, setForumFetched] = useState(false)
  const [forumView, setForumView] = useState({
    open: false,
    data: {},
  })

  const suggestions = [
    {
      title: t`Data tools`,
      key: 'data-tool',
      content: t`Contribute to the DataHub Maps & Dashboard`,
      buttonText: t`Upload your data`,
      href:
        'https://unep-gpml.eu.auth0.com/authorize?response_type=code&client_id=lmdxuDGdQjUsbLbMFpjDCulTP1w5Z4Gi&redirect_uri=https%3A//apps.unep.org/data-catalog/oauth2/callback&scope=openid+profile+email&state=eyJjYW1lX2Zyb20iOiAiL2Rhc2hib2FyZCJ9',
    },
    {
      title: t`Knowledge Library`,
      key: 'knowledge-library',
      content: t`Share Your Knowledge`,
      link: '/flexible-forms',
      buttonText: t`Add Content`,
    },
    {
      title: t`Match-making`,
      key: 'match-making',
      link: '/community',
      content: t`Match with opportunities`,
      buttonText: t`Connect`,
    },
  ]

  const handleFocalPoint = (id) => {
    setIsFocal(true)
    localStorage.setItem('is_focal', JSON.stringify({ id: id, status: true }))
  }

  useEffect(() => {
    const item = localStorage.getItem('is_focal')
    if (item && profile) {
      setIsFocal(profile?.org?.id === JSON.parse(item).id ? true : false)
    }
  }, [profile])

  useEffect(() => {
    if (profile && profile.reviewStatus === 'APPROVED') fetchAllProjects()
  }, [profile])

  const fetchAllProjects = () => {
    api
      .get('/project')
      .then((res) => {
        setProjects(res.data.projects)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const handleDeleteBtn = (id) => {
    Modal.error({
      className: 'popup-delete',
      centered: true,
      closable: true,
      icon: <DeleteOutlined />,
      title: 'Are you sure you want to delete this project?',
      content: 'Please be aware this action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk() {
        return api
          .delete(`/project/${id}`)
          .then((res) => {
            notification.success({
              message: 'Project deleted successfully',
            })
            fetchAllProjects()
          })
          .catch((err) => {
            console.error(err)
            notification.error({
              message: 'Oops, something went wrong',
            })
          })
      },
    })
  }

  const goToChannel = (forum) => {
    const { name, t, isView } = forum
    if (isView) {
      setForumView({
        open: true,
        data: forum,
      })
      return
    }
    router.push({
      pathname: `/forum/${name}`,
      query: {
        t,
      },
    })
  }

  const getPSAll = useCallback(async () => {
    try {
      if (profile?.id) {
        const { data: plasticsStrategies } = await api.get('/plastic-strategy')
        setPSAll(plasticsStrategies)
        setPsLoading(false)
      }
    } catch (error) {
      console.error('Unable to fetch plastics strategy:', error)
      setPsLoading(false)
    }
  }, [profile])

  const sortPublicFirst = (a, b) => {
    if (a.t === 'c' && b.type !== 'c') {
      return -1
    } else if (a.t !== 'c' && b.t === 'c') {
      return 1
    } else {
      return 0
    }
  }
  const myForums = ChatStore.useState((s) => s.myForums)
  const allForums = ChatStore.useState((s) => s.allForums)
  const forums = myForums?.length ? myForums : allForums

  const getAllForums = useCallback(async () => {
    if (!profile?.id) {
      return
    }
    if (forums.length && loading) {
      setLoading(false)
    }
    if (!forums.length && !forumFetched) {
      setForumFetched(true)
      const { data: _myForums } = await api.get('/chat/user/channel')
      ChatStore.update((s) => {
        s.myForums = _myForums?.sort(sortPublicFirst)
      })
      if (!_myForums.length) {
        const { data: _allForums } = await api.get('/chat/channel/all')
        ChatStore.update((s) => {
          s.allForums = _allForums
            ?.sort(sortPublicFirst)
            ?.map((a) => ({ ...a, isView: true }))
        })
      }
      setLoading(false)
    }
  }, [profile, forums, loading, forumFetched])

  useEffect(() => {
    getPSAll()
  }, [getPSAll])

  useEffect(() => {
    getAllForums()
  }, [getAllForums])

  return (
    <div className={styles.workspace}>
      <div className={styles.workspaceContentWrapper}>
        <div className={styles.workspaceContainer}>
          {profile &&
            profile?.emailVerified &&
            profile?.reviewStatus === 'SUBMITTED' && (
              <div className="pending-stripe">
                <Title level={4}>
                  <Trans>
                    Your account is pending reviewal. You can still explore the
                    platform.
                  </Trans>
                </Title>
              </div>
            )}
          {profile && !profile?.emailVerified && (
            <div className="pending-stripe">
              <Title level={4}>
                <Trans>
                  We sent you a confirmation email, Please take a moment and
                  validate your address to confirm your account.
                </Trans>
              </Title>
            </div>
          )}
          {profile && profile.org && !profile?.org?.isMember && (
            <Row
              className="bg-white gpml-section"
              style={{ order: isFocal && 2 }}
            >
              <Col lg={12} sm={24}>
                <div className="content-container">
                  <p className="recommend-text">
                    <Trans>RECOMMENDED</Trans>
                  </p>
                  <Title level={2}>GPML Partnership​</Title>
                  <p className="registration-text">
                    <Trans>
                      Hello, It looks like your entity:{' '}
                      <b>{profile?.org?.name},</b> is not yet part <br /> of the
                      GPML partnership.
                      <br /> If you are the focal point, submit your application
                      below
                    </Trans>
                    <br />
                    <br />
                  </p>
                  <div className="join-box">
                    <div>
                      <p>
                        <Trans>
                          By completing this form I confirm that I have the
                          authorization to submit an application on behalf of
                          this Entity to become a member of the Global
                          Partnership on Marine Litter (GPML)​.
                        </Trans>
                        <br />
                        <br />
                      </p>
                    </div>
                    <div className="button-container">
                      <Button
                        type="primary"
                        shape="round"
                        withArrow
                        onClick={() =>
                          router.push(
                            {
                              pathname: '/entity-signup',
                              query: { state: JSON.stringify(profile.org) },
                            },
                            '/entity-signup'
                          )
                        }
                      >
                        JOIN GPML
                      </Button>
                      {!isFocal && (
                        <Button
                          type="ghost"
                          onClick={() => handleFocalPoint(profile?.org?.id)}
                        >
                          <Trans>I AM NOT THE FOCAL POINT</Trans>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Col>
              <Col lg={12} sm={24}>
                <div className="slider-container">
                  <Carousel effect="fade">
                    <div>
                      <div className="slider-wrapper">
                        <Avatar
                          src="/auth/network.png"
                          style={{
                            borderRadius: 'initial',
                            margin: '0 auto 40px auto',
                            display: 'block',
                            width: 160,
                            height: 140,
                          }}
                        />
                        <Title level={2}>
                          <Trans>
                            Tap into a global network of like-minded members​
                          </Trans>
                        </Title>
                      </div>
                    </div>
                    <div>
                      <div className="slider-wrapper">
                        <Avatar
                          src="/auth/network.png"
                          style={{
                            borderRadius: 'initial',
                            margin: '0 auto 40px auto',
                            display: 'block',
                            width: 160,
                            height: 140,
                          }}
                        />
                        <Title level={2}>
                          <Trans>Network with other stakeholders</Trans>
                        </Title>
                      </div>
                    </div>
                  </Carousel>
                </div>
              </Col>
            </Row>
          )}
          <div className="workspace-title container">
            <div className="caps-heading-m">
              <Trans>workspace</Trans>
            </div>
          </div>
          <div className={styles.forumContainer}>
            <div className="container">
              <div className="forum-heading">
                <h2 className="w-bold">
                  <Trans>Forums</Trans>
                </h2>
                <Link href="/forum">
                  <Button withArrow="link" ghost>
                    <Trans>View All Forums</Trans>
                  </Button>
                </Link>
              </div>
              <List
                className="forum-list"
                dataSource={forums.slice(0, 3)}
                loading={loading}
                renderItem={(item) => (
                  <List.Item>
                    <ForumCard>
                      <ForumCard.HStack>
                        <ForumCard.Title {...item} />
                      </ForumCard.HStack>
                      <ForumCard.HStack>
                        {item?.isView ? (
                          <ForumMembers forum={item} />
                        ) : (
                          <ForumCard.LastMessage lm={item?.lm} />
                        )}
                        <div>
                          {item?.isView ? (
                            <Button
                              size="small"
                              onClick={() => goToChannel(item)}
                              ghost
                            >
                              <Trans>View</Trans>
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              withArrow="link"
                              onClick={() => goToChannel(item)}
                            >
                              <Trans>Chat</Trans>
                            </Button>
                          )}
                        </div>
                      </ForumCard.HStack>
                    </ForumCard>
                  </List.Item>
                )}
              />
              <DynamicForumModal
                viewModal={forumView}
                setViewModal={setForumView}
                allForums={forums}
                setLoginVisible={setLoginVisible}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </div>
          <div className="plastic-strategies-list">
            <div className="container">
              {psAll.length > 0 && (
                <div className="heading-container">
                  <h2 className="h-xxl w-bold">
                    <Trans>Plastic Strategies</Trans>
                  </h2>
                  {psAll?.length > 3 && (
                    <Link href="/workspace/plastic-strategies">
                      <Button withArrow="link" ghost>
                        <Trans>View All Plastic Strategies</Trans>
                      </Button>
                    </Link>
                  )}
                </div>
              )}
              <SkeletonItems loading={psLoading} />
              <ul className="plastic-strategies-items">
                {psAll.slice(0, 3).map((item, index) => (
                  <PSCard item={item} key={index} />
                ))}
              </ul>
            </div>
          </div>
          <div className="action-suggestions">
            <div className="container">
              <h2 className="h-xxl w-bold">
                <Trans>What to do next?</Trans>
              </h2>
              <Row gutter={[24, 16]}>
                {suggestions.map((item) => (
                  <Col lg={8} key={item?.key}>
                    <div className="feature-card">
                      <div
                        className={`card-title-container card--${item?.key}`}
                      >
                        <h3 className="h-l">{item.title}</h3>
                      </div>
                      <div className="card-content-container">
                        <p className="p-l">{item?.content}</p>
                        <Button
                          size="large"
                          ghost
                          withArrow
                          disabled={
                            profile &&
                            (!profile?.emailVerified ||
                              profile?.reviewStatus === 'SUBMITTED')
                          }
                          onClick={() => {
                            if (item.href) {
                              window.open(
                                'https://unep-gpml.eu.auth0.com/authorize?response_type=code&client_id=lmdxuDGdQjUsbLbMFpjDCulTP1w5Z4Gi&redirect_uri=https%3A//apps.unep.org/data-catalog/oauth2/callback&scope=openid+profile+email&state=eyJjYW1lX2Zyb20iOiAiL2Rhc2hib2FyZCJ9',
                                '_blank'
                              )
                            } else {
                              router.push(`/${item.link}`)
                            }
                          }}
                        >
                          {item.buttonText}
                        </Button>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </div>
          <Row className="video-panel">
            <Col lg={24} sm={24}>
              <Title level={2}>
                <Trans>Watch this video to get started</Trans>
              </Title>
              <iframe
                width="100%"
                height="640px"
                src="https://www.youtube.com/embed/xSYkLgoHqVQ"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  )
}

export const PSCard = ({ item, key }) => {
  const psSteps = item?.steps || stepsState
  const allSteps = psSteps.flatMap((p) => {
    if (p?.substeps?.length) {
      return p.substeps.map((sb, sx) => ({
        ...sb,
        label: sx === 0 ? p.label : sb.label,
      }))
    }
    return [p]
  })
  const progressValue = Math.floor(
    (allSteps.filter((a) => a.checked).length / allSteps.length) * 100
  )
  const countryName = kebabCase(item?.country?.name)
  return (
    <li key={key}>
      <Link href={`/workspace/${PREFIX_SLUG}-${countryName}`}>
        <div className="caps-heading-s">
          <Trans>plastic strategy</Trans>
        </div>
        <h4 className="w-semi">{item?.country?.name}</h4>
        {/* <div className="compl">{`${progressValue}%`}</div> */}
        <div className="progress-bar">
          <div className="fill" style={{ width: `${progressValue}%` }}></div>
        </div>
        <ul>
          {psSteps.map((s, sx) => (
            <li
              key={sx}
              className={classNames({
                checked: getParentChecked(s),
              })}
            >
              {s.label}
            </li>
          ))}
        </ul>
      </Link>
    </li>
  )
}

export default Workspace
