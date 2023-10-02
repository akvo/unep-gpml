import React, { useEffect, useState } from 'react'
import {
  Row,
  Col,
  Carousel,
  Avatar,
  Typography,
  Button,
  Modal,
  notification,
} from 'antd'
const { Title } = Typography
import styles from './styles.module.scss'
import DataCatalogueSvg from '../../images/data-catalogue-icon.svg'
import MatchSvg from '../../images/match.svg'
import UploadSvg from '../../images/upload.svg'
import TransnationalSvg from '../../images/transnational.svg'
import TrashSvg from '../../images/resource-detail/trash-icn.svg'
import ShareSvg from '../../images/resource-detail/share-icn.svg'
import EditSvg from '../../images/resource-detail/edit-icn.svg'
import { FilePdfOutlined, DeleteOutlined } from '@ant-design/icons'
import api from '../../utils/api'
import Link from 'next/link'
import { useRouter } from 'next/router'

const Workspace = ({ profile }) => {
  const router = useRouter()
  const [isFocal, setIsFocal] = useState(false)
  const [projects, setProjects] = useState([])

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
  return (
    <div className={styles.workspace}>
      <div className={styles.workspaceContentWrapper}>
        <div className={styles.workspaceContainer}>
          {profile &&
            profile?.emailVerified &&
            profile?.reviewStatus === 'SUBMITTED' && (
              <div className="pending-stripe">
                <Title level={4}>
                  Your account is pending reviewal. You can still explore the
                  platform.
                </Title>
              </div>
            )}
          {profile && !profile?.emailVerified && (
            <div className="pending-stripe">
              <Title level={4}>
                We sent you a confirmation email, Please take a moment and
                validate your address to confirm your account.
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
                  <p className="recommend-text">RECOMMENDED</p>
                  <Title level={2}>GPML Partnership​</Title>
                  <p className="registration-text">
                    Hello, It looks like your entity:{' '}
                    <b>{profile?.org?.name},</b> is not yet part <br /> of the
                    GPML partnership.
                    <br /> If you are the focal point, submit your application
                    below
                  </p>
                  <div className="join-box">
                    <div>
                      <p>
                        By completing this form I confirm that I have the
                        authorization to submit an application on behalf of this
                        Entity to become a member of the Global Partnership on
                        Marine Litter (GPML)​.
                      </p>
                    </div>
                    <div className="button-container">
                      <Button
                        className="join-button"
                        type="primary"
                        shape="round"
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
                          className="focal-point"
                          onClick={() => handleFocalPoint(profile?.org?.id)}
                        >
                          I AM NOT THE FOCAL POINT
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
                          Tap into a global network of like-minded members​
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
                        <Title level={2}>Network with other stakeholders</Title>
                      </div>
                    </div>
                  </Carousel>
                </div>
              </Col>
            </Row>
          )}
          {projects.length > 0 && (
            <div className="all-projects-starter">
              <Row>
                <h2>Your action plans</h2>
              </Row>
              <Row>
                <ul>
                  {projects?.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/projects/${item.id}`}
                        key={item.id}
                        legacyBehavior
                      >
                        <a className="all-projects">
                          <div className="content">
                            {/* <p>Action Plan</p> */}
                            <h2>{item.title}</h2>
                            <div className="transnational">
                              <TransnationalSvg />
                              <span>{item.geoCoverageType}</span>
                            </div>
                          </div>
                        </a>
                      </Link>
                      <div className="actions">
                        <ShareSvg />
                        <EditSvg
                          onClick={() => router.push(`/projects/${item.id}`)}
                        />
                        <TrashSvg onClick={() => handleDeleteBtn(item.id)} />
                      </div>
                    </li>
                  ))}
                </ul>
              </Row>
              <Row className="assessment-row">
                {/* <Col span={24}>
                <Link to="/projects/get-started">
                  <Button
                    className="assessment-button"
                    icon={<PlusCircleOutlined />}
                  >
                    New project Assessment
                  </Button>
                </Link>
              </Col> */}
              </Row>
            </div>
          )}
          <div className="plastic-strategies-list">
            <div className="container">
              <div className="caps-heading-m">workspace</div>
              <h2 className="h-xxl w-semi">Plastic Strategies</h2>
              <ul>
                <li>
                  <a href="#">
                    <div className="caps-heading-s">plastic strategy</div>
                    <h4 className="h-l">South Africa</h4>
                    <div className="compl">
                      <b>0</b>
                      <span>/6</span>
                    </div>
                    <ul>
                      <li>Project team</li>
                      <li>Consultation process</li>
                      <li>Legislation & policy</li>
                      <li>Nation Source Inventory</li>
                      <li>Data Analysis</li>
                      <li>National Plastic Strategy</li>
                    </ul>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="action-suggestions">
            <Row>
              <Col lg={8}>
                <DataCatalogueSvg />
                <h3>contribute to the datahub maps & dashboard</h3>
                <Button
                  type="ghost"
                  disabled={
                    profile &&
                    (!profile?.emailVerified ||
                      profile?.reviewStatus === 'SUBMITTED')
                  }
                  onClick={() => {
                    window.open(
                      'https://unep-gpml.eu.auth0.com/authorize?response_type=code&client_id=lmdxuDGdQjUsbLbMFpjDCulTP1w5Z4Gi&redirect_uri=https%3A//apps.unep.org/data-catalog/oauth2/callback&scope=openid+profile+email&state=eyJjYW1lX2Zyb20iOiAiL2Rhc2hib2FyZCJ9',
                      '_blank'
                    )
                  }}
                >
                  Upload your data
                </Button>
              </Col>
              <Col lg={8}>
                <UploadSvg />
                <h3>Share your knowledge</h3>
                <Button
                  type="ghost"
                  disabled={
                    profile &&
                    (!profile?.emailVerified ||
                      profile?.reviewStatus === 'SUBMITTED')
                  }
                  onClick={() => router.push('/flexible-forms')}
                >
                  Add content
                </Button>
              </Col>
              <Col lg={8}>
                <MatchSvg />
                <h3>Match with new opportunities</h3>
                <Button
                  type="ghost"
                  disabled={
                    profile &&
                    (!profile?.emailVerified ||
                      profile?.reviewStatus === 'SUBMITTED')
                  }
                  onClick={() => router.push('/connect/community')}
                >
                  Connect
                </Button>
              </Col>
            </Row>
          </div>
          <Row className="video-panel">
            <Col lg={24} sm={24}>
              <Title level={2}>Watch this video to get started</Title>
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

export default Workspace
