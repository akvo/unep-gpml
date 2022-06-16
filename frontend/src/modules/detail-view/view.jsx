import React, { useState, useEffect, useCallback, useRef } from "react";
import "./style.scss";
import {
  Button,
  Row,
  Col,
  List,
  Avatar,
  Input,
  Tag,
  Form,
  Tooltip,
  Comment,
  Popover,
  Modal,
  notification,
} from "antd";
const { TextArea } = Input;
import {
  EyeFilled,
  HeartTwoTone,
  MailTwoTone,
  MessageOutlined,
  PlayCircleTwoTone,
  SendOutlined,
  HeartFilled,
  InfoCircleOutlined,
  LoadingOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import arrayMutators from "final-form-arrays";
import { Form as FinalForm, FormSpy, Field } from "react-final-form";
import { FieldsFromSchema } from "../../utils/form-utils";
import moment from "moment";
import { isEmpty } from "lodash";
import api from "../../utils/api";
import { UIStore } from "../../store";
import { titleCase } from "../../utils/string";
import { Link } from "react-router-dom";
import { topicNames, resourceTypeToTopicType } from "../../utils/misc";
import { useAuth0 } from "@auth0/auth0-react";
import { useHistory } from "react-router-dom";
import { redirectError } from "../error/error-util";
import { multicountryGroups } from "../knowledge-library/multicountry";
import { ReactComponent as LocationImage } from "../../images/location.svg";
import { ReactComponent as TransnationalImage } from "../../images/transnational.svg";
import { ReactComponent as CityImage } from "../../images/city-icn.svg";
import { ReactComponent as TagsImage } from "../../images/tags.svg";
import RelatedContent from "../../components/related-content/related-content";

const DetailView = ({
  params,
  setStakeholderSignupModalVisible,
  setFilterMenu,
}) => {
  const relatedContent = useRef(null);
  const [showLess, setShowLess] = useState(true);
  const [sending, setSending] = useState(false);

  const {
    profile,
    countries,
    languages,
    regionOptions,
    meaOptions,
    transnationalOptions,
    icons,
    placeholder,
  } = UIStore.useState((s) => ({
    profile: s.profile,
    countries: s.countries,
    languages: s.languages,
    regionOptions: s.regionOptions,
    meaOptions: s.meaOptions,
    transnationalOptions: s.transnationalOptions,
    icons: s.icons,
    placeholder: s.placeholder,
  }));

  const history = useHistory();
  const [data, setData] = useState(null);
  const [relations, setRelations] = useState([]);
  const [comments, setComments] = useState([]);
  const { isAuthenticated, loginWithPopup } = useAuth0();
  const [warningVisible, setWarningVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState("");
  const [editComment, setEditComment] = useState("");
  const formRef = useRef();
  const defaultFormSchema = {
    description: { control: "textarea" },
  };

  const [formSchema, setFormSchema] = useState(defaultFormSchema);

  const [comment, setComment] = useState("");
  const [newComment, setNewComment] = useState("");
  const [reply, setReply] = useState("");

  const relation = relations.find(
    (it) =>
      it.topicId === parseInt(params.id) &&
      it.topic === resourceTypeToTopicType(params.type)
  );

  const isConnectStakeholders = ["organisation", "stakeholder"].includes(
    params?.type
  );

  const description = data?.description ? data?.description : data?.summary;

  const isLoaded = useCallback(
    () =>
      Boolean(
        !isEmpty(countries) &&
          (isConnectStakeholders ? !isEmpty(profile) : true)
      ),
    [countries, profile, isConnectStakeholders]
  );

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

  const getComment = async (id, type) => {
    let res = await api.get(
      `/comment?resource_id=${id}&resource_type=${
        type === "project" ? "initiative" : type
      }`
    );

    if (res && res?.data) {
      setComments(res?.data?.comments);
    }
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
          getComment(params.id, params.type);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, isLoaded]);

  const handleEditBtn = () => {
    let form = null;
    let type = null;
    let link = null;
    switch (params.type) {
      case "project":
        form = "initiative";
        link = "edit-initiative";
        type = "initiative";
        break;
      case "action_plan":
        form = "actionPlan";
        link = "edit-action-plan";
        type = "action_plan";
        break;
      case "policy":
        form = "policy";
        link = "edit-policy";
        type = "policy";
        break;
      case "technical_resource":
        form = "technicalResource";
        link = "edit-technical-resource";
        type = "technical_resource";
        break;
      case "financing_resource":
        form = "financingResource";
        link = "edit-financing-resource";
        type = "financing_resource";
        break;
      case "technology":
        form = "technology";
        link = "edit-technology";
        type = "technology";
        break;
      case "event":
        form = "event";
        link = "edit-event";
        type = "event";
        break;
      default:
        form = "entity";
        link = "edit-entity";
        type = "initiative";
        break;
    }
    UIStore.update((e) => {
      e.formEdit = {
        ...e.formEdit,
        flexible: {
          status: "edit",
          id: params.id,
        },
      };
      e.formStep = {
        ...e.formStep,
        flexible: 1,
      };
    });

    history.push({
      pathname: `/${link}/${params.id}`,
      state: { type: type },
    });
  };

  const renderGeoCoverageCountryGroups = (
    data,
    countries,
    transnationalOptions
  ) => {
    let dataCountries = null;
    const subItems = [].concat(
      ...multicountryGroups.map(({ item }) => item || [])
    );
    const newArray = [...new Set([...subItems, ...countries])];
    dataCountries = data["geoCoverageValues"]?.map((x) => {
      return {
        name: newArray.find((it) => it.id === x)?.name,
        countries: newArray.find((it) => it.id === x)?.countries
          ? newArray.find((it) => it.id === x)?.countries
          : [],
      };
    });
    return (
      <>
        {dataCountries.map((item, index) => (
          <span key={index} id={index}>
            {(index ? ", " : " ") + item.name}{" "}
            {item.countries && item.countries.length > 0 && (
              <Popover
                overlayClassName="popover-multi-country"
                title={""}
                content={
                  <ul className="list-country-group">
                    {item.countries.map((name) => (
                      <li key={name?.id} id={name?.id}>
                        {name?.name}
                      </li>
                    ))}
                  </ul>
                }
                placement="right"
                arrowPointAtCenter
              >
                <InfoCircleOutlined />
              </Popover>
            )}
          </span>
        ))}
      </>
    );
  };
  const renderCountries = (data, countries, transnationalOptions) => {
    let dataCountries = null;
    const newArray = [...new Set([...countries])];
    dataCountries = data["geoCoverageCountries"]
      ?.map((x) => newArray.find((it) => it.id === x)?.name)
      .join(", ");
    return dataCountries;
  };

  const handleChangeRelation = (relationType) => {
    let association = relation ? [...relation.association] : [];
    if (!association.includes(relationType)) {
      association = [relationType];
    } else {
      association = association.filter((it) => it !== relationType);
    }

    handleRelationChange({
      topicId: parseInt(params.id),
      association,
      topic: resourceTypeToTopicType(params.type),
    });
  };
  const onSubmit = (val) => {
    const data = {
      author_id: profile.id,
      resource_id: parseInt(params.id),
      resource_type: params?.type,
      ...(val.parent_id && { parent_id: val.parent_id }),
      title: val.title,
      content: val.description,
    };

    setSending(true);
    api
      .post("/comment", data)
      .then((data) => {
        setSending(false);
        getComment(params.id, params.type);
      })
      .catch(() => {
        setSending(false);
        // notification.error({ message: "An error occured" });
      })
      .finally(() => {
        setSending(false);
      });
    setNewComment("");
  };

  const onReply = (id, title) => {
    const val = {
      parent_id: id,
      title: title,
      description: comment,
    };
    onSubmit(val);
  };

  const onEditComment = (id, title) => {
    const val = {
      id: id,
      title: title,
      content: comment,
    };
    api
      .put("/comment", val)
      .then((data) => {
        getComment(params.id, params.type);
      })
      .catch(() => {})
      .finally(() => {});
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

  const CommentList = ({
    item,
    showReplyBox,
    setShowReplyBox,
    onReply,
    setComment,
    profile,
    getComment,
    params,
    editComment,
    setEditComment,
    onEditComment,
  }) => {
    return (
      <Comment
        className="comment-list"
        key={item?.id}
        actions={
          profile &&
          profile.reviewStatus === "APPROVED" && [
            <>
              {profile && profile.reviewStatus === "APPROVED" && (
                <>
                  <span
                    key="comment-nested-reply-to"
                    onClick={() =>
                      item?.id === showReplyBox
                        ? setShowReplyBox("")
                        : setShowReplyBox(item?.id)
                    }
                  >
                    Reply to
                  </span>
                  {profile?.id === item?.authorId && (
                    <span
                      key="comment-nested-edit"
                      onClick={() =>
                        item?.id === editComment
                          ? setEditComment("")
                          : setEditComment(item?.id)
                      }
                    >
                      Edit
                    </span>
                  )}
                  {profile?.role === "ADMIN" && (
                    <span
                      key="comment-nested-delete"
                      onClick={() => {
                        Modal.error({
                          className: "popup-delete",
                          centered: true,
                          closable: true,
                          icon: <DeleteOutlined />,
                          title:
                            "Are you sure you want to delete this comment?",
                          content:
                            "Please be aware this action cannot be undone.",
                          okText: "Delete",
                          okType: "danger",
                          async onOk() {
                            try {
                              const res = await api.delete(
                                `/comment/${item?.id}`
                              );
                              notification.success({
                                message: "Comment deleted successfully",
                              });

                              getComment(params?.id, params?.type);
                            } catch (err) {
                              console.error(err);
                              notification.error({
                                message: "Oops, something went wrong",
                              });
                            }
                          },
                        });
                      }}
                    >
                      Delete
                    </span>
                  )}
                </>
              )}
              {(item?.id === showReplyBox || item?.id === editComment) && (
                <>
                  <Form.Item>
                    <Input
                      rows={2}
                      value={editComment && item?.content}
                      onPressEnter={(e) => {
                        if (e.ctrlKey) {
                          if (showReplyBox) {
                            setShowReplyBox("");
                            onReply(item?.id, item?.title);
                          } else {
                            setEditComment("");
                            onEditComment(item?.id, item?.title);
                          }
                        }
                      }}
                      onChange={(e) => setComment(e.target.value)}
                      suffix={
                        editComment ? (
                          <EditOutlined
                            onClick={() => {
                              if (showReplyBox) {
                                setShowReplyBox("");
                                onReply(item?.id, item?.title);
                              } else {
                                setEditComment("");
                                onEditComment(item?.id, item?.title);
                              }
                            }}
                          />
                        ) : (
                          <SendOutlined
                            onClick={() => {
                              if (showReplyBox) {
                                setShowReplyBox("");
                                onReply(item?.id, item?.title);
                              } else {
                                setEditComment("");
                                onEditComment(item?.id, item?.title);
                              }
                            }}
                          />
                        )
                      }
                    />
                  </Form.Item>
                </>
              )}
            </>,
          ]
        }
        author={item?.authorName}
        datetime={moment(item?.createdAt).fromNow()}
        avatar={<Avatar src={item?.authorPicture} alt={"author"} />}
        content={
          <>
            {!item?.parentId && <h5>{item?.title}</h5>}
            <p>{item?.content}</p>
          </>
        }
      >
        {item?.children?.map((children) => (
          <CommentList
            key={children.id}
            item={children}
            showReplyBox={showReplyBox}
            setShowReplyBox={setShowReplyBox}
            onReply={onReply}
            setComment={setComment}
            profile={profile}
            getComment={getComment}
            params={params}
            editComment={editComment}
            setEditComment={setEditComment}
            onEditComment={onEditComment}
          />
        ))}
      </Comment>
    );
  };

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1200 },
      items: 11,
      slidesToSlide: 11,
    },
    desktop: {
      breakpoint: { max: 1199, min: 992 },
      items: 9,
      slidesToSlide: 9,
    },
    tablet: {
      breakpoint: { max: 991, min: 768 },
      items: 7,
      slidesToSlide: 7,
    },
    mobile2: {
      breakpoint: { max: 767, min: 600 },
      items: 3,
      slidesToSlide: 3,
    },
    mobile: {
      breakpoint: { max: 599, min: 0 },
      items: 2,
      slidesToSlide: 2,
    },
  };

  const startDate = moment.utc(data?.endDate).format("YYYY");
  const endDate = moment.utc(data?.startDate).format("YYYY");

  const getYears = (start, end) =>
    Array.from({ length: end.diff(start, "month") + 1 }).map((_, index) =>
      moment(start).add(index, "month").format("YYYY")
    );

  const years = getYears(moment(startDate, "YYYY"), moment(endDate, "YYYY"));

  return (
    <div className="detail-view-wrapper">
      <div id="detail-view">
        <div className="detail-header">
          <h3 className="detail-resource-type content-heading">
            {topicNames(params?.type)}
          </h3>
          <h4 className="detail-resource-title">{data?.title}</h4>
          <Col className="tool-buttons">
            <Button
              className="view-button "
              icon={<EyeFilled />}
              type="primary"
              shape="round"
              size="middle"
              href={`${
                data?.url && data?.url?.includes("https://")
                  ? data?.url
                  : data?.languages
                  ? data?.languages[0]?.url
                  : data?.url?.includes("http://")
                  ? data?.url
                  : "https://" + data?.url
              }`}
              target="_blank"
            >
              View
            </Button>
            {data?.recording && (
              <Button
                className="recording-button two-tone-button"
                icon={<PlayCircleTwoTone twoToneColor="#09689a" />}
                type="primary"
                shape="round"
                size="middle"
                ghost
                onClick={() => {
                  window.open(
                    data?.recording.includes("https://")
                      ? data?.recording
                      : "https://" + data?.recording,
                    "_blank"
                  );
                }}
              >
                Recording
              </Button>
            )}
            <Popover
              placement="top"
              overlayStyle={{
                width: "22vw",
              }}
              overlayClassName="popover-share"
              content={
                <Input.Group compact>
                  <Input
                    style={{ width: "calc(100% - 20%)" }}
                    defaultValue={`${
                      data?.url && data?.url?.includes("https://")
                        ? data?.url
                        : data?.languages
                        ? data?.languages[0]?.url
                        : data?.url?.includes("http://")
                        ? data?.url
                        : "https://" + data?.url
                    }`}
                    disabled
                  />
                  <Button
                    style={{ width: "20%" }}
                    type="primary"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        data?.url && data?.url?.includes("https://")
                          ? data?.languages
                            ? data?.languages[0]?.url
                            : data?.url
                          : "https://" + data?.url
                      );
                      setVisible(!visible);
                    }}
                  >
                    Copy
                  </Button>
                </Input.Group>
              }
              trigger="click"
              visible={visible}
              onVisibleChange={() => setVisible(!visible)}
              placement="left"
            >
              <div>
                <Button
                  className="share-button two-tone-button"
                  icon={<MailTwoTone twoToneColor="#09689a" />}
                  type="primary"
                  shape="round"
                  size="middle"
                  ghost
                  onClick={() => setVisible(!visible)}
                >
                  Share
                </Button>
              </div>
            </Popover>
            <Button
              className="bookmark-button two-tone-button"
              icon={
                relation?.association?.indexOf("interested in") !== -1 ? (
                  <HeartFilled />
                ) : (
                  <HeartTwoTone twoToneColor="#09689a" />
                )
              }
              type="primary"
              shape="round"
              size="middle"
              ghost
              onClick={() => handleChangeRelation("interested in")}
            >
              Bookmark
            </Button>
            <Button onClick={handleEditBtn}>EDIT</Button>
          </Col>
        </div>

        <Row
          className="resource-info section"
          gutter={{
            lg: 24,
          }}
        >
          {data?.image && (
            <Col
              className="resource-image-wrapper"
              style={data?.type !== "event" && { width: "50%", float: "left" }}
            >
              <img className="resource-image" src={data?.image} alt="" />
            </Col>
          )}

          <Col className="details-content-wrapper">
            {description && (
              <Row>
                <h3 className="content-heading">Description</h3>
                <p
                  className={`content-paragraph ${
                    data?.type === "event" && "event-paragraph"
                  }`}
                >
                  {description}
                </p>
              </Row>
            )}

            <Row>
              {data?.geoCoverageType && (
                <Col>
                  <h3 className="content-heading">Location & Geocoverage</h3>
                  <span className="detail-item geocoverage-item">
                    <div className="transnational-icon detail-item-icon">
                      <TransnationalImage />
                    </div>
                    <span>{titleCase(data?.geoCoverageType || "")}</span>
                  </span>

                  {data?.geoCoverageType !== "global" && (
                    <div className="detail-item">
                      {data?.geoCoverageType !== "sub-national" &&
                        data?.geoCoverageType !== "national" && (
                          <>
                            {data?.geoCoverageCountryGroups &&
                              data?.geoCoverageCountryGroups?.length > 0 && (
                                <Row>
                                  <div className="location-icon detail-item-icon">
                                    <LocationImage />
                                  </div>
                                  <div>
                                    {renderGeoCoverageCountryGroups(
                                      data,
                                      countries,
                                      transnationalOptions
                                    )}
                                  </div>
                                </Row>
                              )}
                          </>
                        )}

                      {data?.geoCoverageType !== "sub-national" &&
                        data?.geoCoverageType !== "national" && (
                          <>
                            {data?.geoCoverageCountries &&
                              data?.geoCoverageCountries?.length > 0 && (
                                <Row>
                                  <div className="location-icon detail-item-icon">
                                    <LocationImage />
                                  </div>
                                  <div>
                                    {renderCountries(
                                      data,
                                      countries,
                                      transnationalOptions
                                    )}
                                  </div>
                                </Row>
                              )}
                          </>
                        )}

                      {(data?.geoCoverageType === "sub-national" ||
                        data?.geoCoverageType === "national") && (
                        <>
                          {data?.geoCoverageValues &&
                            data?.geoCoverageValues.length > 0 && (
                              <Row>
                                <div className="location-icon detail-item-icon">
                                  <LocationImage />
                                </div>
                                <div>
                                  {renderCountries(
                                    data,
                                    countries,
                                    transnationalOptions
                                  )}
                                </div>
                              </Row>
                            )}
                        </>
                      )}

                      {(data?.subnationalCity || data?.q24SubnationalCity) && (
                        <Row>
                          <div className="city-icon detail-item-icon">
                            <CityImage />
                          </div>
                          <div>
                            {data?.subnationalCity
                              ? data?.subnationalCity
                              : data?.q24SubnationalCity}
                          </div>
                        </Row>
                      )}
                    </div>
                  )}

                  {data?.languages && (
                    <span className="detail-item">
                      {data?.languages
                        .map((language) => {
                          const langs =
                            !isEmpty(languages) &&
                            languages[language?.isoCode]?.name;
                          return langs || "";
                        })
                        .join(", ")}
                    </span>
                  )}
                </Col>
              )}
            </Row>
          </Col>
        </Row>

        <Col>
          {/* CONNECTION */}
          {data?.stakeholderConnections.filter(
            (x) => x.stakeholderRole !== "ADMIN" || x.role === "interested in"
          )?.length > 0 && (
            <Col className="section">
              <h3 className="content-heading">Connections</h3>

              <List itemLayout="horizontal">
                {data?.entityConnections.map((item) => (
                  <List.Item className="stakeholder-row">
                    <List.Item.Meta
                      className="stakeholder-detail"
                      avatar={
                        <Avatar
                          size={40}
                          src={
                            item?.image ? (
                              item?.image
                            ) : (
                              <Avatar
                                style={{
                                  backgroundColor: "#09689A",
                                  verticalAlign: "middle",
                                }}
                                size={50}
                              >
                                {item.entity?.substring(0, 2)}
                              </Avatar>
                            )
                          }
                        />
                      }
                      title={
                        <Link to={`/organisation/${item.entityId}`}>
                          {item.entity}
                        </Link>
                      }
                      description={"Entity"}
                    />{" "}
                    {/* <div className="see-more-button">See More</div> */}
                  </List.Item>
                ))}
              </List>

              <Avatar.Group
                maxCount={2}
                size="large"
                maxStyle={{
                  color: "#f56a00",
                  backgroundColor: "#fde3cf",
                  cursor: "pointer",
                  height: 40,
                  width: 40,
                }}
              >
                {data?.stakeholderConnections.filter(
                  (x) =>
                    x.stakeholderRole !== "ADMIN" || x.role === "interested in"
                )?.length > 0 && (
                  <List itemLayout="horizontal">
                    {data?.stakeholderConnections
                      .filter(
                        (x) =>
                          x.stakeholderRole !== "ADMIN" ||
                          x.role === "interested in"
                      )
                      .map((item) => (
                        <List.Item key={item?.id} className="stakeholder-row">
                          <List.Item.Meta
                            className="stakeholder-detail"
                            avatar={<Avatar src={item?.image} />}
                            title={
                              <Link to={`/stakeholder/${item.stakeholderId}`}>
                                {item.stakeholder}
                              </Link>
                            }
                            description={item.role}
                          />
                        </List.Item>
                      ))}
                  </List>
                )}
              </Avatar.Group>

              <Row className="stakeholder-row stakeholder-group">
                <Avatar.Group
                  maxCount={2}
                  size="large"
                  maxStyle={{
                    color: "#f56a00",
                    backgroundColor: "#fde3cf",
                    cursor: "pointer",
                    height: 40,
                    width: 40,
                  }}
                >
                  {data?.stakeholderConnections
                    .filter(
                      (x) =>
                        x.stakeholderRole !== "ADMIN" ||
                        x.role === "interested in"
                    )
                    .map((connection, index) => (
                      <Avatar
                        className="related-content-avatar"
                        style={{ border: "none", height: 40, width: 40 }}
                        key={index}
                        src={
                          <Avatar
                            avatar={<Avatar src={connection?.image} />}
                            style={{
                              backgroundColor: "#09689A",
                              verticalAlign: "middle",
                            }}
                            size={40}
                            title={
                              <Link
                                to={`/stakeholder/${connection?.stakeholderId}`}
                              >
                                {connection?.stakeholder}
                              </Link>
                            }
                          >
                            {connection?.stakeholder}
                          </Avatar>
                        }
                      />
                    ))}
                </Avatar.Group>
              </Row>
            </Col>
          )}

          {/* TAGS */}
          {data?.tags && data?.tags?.length > 0 && (
            <Col className="section">
              <h3 className="content-heading">Tags</h3>
              <List itemLayout="horizontal">
                <List.Item>
                  <List.Item.Meta
                    title={
                      <ul className="tag-list">
                        {data?.tags &&
                          data?.tags.map((tag) => (
                            <li className="tag-list-item" key={tag?.tag}>
                              <Tag className="resource-tag">
                                {titleCase(tag?.tag || "")}
                              </Tag>
                            </li>
                          ))}
                      </ul>
                    }
                  />
                </List.Item>
              </List>
            </Col>
          )}
        </Col>

        {/* DOCUMENTS AND INFO */}
        {data?.infoDocs && (
          <Col className="section">
            <h3 className="content-heading">Documents and info</h3>
            <div className="content-paragraph">
              <div
                className="list documents-list"
                dangerouslySetInnerHTML={{ __html: data?.infoDocs }}
              />
            </div>
          </Col>
        )}

        <Col className="record-section section">
          <h3 className="content-heading">Records</h3>
          <div>
            <table className="record-table">
              <tbody>
                {years && years?.length > 0 && (
                  <tr className="record-row">
                    <td className="record-name">Year</td>
                    <td className="record-value">
                      {years.map((year) => year).join(" - ")}
                    </td>
                  </tr>
                )}

                {data?.startDate && (
                  <tr className="record-row">
                    <td className="record-name">Valid from</td>
                    <td className="record-value">
                      {data?.startDate
                        ? moment.utc(data?.startDate).format("DD MMM YYYY")
                        : ""}
                    </td>
                  </tr>
                )}

                {data?.endDate && (
                  <tr className="record-row">
                    <td className="record-name">Valid until</td>
                    <td className="record-value">
                      {data?.endDate
                        ? moment.utc(data?.endDate).format("DD MMM YYYY")
                        : ""}
                    </td>
                  </tr>
                )}

                {data?.currencyAmountInvested &&
                data?.currencyAmountInvested?.length ? (
                  <tr className="record-row">
                    <td className="record-name">Amount Invested</td>
                    <td className="record-value">
                      {data?.currencyAmountInvested &&
                        data?.currencyAmountInvested?.length &&
                        data?.currencyAmountInvested
                          .map((amount) => {
                            return `${amount?.name} ${data?.funds}`;
                          })
                          .join(", ")}
                    </td>
                  </tr>
                ) : (
                  ""
                )}

                {data?.currencyInKindContribution &&
                data?.currencyInKindContribution?.length ? (
                  <tr className="record-row">
                    <td className="record-name">In Kind Contributions</td>
                    <td className="record-value">
                      {data?.currencyInKindContribution &&
                        data?.currencyInKindContribution?.length &&
                        data?.currencyInKindContribution
                          .map((contribution) => {
                            return `${contribution?.name} ${data?.contribution}`;
                          })
                          .join(", ")}
                    </td>
                  </tr>
                ) : (
                  ""
                )}

                {data?.funding ? (
                  <>
                    <tr className="record-row">
                      <td className="record-name">Funding Type</td>
                      <td className="record-value">
                        {data?.funding && data?.funding?.type}
                      </td>
                    </tr>

                    <tr className="record-row">
                      <td className="record-name">Funding Name</td>
                      <td className="record-value">
                        {data?.funding && data?.funding?.name}
                      </td>
                    </tr>
                  </>
                ) : (
                  ""
                )}

                {data?.focusArea && data?.focusArea?.length > 0 ? (
                  <tr className="record-row">
                    <td className="record-name">Focus Area:</td>
                    <td className="record-value">
                      {data?.focusArea.map((area) => area?.name).join(", ")}
                    </td>
                  </tr>
                ) : (
                  ""
                )}

                {data?.lifecyclePhase && data?.lifecyclePhase?.length ? (
                  <tr className="record-row">
                    <td className="record-name">Lifecycle Phase</td>
                    <td className="record-value">
                      {data?.lifecyclePhase
                        .map((phase) => phase?.name)
                        .join(", ")}
                    </td>
                  </tr>
                ) : (
                  ""
                )}

                {data?.sector && data?.sector?.length > 0 ? (
                  <tr className="record-row">
                    <td className="record-name">Sector</td>
                    <td className="record-value">
                      {data?.sector.map((item) => item?.name).join(", ")}
                    </td>
                  </tr>
                ) : (
                  ""
                )}

                {data?.activityOwner && data?.activityOwner?.length > 0 ? (
                  <tr className="record-row">
                    <td className="record-name">Initiative Owner</td>
                    <td className="record-value">
                      {data?.activityOwner
                        .map((activity) => activity?.name)
                        .join(", ")}
                    </td>
                  </tr>
                ) : (
                  ""
                )}

                {data?.entityType && (
                  <tr className="record-row">
                    <td className="record-name">Entity Type</td>
                    <td className="record-value">{data?.entityType}</td>
                  </tr>
                )}

                {data?.activityTerm && (
                  <tr className="record-row">
                    <td className="record-name">Initiative Term</td>
                    <td className="record-value">{data?.activityTerm?.name}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Col>
        {/* RELATED CONTENT */}

        {data?.relatedContent &&
          data?.relatedContent?.length > 0 &&
          data?.relatedContent.length > 0 && (
            <Col className="section section-related-content">
              <RelatedContent
                data={data}
                responsive={responsive}
                isShownCount={false}
                title="Related content"
                relatedContent={data?.relatedContent}
                isShownPagination={false}
                dataCount={relatedContent?.length || 0}
              />
            </Col>
          )}

        {/* COMMENTS */}
        <Col className="section comment-section">
          <h3 className="content-heading">Discussion</h3>
          {comments &&
            comments.length > 0 &&
            comments?.map((item, index) => {
              return (
                <CommentList
                  key={item?.id}
                  item={item}
                  showReplyBox={showReplyBox}
                  setShowReplyBox={setShowReplyBox}
                  onReply={onReply}
                  setComment={setComment}
                  profile={profile}
                  getComment={getComment}
                  params={params}
                  editComment={editComment}
                  setEditComment={setEditComment}
                  onEditComment={onEditComment}
                />
              );
            })}
        </Col>
        <Col className="input-wrapper">
          <MessageOutlined className="message-icon" />
          <Input
            className="comment-input"
            placeholder="Join the discussion..."
            suffix={
              <SendOutlined
                onClick={() => onSubmit({ description: newComment })}
              />
            }
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onPressEnter={(e) =>
              e.ctrlKey && onSubmit({ description: newComment })
            }
          />
        </Col>
      </div>
    </div>
  );
};

export default DetailView;
