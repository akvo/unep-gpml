import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import "./styles.scss";
import {
  Row,
  Col,
  Tooltip,
  Typography,
  Avatar,
  List,
  Card,
  Pagination,
} from "antd";
import StickyBox from "react-sticky-box";
import AvatarImage from "../../images/stakeholder/Avatar.png";
import StakeholderRating from "../../images/stakeholder/stakeholder-rating.png";
import LocationImage from "../../images/location.svg";
import EntityImage from "../../images/entity.png";
import FollowImage from "../../images/stakeholder/follow.png";
import ResourceImage from "../../images/stakeholder/resource.png";
import {
  LinkedinOutlined,
  TwitterOutlined,
  FilePdfOutlined,
  MailOutlined,
  UserOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

const CardComponent = ({ title, style, children, getRef }) => {
  return (
    <div className="card-wrapper" style={style} ref={getRef}>
      <Card title={title} bordered={false} style={style}>
        {children}
      </Card>
    </div>
  );
};

const SharePanel = () => {
  return (
    <div className="sticky-panel">
      <div className="sticky-panel-item">
        <a href={`#`} target="_blank">
          <Avatar src={FollowImage} />
          <h2>Follow</h2>
        </a>
      </div>
    </div>
  );
};

const StakeholderDetail = () => {
  return (
    <div id="stakeholder-detail">
      <StickyBox style={{ zIndex: 10 }}>
        <div className="topbar-container">
          <div className="ui container">
            <Row>
              <Col xs={24} lg={24}>
                <div className="topbar-wrapper">
                  <div className="topbar-image-holder">
                    <img src={AvatarImage} />
                  </div>
                  <div className="topbar-title-holder">
                    <h1>Jean Edouard Morizot</h1>
                    <p>
                      <span>
                        <img src={StakeholderRating} />
                      </span>
                      Expert: Marine Litter
                    </p>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </StickyBox>
      <div className="info-container">
        <div className="ui container">
          <Row gutter={[16, 16]}>
            <Col xs={6} lg={6}>
              <CardComponent title="Basic info">
                <div className="list ">
                  <List itemLayout="horizontal">
                    <List.Item className="location">
                      <List.Item.Meta
                        avatar={<Avatar src={LocationImage} />}
                        title="France"
                      />
                    </List.Item>
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={EntityImage} />}
                        title={"Helcom"}
                        description={"Entity"}
                      />
                    </List.Item>
                  </List>
                </div>
              </CardComponent>
              <CardComponent title="Contact info">
                <div className="list social-list">
                  <List itemLayout="horizontal">
                    <List.Item className="location">
                      <List.Item.Meta
                        avatar={<LinkedinOutlined />}
                        title="www.linkedin.com/jemorizot"
                      />
                    </List.Item>
                    <List.Item className="location">
                      <List.Item.Meta
                        avatar={<TwitterOutlined />}
                        title="www.twitter.com/jemorizot"
                      />
                    </List.Item>
                    <List.Item className="location">
                      <List.Item.Meta
                        avatar={<FilePdfOutlined />}
                        title="Link to CV"
                      />
                    </List.Item>
                    <List.Item className="location">
                      <List.Item.Meta
                        avatar={<MailOutlined />}
                        title="jemoreizot@email.com"
                      />
                    </List.Item>
                  </List>
                </div>
              </CardComponent>
            </Col>
            <Col xs={18} lg={18}>
              <div className="description-container">
                <div className="description-wrapper">
                  <CardComponent
                    style={{
                      height: "100%",
                      boxShadow: "none",
                      borderRadius: "none",
                    }}
                  >
                    <p>
                      Fictum, deserunt mollit anim laborum astutumque! Quid
                      securi etiam tamquam eu fugiat nulla pariatur.
                      Salutantibus vitae elit libero, a pharetra augue.
                      Ambitioni dedisse scripsisse iudicaretur. Plura mihi bona
                      sunt, inclinet, amari petere vellent. Tu quoque, Brute,
                      fili mi, nihil timor populi, nihil! Morbi fringilla
                      convallis sapien, id pulvinar odio volutpat. Nihilne te
                      nocturnum praesidium Palati, nihil urbis vigiliae. Nec
                      dubitamus multa iter quae et nos invenerat. Curabitur
                      blandit tempus ardua ridiculus sed magna.
                    </p>
                    <div className="exta-info">
                      <Row gutter={[16, 16]}>
                        <Col xs={12} lg={12}>
                          <CardComponent title={"Seeking"}>
                            <List>
                              <List.Item>
                                <Typography.Text>
                                  environmental scientists
                                </Typography.Text>
                              </List.Item>
                              <List.Item>
                                <Typography.Text>funds</Typography.Text>
                              </List.Item>
                              <List.Item>
                                <Typography.Text>legal expert</Typography.Text>
                              </List.Item>
                              <List.Item>
                                <Typography.Text>
                                  marine biologists
                                </Typography.Text>
                              </List.Item>
                              <List.Item>
                                <Typography.Text>
                                  marine litter experts
                                </Typography.Text>
                              </List.Item>
                              <List.Item>
                                <Typography.Text>
                                  plastics expert
                                </Typography.Text>
                              </List.Item>
                              <List.Item>
                                <Typography.Text>recyclers</Typography.Text>
                              </List.Item>
                            </List>
                          </CardComponent>
                        </Col>
                        <Col xs={12} lg={12}>
                          <CardComponent title={"Offering"}>
                            <div className="litter-button">
                              <p>
                                <span>
                                  <img src={StakeholderRating} />
                                </span>
                                Expert: Marine Litter
                              </p>
                            </div>
                            <div className="knowledge-button">
                              <p>Knowledge Management</p>
                            </div>
                          </CardComponent>
                        </Col>
                      </Row>
                    </div>
                  </CardComponent>
                  <SharePanel />
                </div>
              </div>
            </Col>
          </Row>
          <div>
            <CardComponent
              title={"Own resources"}
              style={{
                height: "100%",
                boxShadow: "none",
                borderRadius: "none",
              }}
            >
              <div style={{ padding: "0 10px" }}>
                <Row gutter={[16, 16]}>
                  <Col xs={6} lg={8}>
                    <div className="slider-card">
                      <div className="image-holder">
                        <img src={ResourceImage} />
                      </div>
                      <div className="description-holder">
                        <div>
                          <h4>TECHNICAL RESOURCE</h4>
                          <h6>
                            Legal limits on single-use plastics and
                            microplastics
                          </h6>
                          <p>
                            Donec sed odio operae, eu vulputate felis rhoncus.
                          </p>
                        </div>
                        <div className="connection-wrapper">
                          <Avatar.Group
                            maxCount={2}
                            maxPopoverTrigger="click"
                            size="large"
                            maxStyle={{
                              color: "#f56a00",
                              backgroundColor: "#fde3cf",
                              cursor: "pointer",
                            }}
                          >
                            <Avatar src={AvatarImage} />
                            <Avatar src={AvatarImage} />
                            <Tooltip title="Ant User" placement="top">
                              <Avatar
                                style={{ backgroundColor: "#87d068" }}
                                icon={<UserOutlined />}
                              />
                            </Tooltip>
                          </Avatar.Group>
                          <div className="read-more">
                            Read More <ArrowRightOutlined />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} lg={8}>
                    <div className="slider-card">
                      <div className="image-holder">
                        <img src={ResourceImage} />
                      </div>
                      <div className="description-holder">
                        <div>
                          <h4>TECHNICAL RESOURCE</h4>
                          <h6>
                            Legal limits on single-use plastics and
                            microplastics
                          </h6>
                          <p>
                            Donec sed odio operae, eu vulputate felis rhoncus.
                          </p>
                        </div>
                        <div className="connection-wrapper">
                          <Avatar.Group
                            maxCount={2}
                            maxPopoverTrigger="click"
                            size="large"
                            maxStyle={{
                              color: "#f56a00",
                              backgroundColor: "#fde3cf",
                              cursor: "pointer",
                            }}
                          >
                            <Avatar src={AvatarImage} />
                            <Avatar src={AvatarImage} />
                            <Tooltip title="Ant User" placement="top">
                              <Avatar
                                style={{ backgroundColor: "#87d068" }}
                                icon={<UserOutlined />}
                              />
                            </Tooltip>
                          </Avatar.Group>
                          <div className="read-more">
                            Read More <ArrowRightOutlined />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} lg={8}>
                    <div className="slider-card">
                      <div className="image-holder">
                        <img src={ResourceImage} />
                      </div>
                      <div className="description-holder">
                        <div>
                          <h4>TECHNICAL RESOURCE</h4>
                          <h6>
                            Legal limits on single-use plastics and
                            microplastics
                          </h6>
                          <p>
                            Donec sed odio operae, eu vulputate felis rhoncus.
                          </p>
                        </div>
                        <div className="connection-wrapper">
                          <Avatar.Group
                            maxCount={2}
                            maxPopoverTrigger="click"
                            size="large"
                            maxStyle={{
                              color: "#f56a00",
                              backgroundColor: "#fde3cf",
                              cursor: "pointer",
                            }}
                          >
                            <Avatar src={AvatarImage} />
                            <Avatar src={AvatarImage} />
                            <Tooltip title="Ant User" placement="top">
                              <Avatar
                                style={{ backgroundColor: "#87d068" }}
                                icon={<UserOutlined />}
                              />
                            </Tooltip>
                          </Avatar.Group>
                          <div className="read-more">
                            Read More <ArrowRightOutlined />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
                <div className="pagination-wrapper">
                  <Pagination
                    defaultCurrent={1}
                    onChange={() => console.log("s")}
                    current={1}
                    pageSize={10}
                    total={20}
                  />
                </div>
              </div>
            </CardComponent>
          </div>
          <div>
            <CardComponent
              title={"Bookmarked resources"}
              style={{
                height: "100%",
                boxShadow: "none",
                borderRadius: "none",
              }}
            >
              <div style={{ padding: "0 10px" }}>
                <Row gutter={[16, 16]}>
                  <Col xs={6} lg={8}>
                    <div className="slider-card">
                      <div className="image-holder">
                        <img src={ResourceImage} />
                      </div>
                      <div className="description-holder">
                        <div>
                          <h4>TECHNICAL RESOURCE</h4>
                          <h6>
                            Legal limits on single-use plastics and
                            microplastics
                          </h6>
                          <p>
                            Donec sed odio operae, eu vulputate felis rhoncus.
                          </p>
                        </div>
                        <div className="connection-wrapper">
                          <Avatar.Group
                            maxCount={2}
                            maxPopoverTrigger="click"
                            size="large"
                            maxStyle={{
                              color: "#f56a00",
                              backgroundColor: "#fde3cf",
                              cursor: "pointer",
                            }}
                          >
                            <Avatar src={AvatarImage} />
                            <Avatar src={AvatarImage} />
                            <Tooltip title="Ant User" placement="top">
                              <Avatar
                                style={{ backgroundColor: "#87d068" }}
                                icon={<UserOutlined />}
                              />
                            </Tooltip>
                          </Avatar.Group>
                          <div className="read-more">
                            Read More <ArrowRightOutlined />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} lg={8}>
                    <div className="slider-card">
                      <div className="image-holder">
                        <img src={ResourceImage} />
                      </div>
                      <div className="description-holder">
                        <div>
                          <h4>TECHNICAL RESOURCE</h4>
                          <h6>
                            Legal limits on single-use plastics and
                            microplastics
                          </h6>
                          <p>
                            Donec sed odio operae, eu vulputate felis rhoncus.
                          </p>
                        </div>
                        <div className="connection-wrapper">
                          <Avatar.Group
                            maxCount={2}
                            maxPopoverTrigger="click"
                            size="large"
                            maxStyle={{
                              color: "#f56a00",
                              backgroundColor: "#fde3cf",
                              cursor: "pointer",
                            }}
                          >
                            <Avatar src={AvatarImage} />
                            <Avatar src={AvatarImage} />
                            <Tooltip title="Ant User" placement="top">
                              <Avatar
                                style={{ backgroundColor: "#87d068" }}
                                icon={<UserOutlined />}
                              />
                            </Tooltip>
                          </Avatar.Group>
                          <div className="read-more">
                            Read More <ArrowRightOutlined />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} lg={8}>
                    <div className="slider-card">
                      <div className="image-holder">
                        <img src={ResourceImage} />
                      </div>
                      <div className="description-holder">
                        <div>
                          <h4>TECHNICAL RESOURCE</h4>
                          <h6>
                            Legal limits on single-use plastics and
                            microplastics
                          </h6>
                          <p>
                            Donec sed odio operae, eu vulputate felis rhoncus.
                          </p>
                        </div>
                        <div className="connection-wrapper">
                          <Avatar.Group
                            maxCount={2}
                            maxPopoverTrigger="click"
                            size="large"
                            maxStyle={{
                              color: "#f56a00",
                              backgroundColor: "#fde3cf",
                              cursor: "pointer",
                            }}
                          >
                            <Avatar src={AvatarImage} />
                            <Avatar src={AvatarImage} />
                            <Tooltip title="Ant User" placement="top">
                              <Avatar
                                style={{ backgroundColor: "#87d068" }}
                                icon={<UserOutlined />}
                              />
                            </Tooltip>
                          </Avatar.Group>
                          <div className="read-more">
                            Read More <ArrowRightOutlined />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
                <div className="pagination-wrapper">
                  <Pagination
                    defaultCurrent={1}
                    onChange={() => console.log("s")}
                    current={1}
                    pageSize={10}
                    total={20}
                  />
                </div>
              </div>
            </CardComponent>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakeholderDetail;
