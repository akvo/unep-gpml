/* eslint-disable react-hooks/exhaustive-deps */
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
  Modal,
  notification,
} from "antd";
import StickyBox from "react-sticky-box";
import AvatarImage from "../../images/stakeholder/Avatar.png";
import StakeholderRating from "../../images/stakeholder/stakeholder-rating.png";
import LocationImage from "../../images/location.svg";
import EntityImage from "../../images/entity.png";
import FollowImage from "../../images/stakeholder/follow.png";
import ResourceImage from "../../images/stakeholder/resource.png";
import EditImage from "../../images/stakeholder/edit.png";
import { ReactComponent as TrashIcon } from "../../images/resource-detail/trash-icn.svg";
import { ReactComponent as EditIcon } from "../../images/resource-detail/edit-icn.svg";
import { ReactComponent as FollowIcon } from "../../images/resource-detail/follow-icn.svg";
import {
  LinkedinOutlined,
  TwitterOutlined,
  FilePdfOutlined,
  MailOutlined,
  UserOutlined,
  ArrowRightOutlined,
  LoadingOutlined,
  EditOutlined,
  DeleteOutlined,
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
import { useAuth0 } from "@auth0/auth0-react";
import { TrimText } from "../../utils/string";

const getType = (type) => {
  let t = "";
  switch (type) {
    case "Action Plan":
      t = "action_plan";
      break;
    case "Event":
      t = "event";
      break;
    case "Initiative":
      t = "project";
      break;
    case "Policy":
      t = "policy";
      break;
    case "Financing Resource":
      t = "financing_resource";
      break;
    case "Technical Resource":
      t = "technical_resource";
      break;
    case "Technology":
      t = "technology";
      break;
  }
  return t;
};

const CardComponent = ({ title, style, children, getRef }) => {
  return (
    <div className="card-wrapper" style={style} ref={getRef}>
      <Card title={title} bordered={false} style={style}>
        {children}
      </Card>
    </div>
  );
};

const SharePanel = ({
  profile,
  isAuthenticated,
  data,
  params,
  relation,
  history,
  handleRelationChange,
}) => {
  const noEditTopics = new Set(["stakeholder"]);

  const canEdit = () =>
    isAuthenticated &&
    profile.reviewStatus === "APPROVED" &&
    (profile.role === "ADMIN" ||
      profile.id === params.createdBy ||
      data.owners.includes(profile.id)) &&
    (params.type !== "project" ||
      (params.type === "project" && params.id > 10000));

  const handleChangeRelation = (relationType) => {
    let association = relation ? [...relation.association] : [];
    if (!association.includes(relationType)) {
      association = [...association, relationType];
    } else {
      association = association.filter((it) => it !== relationType);
    }
    handleRelationChange({
      topicId: parseInt(params.id),
      association,
      topic: resourceTypeToTopicType(params.type),
    });
  };

  const canDelete = () =>
    isAuthenticated &&
    profile.reviewStatus === "APPROVED" &&
    profile.role === "ADMIN";

  const handleEditBtn = () => {
    UIStore.update((e) => {
      e.formEdit = {
        ...e.formEdit,
        signUp: {
          status: "edit",
          id: params.id,
        },
      };
      e.formStep = {
        ...e.formStep,
        stakeholder: 1,
      };
    });
    history.push({
      pathname: `/edit-stakeholder/${params.id}`,
      state: { formType: "stakeholder" },
    });
  };

  return (
    <div className="sticky-panel">
      <div
        className="sticky-panel-item"
        onClick={() => handleChangeRelation("interested in")}
      >
        <FollowIcon className="svg-icon" />
        {relation &&
        relation.association &&
        relation.association.indexOf("interested in") !== -1 ? (
          <h2>Unfollow</h2>
        ) : (
          <h2>Follow</h2>
        )}
      </div>

      {canEdit() && (
        <div className="sticky-panel-item" onClick={() => handleEditBtn()}>
          <EditIcon className="edit-icon" />
          <h2>Update</h2>
        </div>
      )}

      {canDelete() && (
        <div
          className="sticky-panel-item"
          onClick={() => {
            Modal.error({
              className: "popup-delete",
              centered: true,
              closable: true,
              icon: <DeleteOutlined />,
              title: "Are you sure you want to delete this entity?",
              content: "Please be aware this action cannot be undone.",
              okText: "Delete",
              okType: "danger",
              onOk() {
                return api
                  .delete(`/detail/${params.type}/${params.id}`)
                  .then((res) => {
                    notification.success({
                      message: "Entity deleted successfully",
                    });
                    history.push({
                      pathname: `/stakeholder-overview`,
                    });
                  })
                  .catch((err) => {
                    console.error(err);
                    notification.error({
                      message: "Oops, something went wrong",
                    });
                  });
              },
            });
          }}
        >
          <TrashIcon className="svg-icon" />
          <h2>Delete</h2>
        </div>
      )}
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
    icons,
  } = UIStore.useState((s) => ({
    profile: s.profile,
    countries: s.countries,
    languages: s.languages,
    regionOptions: s.regionOptions,
    meaOptions: s.meaOptions,
    transnationalOptions: s.transnationalOptions,
    icons: s.icons,
  }));
  const { isAuthenticated, loginWithPopup } = useAuth0();
  const history = useHistory();
  const [data, setData] = useState(null);
  const [relations, setRelations] = useState([]);
  const [ownedResources, setOwnedResources] = useState([]);
  const [bookedResources, setBookedResources] = useState([]);
  const [ownedResourcesCount, setOwnedResourcesCount] = useState(0);
  const [bookedResourcesCount, setBookedResourcesCount] = useState(0);
  const [ownedResourcesPage, setOwnedResourcesPage] = useState(0);
  const [bookedResourcesPage, setBookedResourcesPage] = useState(0);
  const [warningVisible, setWarningVisible] = useState(false);

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

  const getOwnedResources = useCallback(
    (n) => {
      setOwnedResourcesPage(n);
      const searchParms = new URLSearchParams();
      searchParms.set("limit", 3);
      searchParms.set("page", n);
      searchParms.set("association", "owner");
      const url = `/stakeholder/${params.id}/associated-topics?${String(
        searchParms
      )}`;
      api
        .get(url)
        .then((d) => {
          setOwnedResources(d.data.associatedTopics);
          setOwnedResourcesCount(d.data.count);
        })
        .catch((err) => {
          console.error(err);
          // redirectError(err, history);
        });
    },
    [params, history]
  );

  const getBookedResources = useCallback(
    (n) => {
      setBookedResourcesPage(n);
      const searchParms = new URLSearchParams();
      searchParms.set("limit", 3);
      searchParms.set("page", n);
      searchParms.set("association", "interested in");
      const url = `/stakeholder/${params.id}/associated-topics?${String(
        searchParms
      )}`;
      api
        .get(url)
        .then((d) => {
          setBookedResources(d.data.associatedTopics);
          setBookedResourcesCount(d.data.count);
        })
        .catch((err) => {
          console.error(err);
          // redirectError(err, history);
        });
    },
    [params, history]
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
          getOwnedResources(0);
          getBookedResources(0);
        })
        .catch((err) => {
          console.error(err);
          // redirectError(err, history);
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
  }, [isLoaded]);

  const handleRelationChange = (relation) => {
    if (!isAuthenticated) {
      loginWithPopup();
    }
    if (profile.reviewStatus === "SUBMITTED") {
      setWarningVisible(true);
    }
    if (isAuthenticated && profile.reviewStatus === undefined) {
      setStakeholderSignupModalVisible(true);
    }
    if (profile.reviewStatus === "APPROVED") {
      api.post("/favorite", relation).then((res) => {
        const relationIndex = relations.findIndex(
          (it) => it.topicId === relation.topicId
        );
        if (relationIndex !== -1) {
          setRelations([
            ...relations.slice(0, relationIndex),
            relation,
            ...relations.slice(relationIndex + 1),
          ]);
        } else {
          setRelations([...relations, relation]);
        }
      });
    }
  };

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
                    {data.affiliation && (
                      <div className="topbar-entity-image-holder">
                        <img
                          src={
                            data?.affiliation?.logo
                              ? data?.affiliation?.logo
                              : `https://ui-avatars.com/api/?background=0D8ABC&color=ffffff&size=480&name=${data?.affiliation?.name}`
                          }
                        />
                      </div>
                    )}
                  </div>
                  <div className="topbar-title-holder">
                    <h1>{data?.firstName + " " + data?.lastName}</h1>
                    {data?.jobTitle && (
                      <p className="role">
                        {data?.jobTitle} @ {data?.affiliation?.name}
                      </p>
                    )}
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
            <Col xs={6} lg={6} className="flex-col">
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
                    {data?.affiliation && (
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
                    )}
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
                  <SharePanel
                    profile={profile}
                    isAuthenticated={isAuthenticated}
                    data={data}
                    params={params}
                    relation={relation}
                    history={history}
                    handleRelationChange={handleRelationChange}
                  />
                </div>
              </div>
            </Col>
          </Row>
          <div>
            {ownedResources.length > 0 && (
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
                    {ownedResources.map((item) => (
                      <Col xs={6} lg={8}>
                        <div className="slider-card">
                          <div className="image-holder">
                            <img
                              style={{ width: 60 }}
                              src={
                                require(`../../images/${
                                  icons[
                                    getType(item.type)
                                      ? getType(item.type)
                                      : "action_plan"
                                  ]
                                }`).default
                              }
                            />
                          </div>
                          <div className="description-holder">
                            <div>
                              <h4>{item.type}</h4>
                              {item.title && (
                                <TrimText text={item.title} max={30} />
                              )}
                            </div>
                            {item.entityConnections &&
                              item.entityConnections.length > 0 && (
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
                                    {item.entityConnections.map((item) => (
                                      <Avatar
                                        src={
                                          item?.image
                                            ? item.image
                                            : `https://ui-avatars.com/api/?size=480&name=${item.entity}`
                                        }
                                      />
                                    ))}
                                  </Avatar.Group>
                                  <Link
                                    to={`/${getType(item.type)}/${item.id}`}
                                  >
                                    <div className="read-more">
                                      Read More <ArrowRightOutlined />
                                    </div>
                                  </Link>
                                </div>
                              )}
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                  <div className="pagination-wrapper">
                    <Pagination
                      defaultCurrent={1}
                      current={ownedResourcesPage + 1}
                      pageSize={3}
                      total={ownedResourcesCount || 0}
                      onChange={(n, size) => getOwnedResources(n - 1)}
                    />
                  </div>
                </div>
              </CardComponent>
            )}
          </div>
          <div>
            {bookedResources.length > 0 && (
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
                    {bookedResources.map((item) => (
                      <Col xs={6} lg={8}>
                        <div className="slider-card">
                          <div className="image-holder">
                            <img
                              style={{ width: 60 }}
                              src={
                                require(`../../images/${
                                  icons[
                                    getType(item.type)
                                      ? getType(item.type)
                                      : "action_plan"
                                  ]
                                }`).default
                              }
                            />
                          </div>
                          <div className="description-holder">
                            <div>
                              <h4>{item.type}</h4>
                              <h6>{item.title}</h6>
                            </div>
                            {item.entityConnections &&
                              item.entityConnections.length > 0 && (
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
                                    {item.entityConnections.map((item) => (
                                      <Avatar
                                        src={
                                          item?.image
                                            ? item.image
                                            : `https://ui-avatars.com/api/?size=480&name=${item.entity}`
                                        }
                                      />
                                    ))}
                                  </Avatar.Group>
                                  <Link
                                    to={`/${getType(item.type)}/${item.id}`}
                                  >
                                    <div className="read-more">
                                      Read More <ArrowRightOutlined />
                                    </div>
                                  </Link>
                                </div>
                              )}
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                  <div className="pagination-wrapper">
                    <Pagination
                      defaultCurrent={1}
                      current={bookedResourcesPage + 1}
                      pageSize={3}
                      total={bookedResourcesCount || 0}
                      onChange={(n, size) => getBookedResources(n - 1)}
                    />
                  </div>
                </div>
              </CardComponent>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakeholderDetail;
