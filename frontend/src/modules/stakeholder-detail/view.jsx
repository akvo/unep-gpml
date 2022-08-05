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
  Image,
} from "antd";
import StickyBox from "react-sticky-box";
import ReadMoreReact from "read-more-less-react";
import "read-more-less-react/dist/index.css";
import LocationImage from "../../images/location.svg";
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
import RelatedContent from "../../components/related-content/related-content";
import api from "../../utils/api";
import {
  topicNames,
  resourceTypeToTopicType,
  relationsByTopicType,
} from "../../utils/misc";
import uniqBy from "lodash/uniqBy";
import isEmpty from "lodash/isEmpty";
import { eventTrack, randomColor } from "../../utils/misc";

const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
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
  const canEdit = () =>
    isAuthenticated &&
    profile.reviewStatus === "APPROVED" &&
    (profile.role === "ADMIN" ||
      profile.id === Number(params.id) ||
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
    eventTrack("Stakeholder view", "Update", "Button");
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
        onClick={() => {
          handleChangeRelation("interested in");
          relation &&
          relation.association &&
          relation.association.indexOf("interested in") !== -1
            ? eventTrack("Stakeholder view", "Unfollow", "Button")
            : eventTrack("Stakeholder view", "Follow", "Button");
        }}
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
                eventTrack("Stakeholder view", "Delete", "Button");
                return api
                  .delete(`/detail/${params.type}/${params.id}`)
                  .then((res) => {
                    notification.success({
                      message: "Entity deleted successfully",
                    });
                    history.push({
                      pathname: `/connect/community`,
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
  setLoginVisible,
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
  }));
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

  const prevValue = usePrevious(data);

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
      searchParms.set("limit", 20);
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
      searchParms.set("limit", 20);
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
        api.get(`/favorite/${params.type}/${params.id}`).then((resp) => {
          setRelations(resp.data);
        });
      }, 100);
    }
    UIStore.update((e) => {
      e.disclaimer = null;
    });
    window.scrollTo({ top: 0 });
  }, [isLoaded]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoginVisible(true);
    } else {
      setLoginVisible(false);
    }
  }, [isAuthenticated]);

  const handleRelationChange = (relation) => {
    if (!isAuthenticated) {
      setLoginVisible(true);
    }
    if (profile.reviewStatus === "SUBMITTED") {
      setWarningVisible(true);
    }
    if (isAuthenticated && profile.reviewStatus === undefined) {
      setLoginVisible(true);
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
                              verticalAlign: "middle",
                              border: "4px solid #fff",
                              fontSize: "62px",
                              fontWeight: "bold",
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
                                  verticalAlign: "middle",
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
                                      verticalAlign: "middle",
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
                    <div className="bio">
                      <ReadMoreReact
                        text={data?.about ? data?.about : ""}
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
                              (item) => item.tagRelationCategory === "seeking"
                            ).length > 0 && (
                              <CardComponent>
                                <div className="ant-card-head-wrapper">
                                  <div className="ant-card-head-title">
                                    Seeking{" "}
                                    <span>
                                      (
                                      {
                                        data?.tags?.filter(
                                          (item) =>
                                            item.tagRelationCategory ===
                                            "seeking"
                                        ).length
                                      }{" "}
                                      Keywords)
                                    </span>
                                  </div>
                                </div>
                                <List>
                                  {data?.tags
                                    ?.filter(
                                      (item) =>
                                        item.tagRelationCategory === "seeking"
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
                              (item) => item.tagRelationCategory === "offering"
                            ).length > 0 && (
                              <CardComponent>
                                <div className="ant-card-head-wrapper">
                                  <div className="ant-card-head-title">
                                    Offering{" "}
                                    <span>
                                      (
                                      {
                                        data?.tags?.filter(
                                          (item) =>
                                            item.tagRelationCategory ===
                                            "offering"
                                        ).length
                                      }{" "}
                                      Keywords)
                                    </span>
                                  </div>
                                </div>
                                <List>
                                  {data?.tags
                                    ?.filter(
                                      (item) =>
                                        item.tagRelationCategory === "offering"
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
                    params={params}
                    relation={relation}
                    history={history}
                    handleRelationChange={handleRelationChange}
                  />
                </div>
              </div>
            </Col>
          </Row>
          <div className="owned-resources-wrapper">
            {ownedResources.length > 0 && (
              <RelatedContent
                data={[]}
                url={""}
                isShownCount={false}
                dataCount={ownedResourcesCount}
                relatedContent={ownedResources || []}
                title="Owned resources"
                isShownPagination={true}
                relatedContentPage={ownedResourcesPage}
                relatedContentCount={ownedResourcesCount}
                getRelatedContent={getOwnedResources}
              />
            )}
          </div>
          <div className="bookmarked-resources-wrapper">
            {bookedResources.length > 0 && (
              <RelatedContent
                data={[]}
                url={""}
                isShownCount={false}
                dataCount={bookedResourcesCount}
                relatedContent={bookedResources || []}
                title="Bookmarked resources "
                isShownPagination={true}
                relatedContentPage={bookedResourcesPage}
                relatedContentCount={bookedResourcesCount}
                getRelatedContent={getBookedResources}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakeholderDetail;
