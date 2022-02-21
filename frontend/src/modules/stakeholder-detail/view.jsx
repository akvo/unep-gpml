import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import "./styles.scss";
import { UIStore } from "../../store";
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
  LoadingOutlined,
} from "@ant-design/icons";
import { withRouter, useHistory, Link } from "react-router-dom";
import api from "../../utils/api";
import {
  topicNames,
  resourceTypeToTopicType,
  relationsByTopicType,
} from "../../utils/misc";
import uniqBy from "lodash/uniqBy";
import isEmpty from "lodash/isEmpty";
import { redirectError } from "../error/error-util";

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

const StakeholderDetail = ({
  match: { params },
  setStakeholderSignupModalVisible,
  setFilterMenu,
}) => {
  const {
    profile,
    countries,
    languages,
    regionOptions,
    meaOptions,
    transnationalOptions,
  } = UIStore.useState((s) => ({
    profile: s.profile,
    countries: s.countries,
    languages: s.languages,
    regionOptions: s.regionOptions,
    meaOptions: s.meaOptions,
    transnationalOptions: s.transnationalOptions,
  }));
  const history = useHistory();
  const [data, setData] = useState(null);
  const [relations, setRelations] = useState([]);

  const relation = relations.find(
    (it) =>
      it.topicId === parseInt(params.id) &&
      it.topic === resourceTypeToTopicType(params.type)
  );

  const isConnectStakeholders = ["organisation", "stakeholder"].includes(
    params?.type
  );
  const breadcrumbLink = isConnectStakeholders ? "stakeholders" : "browse";

  const isLoaded = useCallback(
    () =>
      Boolean(
        !isEmpty(countries) &&
          (isConnectStakeholders ? !isEmpty(profile) : true)
      ),
    [countries, profile, isConnectStakeholders]
  );

  useEffect(() => {
    isLoaded() &&
      !data &&
      params?.type &&
      params?.id &&
      api
        .get(`/detail/${params.type}/${params.id}`)
        .then((d) => {
          setData(d.data);
        })
        .catch((err) => {
          console.error(err);
          redirectError(err, history);
        });
    if (isLoaded() && profile.reviewStatus === "APPROVED") {
      setTimeout(() => {
        api.get("/favorite").then((resp) => {
          setRelations(resp.data);
        });
      }, 100);
    }
    UIStore.update((e) => {
      e.disclaimer = null;
    });
    window.scrollTo({ top: 0 });
  }, [params, profile, isLoaded, data, history]);

  if (!data) {
    return (
      <div className="details-view">
        <div className="loading">
          <LoadingOutlined spin />
          <i>Loading...</i>
        </div>
      </div>
    );
  }

  return (
    <div id="stakeholder-detail">
      <StickyBox style={{ zIndex: 10 }}>
        <div className="topbar-container">
          <div className="ui container">
            <Row>
              <Col xs={24} lg={24}>
                <div className="topbar-wrapper">
                  <div className="topbar-image-holder">
                    <img src={data?.picture} />
                    <div className="topbar-entity-image-holder">
                      <img
                        src={
                          data?.affiliation?.logo
                            ? data?.affiliation?.logo
                            : `https://ui-avatars.com/api/?background=random&size=480&name=${data?.affiliation?.name}`
                        }
                      />
                    </div>
                  </div>
                  <div className="topbar-title-holder">
                    <h1>{data?.firstName + " " + data?.lastName}</h1>
                    {/* <p>
                      <span>
                        <img src={StakeholderRating} />
                      </span>
                      Expert: Marine Litter
                    </p> */}
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
                        title={
                          countries.find((it) => it.id === data?.country).name
                        }
                      />
                    </List.Item>
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            src={
                              data?.affiliation?.logo
                                ? data?.affiliation?.logo
                                : `https://ui-avatars.com/api/?size=480&name=${data?.affiliation?.name}`
                            }
                          />
                        }
                        title={
                          <Link to={`/organisation/${data?.affiliation?.id}`}>
                            {data?.affiliation?.name}
                          </Link>
                        }
                        description={"Entity"}
                      />
                    </List.Item>
                  </List>
                </div>
              </CardComponent>
              <CardComponent title="Contact info">
                <div className="list social-list">
                  <List itemLayout="horizontal">
                    {data?.linkedIn && (
                      <List.Item className="location">
                        <List.Item.Meta
                          avatar={<LinkedinOutlined />}
                          title={
                            <a
                              href={
                                data?.linkedIn.includes("https://")
                                  ? data?.linkedIn
                                  : "https://" + data?.linkedIn
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
                                data?.twitter.includes("https://")
                                  ? data?.twitter
                                  : "https://" + data?.twitter
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
                    title={"Bio"}
                    style={{
                      height: "100%",
                      boxShadow: "none",
                      borderRadius: "none",
                      width: "100%",
                    }}
                  >
                    <p>{data?.about}</p>
                    <div className="exta-info">
                      <Row gutter={[16, 16]}>
                        <Col xs={12} lg={12}>
                          {data?.seeking && (
                            <CardComponent>
                              <div class="ant-card-head-wrapper">
                                <div class="ant-card-head-title">
                                  Seeking{" "}
                                  <span>
                                    ({data?.seeking.split(",").length} Keywords)
                                  </span>
                                </div>
                              </div>
                              <List>
                                {data?.seeking.split(",").map((str) => (
                                  <List.Item>
                                    <Typography.Text>{str}</Typography.Text>
                                  </List.Item>
                                ))}
                              </List>
                            </CardComponent>
                          )}
                        </Col>
                        <Col xs={12} lg={12}>
                          {data?.offering && (
                            <CardComponent>
                              <div class="ant-card-head-wrapper">
                                <div class="ant-card-head-title">
                                  Offering{" "}
                                  <span>
                                    ({data?.offering.split(",").length}{" "}
                                    Keywords)
                                  </span>
                                </div>
                              </div>
                              <List>
                                {data?.offering.split(",").map((str) => (
                                  <List.Item>
                                    <Typography.Text>{str}</Typography.Text>
                                  </List.Item>
                                ))}
                              </List>
                            </CardComponent>
                          )}
                        </Col>
                      </Row>
                    </div>
                  </CardComponent>
                  <SharePanel />
                </div>
              </div>
            </Col>
          </Row>
          {/* <div>
            <CardComponent
              title={"Owned resources"}
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
          </div> */}
          {/* <div>
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
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default StakeholderDetail;
