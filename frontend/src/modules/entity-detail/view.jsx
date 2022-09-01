/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback } from "react";
import "./styles.scss";
import { UIStore } from "../../store";
import {
  Row,
  Col,
  Avatar,
  List,
  Card,
  Pagination,
  Modal,
  notification,
} from "antd";
import StickyBox from "react-sticky-box";

import LocationImage from "../../images/location.svg";
import TransnationalImage from "../../images/transnational.svg";

import { ReactComponent as TrashIcon } from "../../images/resource-detail/trash-icn.svg";
import { ReactComponent as EditIcon } from "../../images/resource-detail/edit-icn.svg";
import { ReactComponent as FollowIcon } from "../../images/resource-detail/follow-icn.svg";
import {
  LinkOutlined,
  LoadingOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import api from "../../utils/api";
import { resourceTypeToTopicType } from "../../utils/misc";

import isEmpty from "lodash/isEmpty";
import { redirectError } from "../error/error-util";
import { useAuth0 } from "@auth0/auth0-react";
import { randomColor, eventTrack } from "../../utils/misc";
import ResourceCards from "../../components/resource-cards/resource-cards";

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
  handleRelationChange,
  handleEditBtn,
  history,
}) => {
  const noEditTopics = new Set(["stakeholder"]);

  const canEdit = () =>
    isAuthenticated &&
    profile.reviewStatus === "APPROVED" &&
    (profile.role === "ADMIN" ||
      profile.id === data.createdBy ||
      data.owners.includes(profile.id)) &&
    ((params.type !== "initiative" && !noEditTopics.has(params.type)) ||
      (params.type === "initiative" && params.id > 10000));

  const canDelete = () =>
    isAuthenticated &&
    profile.reviewStatus === "APPROVED" &&
    profile.role === "ADMIN";

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

  return (
    <div className="sticky-panel">
      <div
        className="sticky-panel-item"
        onClick={() => {
          handleChangeRelation("interested in");
          relation &&
          relation.association &&
          relation.association.indexOf("interested in") !== -1
            ? eventTrack("Entity view", "Unfollow", "Button")
            : eventTrack("Entity view", "Follow", "Button");
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
                eventTrack("Entity view", "Delete", "Button");
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
  }));
  const { loginWithPopup } = useAuth0();
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
    () => Boolean(!isEmpty(countries) && (isConnectStakeholders ? true : true)),
    [countries, profile, isConnectStakeholders]
  );

  const getOwnedResources = useCallback(
    (n) => {
      setOwnedResourcesPage(n);
      const searchParms = new URLSearchParams();
      searchParms.set("limit", 20);
      searchParms.set("page", n);
      const url = `/organisation/${params.id}/content?${String(searchParms)}`;
      api
        .get(url)
        .then((d) => {
          setOwnedResources(d.data.results);
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
      const url = `/organisation/${params.id}/members?${String(searchParms)}`;
      api
        .get(url)
        .then((d) => {
          setBookedResources(d.data.members);
          setBookedResourcesCount(d.data.count);
        })
        .catch((err) => {
          console.error(err);
          // redirectError(err, history);
        });
    },
    [params, history]
  );

  const handleEditBtn = () => {
    eventTrack("Entity view", "Edit", "Button");
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
        entity: 1,
      };
    });
    history.push({
      pathname: `/edit-entity/${params.id}`,
      state: { formType: "entity" },
    });
  };

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
          redirectError(err, history);
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
    <div id="entity-detail">
      <StickyBox style={{ zIndex: 10 }}>
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
                              fontSize: "62px",
                              fontWeight: "bold",
                              verticalAlign: "middle",
                              border: "4px solid #fff",
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
                    {data?.geoCoverageType && (
                      <List.Item className="location">
                        <List.Item.Meta
                          avatar={<Avatar src={TransnationalImage} />}
                          title={
                            <>
                              <span style={{ textTransform: "capitalize" }}>
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
                                data?.url?.includes("https://") ||
                                data?.url?.includes("http://")
                                  ? data?.url
                                  : "https://" + data?.url
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
                      height: "100%",
                      boxShadow: "none",
                      borderRadius: "none",
                      width: "100%",
                    }}
                  >
                    <p>{data?.program}</p>

                    {data?.expertise && Array.isArray(data?.expertise) && (
                      <div className="exta-info">
                        <div className="exta-info-head-title">
                          Area of expertise
                        </div>
                        {/* <List>
                        {["Plastic", "Pollution"].map((str) => (
                          <List.Item>
                            <Typography.Text>{str}</Typography.Text>
                          </List.Item>
                        ))}
                      </List> */}
                      </div>
                    )}
                  </CardComponent>
                  <SharePanel
                    profile={profile}
                    isAuthenticated={isAuthenticated}
                    data={data}
                    params={params}
                    relation={relation}
                    handleEditBtn={handleEditBtn}
                    history={history}
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
                      Content on the platform
                    </div>
                    <div className="related-content-count">
                      Total {ownedResourcesCount}
                    </div>
                  </div>
                }
              >
                <ResourceCards
                  items={ownedResources}
                  showMoreCardAfter={20}
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
                  height: "100%",
                  boxShadow: "none",
                  borderRadius: "none",
                }}
              >
                <div style={{ padding: "0 10px" }} className="individuals">
                  <Row gutter={[16, 16]} style={{ width: "100%" }}>
                    {bookedResources.map((item) => (
                      <Col xs={6} lg={8} key={item.id}>
                        <div
                          className="slider-card"
                          onClick={() => {
                            history.push({
                              pathname: `/stakeholder/${item.id}`,
                            });
                          }}
                        >
                          <Row style={{ width: "100%" }}>
                            <Col className="individual-details" xs={6} lg={14}>
                              <div className="profile-image">
                                <Avatar
                                  style={{ border: "none" }}
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
                                          verticalAlign: "middle",
                                          fontSize: "62px",
                                          fontWeight: "bold",
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
                                <h3>{item.name}</h3>
                                {/* <p>
                                  <span>
                                    <img src={LocationImage} />
                                  </span>
                                  Location
                                </p> */}
                                <h5>{data?.name}</h5>
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
  );
};

export default StakeholderDetail;
