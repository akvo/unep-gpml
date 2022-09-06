import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Carousel,
  Avatar,
  Typography,
  Button,
  Modal,
  notification,
} from "antd";
const { Title } = Typography;
import "./styles.scss";
import { useHistory, Link } from "react-router-dom";
import { ReactComponent as DataCatalogueSvg } from "../../images/data-catalogue-icon.svg";
import { ReactComponent as MatchSvg } from "../../images/match.svg";
import { ReactComponent as UploadSvg } from "../../images/upload.svg";
import { ReactComponent as TransnationalSvg } from "../../images/transnational.svg";
import { ReactComponent as TrashSvg } from "../../images/resource-detail/trash-icn.svg";
import { ReactComponent as ShareSvg } from "../../images/resource-detail/share-icn.svg";
import { ReactComponent as EditSvg } from "../../images/resource-detail/edit-icn.svg";
import NetworkIcon from "../../images/auth/network.png";
import {
  FilePdfOutlined,
  PlusCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import api from "../../utils/api";
const Workspace = ({ profile }) => {
  const history = useHistory();
  const [isFocal, setIsFocal] = useState(false);
  const [projects, setProjects] = useState([]);

  const handleFocalPoint = (id) => {
    setIsFocal(true);
    localStorage.setItem("is_focal", JSON.stringify({ id: id, status: true }));
  };

  useEffect(() => {
    const item = localStorage.getItem("is_focal");
    if (item && profile) {
      setIsFocal(profile?.org?.id === JSON.parse(item).id ? true : false);
    }
  }, [profile]);

  useEffect(() => {
    if (profile && profile.reviewStatus === "APPROVED") fetchAllProjects();
  }, [profile]);

  const fetchAllProjects = () => {
    api
      .get("/project")
      .then((res) => {
        setProjects(res.data.projects);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleDeleteBtn = (id) => {
    Modal.error({
      className: "popup-delete",
      centered: true,
      closable: true,
      icon: <DeleteOutlined />,
      title: "Are you sure you want to delete this project?",
      content: "Please be aware this action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk() {
        return api
          .delete(`/project/${id}`)
          .then((res) => {
            notification.success({
              message: "Project deleted successfully",
            });
            fetchAllProjects();
          })
          .catch((err) => {
            console.error(err);
            notification.error({
              message: "Oops, something went wrong",
            });
          });
      },
    });
  };

  return (
    <div id="workspace">
      <div className="workspace-content-wrapper">
        <div className="workspace-container">
          {profile &&
            profile?.emailVerified &&
            profile?.reviewStatus === "SUBMITTED" && (
              <Row>
                <Col lg={24} sm={24}>
                  <div className="pending-stripe">
                    <Title level={4}>
                      Your account is pending reviewal. You can still explore
                      the platform.
                    </Title>
                  </div>
                </Col>
              </Row>
            )}
          {profile && !profile?.emailVerified && (
            <Row>
              <Col lg={24} sm={24}>
                <div className="pending-stripe">
                  <Title level={4}>
                    We sent you a confirmation email, Please take a moment and
                    validate your address to confirm your account.
                  </Title>
                </div>
              </Col>
            </Row>
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
                    Hello, It looks like your entity:{" "}
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
                          history.push({
                            pathname: "entity-signup",
                            state: { data: profile.org },
                          })
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
                          src={NetworkIcon}
                          style={{
                            borderRadius: "initial",
                            margin: "0 auto 40px auto",
                            display: "block",
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
                          src={NetworkIcon}
                          style={{
                            borderRadius: "initial",
                            margin: "0 auto 40px auto",
                            display: "block",
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
                    <li>
                      <Link
                        className="all-projects"
                        to={`/projects/${item.id}`}
                        key={item.id}
                      >
                        <div className="content">
                          {/* <p>Action Plan</p> */}
                          <h2>{item.title}</h2>
                          <div className="transnational">
                            <TransnationalSvg />
                            <span>{item.geoCoverageType}</span>
                          </div>
                        </div>
                      </Link>
                      <div className="actions">
                        <ShareSvg />
                        <EditSvg
                          onClick={() => history.push(`/projects/${item.id}`)}
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
          <div className="action-plan-starter">
            <Row>
              <h2>Action plan toolbox</h2>
            </Row>
            <Row>
              <Col lg={11}>
                <b>1</b>
                <div className="content">
                  <h3>Self-assessment</h3>
                  <p>
                    Identify in which stage you are in your action plan
                    development and implementation. Receive suggestions on how
                    to manage it in the platform.
                  </p>
                  <div>
                    <Link to="/projects/get-started">
                      <Button type="primary">Get Started</Button>
                    </Link>
                  </div>
                </div>
              </Col>
              <Col lg={13}>
                <div className="content">
                  <h3>MORE ABOUT ACTION PLANS</h3>
                  <ul>
                    <li>
                      <a href="#">How do I get started with my Action Plan?</a>
                    </li>
                    <li>
                      <a href="#">
                        How can you share and showcase your data and information
                        in the GPML Digital Platform?
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        What tools and resources are available in the GPML
                        Digital Platform?
                      </a>
                    </li>
                  </ul>
                </div>
              </Col>
            </Row>
            <Row>
              <Col lg={14}>
                <b>2</b>
                <div className="content">
                  <h3>workflow guidance</h3>
                  <p>
                    This one-page document outlines how the GPML Digital
                    Platform supports the development of national marine litter
                    and plastic pollution Action Plans. It includes the
                    different phases of the Action Plan creation workflow.
                  </p>
                  <div>
                    <a
                      href="https://wedocs.unep.org/bitstream/handle/20.500.11822/37900/Action%20Plan%20Guidance%20document%20.pdf?sequence=1&isAllowed=y"
                      target="_blank"
                    >
                      <Button type="ghost" icon={<FilePdfOutlined />}>
                        Read The Guide
                      </Button>
                    </a>
                  </div>
                </div>
              </Col>
            </Row>
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
                      profile?.reviewStatus === "SUBMITTED")
                  }
                  onClick={() => {
                    window.open(
                      "https://unep-gpml.eu.auth0.com/authorize?response_type=code&client_id=lmdxuDGdQjUsbLbMFpjDCulTP1w5Z4Gi&redirect_uri=https%3A//apps.unep.org/data-catalog/oauth2/callback&scope=openid+profile+email&state=eyJjYW1lX2Zyb20iOiAiL2Rhc2hib2FyZCJ9",
                      "_blank"
                    );
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
                      profile?.reviewStatus === "SUBMITTED")
                  }
                  onClick={() => history.push("/flexible-forms")}
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
                      profile?.reviewStatus === "SUBMITTED")
                  }
                  onClick={() => history.push("/connect/community")}
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
                allowfullscreen
              ></iframe>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
