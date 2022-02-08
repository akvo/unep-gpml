import React, {
  Fragment,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import "./styles.scss";
import {
  Row,
  Col,
  Modal,
  Typography,
  Card,
  List,
  Avatar,
  notification,
  Dropdown,
  Checkbox,
  Popover,
  Input,
  Button,
} from "antd";
const { Title } = Typography;
import { UIStore } from "../../store";
import StickyBox from "react-sticky-box";
import ActionGreen from "../../images/action-green.png";
import LeftImage from "../../images/sea-dark.jpg";
import LocationImage from "../../images/location.svg";
import TransnationalImage from "../../images/transnational.svg";
import LanguageImage from "../../images/language.svg";
import TagsImage from "../../images/tags.svg";
import ViewsImage from "../../images/views.svg";
import AvatarImage from "../../images/avatar.jpg";
import EntityImage from "../../images/entity.png";
import {
  DownloadOutlined,
  HeartOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
  ArrowRightOutlined,
  LoadingOutlined,
  EyeOutlined,
  HeartFilled,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { withRouter, useHistory } from "react-router-dom";
import uniqBy from "lodash/uniqBy";
import isEmpty from "lodash/isEmpty";
import { redirectError } from "../error/error-util";
import api from "../../utils/api";
import imageNotFound from "../../images/image-not-found.png";
import {
  typeOfActionKeys,
  detailMaps,
  infoMaps,
  descriptionMaps,
} from "./mapping";
import moment from "moment";
import {
  topicNames,
  resourceTypeToTopicType,
  relationsByTopicType,
} from "../../utils/misc";

const CardComponent = ({ title, style, children, getRef }) => {
  return (
    <div className="card-wrapper" style={style} ref={getRef}>
      <Card title={title} bordered={false} style={style}>
        {children}
      </Card>
    </div>
  );
};

const TabComponent = ({
  title,
  style,
  children,
  relatedRef,
  recordRef,
  documentRef,
}) => {
  return (
    <div className="tab-wrapper" style={style}>
      <ul>
        <li>
          <a onClick={() => recordRef.current.scrollIntoView()}>Record</a>
        </li>
        <li>
          <a onClick={() => documentRef.current.scrollIntoView()}>
            Documents And Info
          </a>
        </li>
        <li>
          <a onClick={() => relatedRef.current.scrollIntoView()}>
            Related Content
          </a>
        </li>
        {/* <li>
          <a href="#">Comments</a>
        </li> */}
      </ul>
    </div>
  );
};

const SharePanel = ({
  data,
  canDelete,
  topic,
  handleEditBtn,
  canEdit,
  relation,
  handleRelationChange,
  allowBookmark,
  visible,
  handleVisible,
}) => {
  const { type, id } = topic;

  const handleChangeRelation = (relationType) => {
    let association = relation ? [...relation.association] : [];
    if (!association.includes(relationType)) {
      association = [...association, relationType];
    } else {
      association = association.filter((it) => it !== relationType);
    }
    handleRelationChange({
      topicId: parseInt(topic.id),
      association,
      topic: resourceTypeToTopicType(topic.type),
    });
  };

  const handleVisibleChange = () => {
    handleVisible();
  };

  return (
    <div className="sticky-panel">
      <div className="sticky-panel-item">
        <a
          href={`${
            data?.url && data?.url.includes("https://")
              ? data?.url
              : data.languages
              ? data?.languages[0].url
              : "https://" + data?.url
          }`}
          target="_blank"
        >
          <EyeOutlined />
          <h2>View</h2>
        </a>
      </div>

      <div
        className="sticky-panel-item"
        onClick={() => handleChangeRelation("interested in")}
      >
        {relation &&
        relation.association &&
        relation.association.indexOf("interested in") !== -1 ? (
          <HeartFilled />
        ) : (
          <HeartOutlined />
        )}
        <h2>Bookmark</h2>
      </div>
      <Popover
        overlayStyle={{
          width: "22vw",
        }}
        content={
          <Input.Group compact>
            <Input
              style={{ width: "calc(100% - 20%)" }}
              defaultValue={`${
                data?.url && data?.url.includes("https://")
                  ? data?.url
                  : data.languages
                  ? data?.languages[0].url
                  : "https://" + data?.url
              }`}
              disabled
            />
            <Button
              style={{ width: "20%" }}
              type="primary"
              onClick={() => {
                navigator.clipboard.writeText(
                  data?.url && data?.url.includes("https://")
                    ? data?.languages
                      ? data?.languages[0].url
                      : data?.url
                    : "https://" + data?.url
                );
                handleVisibleChange();
              }}
            >
              Copy
            </Button>
          </Input.Group>
        }
        trigger="click"
        visible={visible}
        onVisibleChange={handleVisibleChange}
        placement="left"
      >
        <div className="sticky-panel-item" onClick={handleVisibleChange}>
          <ShareAltOutlined />
          <h2>Share</h2>
        </div>
      </Popover>
      {canDelete() && (
        <div
          className="sticky-panel-item"
          onClick={() => {
            Modal.error({
              className: "popup-delete",
              centered: true,
              closable: true,
              icon: <DeleteOutlined />,
              title: "Are you sure you want to delete this resource?",
              content: "Please be aware this action cannot be undone.",
              okText: "Delete",
              okType: "danger",
              onOk() {
                return api
                  .delete(`/detail/${type}/${id}`)
                  .then((res) => {
                    notification.success({
                      message: "Resource deleted successfully",
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
          <DeleteOutlined />
          <h2>Delete</h2>
        </div>
      )}
      {canEdit() && (
        <div className="sticky-panel-item" onClick={() => handleEditBtn()}>
          <EditOutlined />
          <h2>Update</h2>
        </div>
      )}
    </div>
  );
};

const renderBannerSection = (
  data,
  LeftImage,
  profile,
  isAuthenticated,
  params,
  handleEditBtn,
  allowBookmark,
  visible,
  handleVisible,
  relation,
  handleRelationChange
) => {
  const noEditTopics = new Set(["stakeholder"]);
  const canEdit = () =>
    isAuthenticated &&
    profile.reviewStatus === "APPROVED" &&
    (profile.role === "ADMIN" ||
      profile.id === params.createdBy ||
      data.owners.includes(profile.id)) &&
    ((params.type !== "project" && !noEditTopics.has(params.type)) ||
      (params.type === "project" && params.id > 10000));

  const canDelete = () =>
    isAuthenticated &&
    profile.reviewStatus === "APPROVED" &&
    profile.role === "ADMIN";

  if (
    data.type === "Technical Resource" ||
    data.type === "Policy" ||
    data.type === "Action Plan"
  ) {
    return (
      <>
        <Col xs={6} lg={6}>
          <div className="short-image">
            <img
              src={data.image ? data.image : imageNotFound}
              className="resource-image"
            />
          </div>
        </Col>
        <Col xs={18} lg={18} style={{ display: "flex" }}>
          <div className="banner-wrapper">
            <CardComponent
              title="Description"
              style={{
                height: "100%",
                boxShadow: "none",
                borderRadius: "none",
              }}
            >
              <p>{data.summary}</p>
            </CardComponent>
            <SharePanel
              data={data}
              canDelete={canDelete}
              topic={{ ...data, ...params }}
              handleEditBtn={handleEditBtn}
              canEdit={canEdit}
              relation={relation.relation}
              handleRelationChange={relation.handleRelationChange}
              allowBookmark={allowBookmark}
              visible={visible}
              handleVisible={handleVisible}
            />
          </div>
        </Col>
      </>
    );
  } else {
    return (
      <>
        <Col xs={6} lg={24}>
          <div className="banner-wrapper">
            <div className="long-image">
              <img
                src={data.image ? data.image : imageNotFound}
                className="resource-image"
              />
            </div>
            <SharePanel
              data={data}
              canDelete={canDelete}
              topic={{ ...data, ...params }}
              handleEditBtn={handleEditBtn}
              canEdit={canEdit}
              relation={relation.relation}
              handleRelationChange={relation.handleRelationChange}
              allowBookmark={allowBookmark}
              visible={visible}
              handleVisible={handleVisible}
            />
          </div>
        </Col>
      </>
    );
  }
};

const renderDetails = (
  { countries, languages, regionOptions, meaOptions, transnationalOptions },
  params,
  data
) => {
  const details = detailMaps[params.type];
  if (!details) {
    return;
  }
  return (
    <>
      {renderItemValues(
        {
          countries,
          languages,
          regionOptions,
          meaOptions,
          transnationalOptions,
        },
        params,
        details,
        data
      )}
    </>
  );
};

const renderItemValues = (
  { countries, languages, regionOptions, meaOptions, transnationalOptions },
  params,
  mapping,
  data
) => {
  let noData = false;
  mapping &&
    mapping.every((it) => {
      const { key } = it;
      if (data[key]) {
        noData = false;
        return false;
      }
      if (!data[key]) {
        noData = true;
        return true;
      }
      return true;
    });

  if (noData) {
    return "There is no data to display";
  }

  if (countries.length === 0) {
    return "";
  }

  return (
    mapping &&
    mapping.map((item, index) => {
      const {
        key,
        name,
        value,
        type,
        customValue,
        arrayCustomValue,
        currencyObject,
      } = item;
      // Set to true to display all country list for global
      const showAllCountryList = false;
      const displayEntry =
        data[key] ||
        data[key] === false ||
        data[key] === true ||
        data[key] === 0 ||
        key === null;
      // Calculate custom currency value to display
      const [currency, amount, remarks] =
        arrayCustomValue?.map((it) => data[it]) || [];

      const customCurrency =
        value === "custom" &&
        type === "currency" &&
        (remarks
          ? currency
            ? `${currency} ${amount} - ${remarks}`
            : `${amount} - ${remarks}`
          : currency
          ? `${currency} ${amount}`
          : `${amount}`);

      return (
        <Fragment key={`${params.type}-${name}`}>
          {displayEntry && (
            <div key={name + index} className="record-table-wrapper">
              <div className="title">{name}</div>
              <div className="value">
                {key === null && type === "static" && value}
                {value === key &&
                  type === "name" &&
                  data[key] === false &&
                  "No"}
                {value === key &&
                  type === "name" &&
                  data[key] === true &&
                  "Yes"}
                {value === key &&
                  (type === "name" ||
                    type === "string" ||
                    type === "number" ||
                    type === "object") &&
                  (data[value].name || data[value])}
                {value === key &&
                  type === "date" &&
                  moment(data[key]).format("DD MMM YYYY")}
                {value === key &&
                  type === "array" &&
                  data[key].map((x) => x.name).join(", ")}
                {value === key &&
                  type === "country" &&
                  countries.find((it) => it.id === data[key]).name}
                {value === "custom" &&
                  type === "object" &&
                  data[key][customValue]}
                {value === "custom" &&
                  type === "startEndDate" &&
                  moment(data[arrayCustomValue[0]]).format("DD MMM YYYY") +
                    " - " +
                    moment(data[arrayCustomValue[1]]).format("DD MMM YYYY")}
                {data[key] &&
                  value === "isoCode" &&
                  type === "array" &&
                  uniqBy(data[key], "isoCode")
                    .map((x, i) => languages[x.isoCode].name)
                    .join(", ")}
                {key === "tags" &&
                  data[key] &&
                  value === "join" &&
                  type === "array" &&
                  data[key].map((tag) => Object.values(tag)[0]).join(", ")}
                {key !== "tags" &&
                  params.type === "project" &&
                  data[key] &&
                  value === "join" &&
                  type === "array" &&
                  data[key].map((x) => x.name).join(", ")}
                {key !== "tags" &&
                  params.type !== "project" &&
                  data[key] &&
                  value === "join" &&
                  type === "array" &&
                  data[key].join(", ")}
                {params.type === "project" &&
                  value === "custom" &&
                  type === "array" &&
                  data[key][customValue] &&
                  data[key][customValue].map((x) => x.name).join(", ")}
                {params.type !== "project" &&
                  value === "custom" &&
                  type === "array" &&
                  data[key][customValue] &&
                  data[key][customValue].join(", ")}

                {customCurrency}
              </div>
            </div>
          )}
        </Fragment>
      );
    })
  );
};

const renderCountries = (data, countries, transnationalOptions) => {
  let dataCountries = null;
  const newArray = [...new Set([...transnationalOptions, ...countries])];
  dataCountries = data["geoCoverageValues"]
    ?.map((x) => {
      return newArray.find((it) => it.id === x)?.name;
    })
    .join(", ");
  return dataCountries;
};

const DetailsView = ({
  match: { params },
  setStakeholderSignupModalVisible,
  setFilterMenu,
}) => {
  const relatedContent = useRef(null);
  const record = useRef(null);
  const document = useRef(null);
  const reviews = useRef(null);

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
  const { isAuthenticated, loginWithPopup } = useAuth0();
  const [warningVisible, setWarningVisible] = useState(false);
  const [visible, setVisible] = useState(false);

  const relation = relations.find(
    (it) =>
      it.topicId === parseInt(params.id) &&
      it.topic === resourceTypeToTopicType(params.type)
  );

  const isConnectStakeholders = ["organisation", "stakeholder"].includes(
    params?.type
  );
  const breadcrumbLink = isConnectStakeholders ? "stakeholders" : "browse";

  const allowBookmark =
    params.type !== "stakeholder" || profile.id !== params.id;

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

  const handleVisible = () => {
    setVisible(!visible);
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
    <div id="details">
      <div className="section-header">
        <div className="ui container">
          <Row>
            <Col xs={24} lg={24}>
              <div className="header-wrapper">
                <img src={ActionGreen} />
                <div>
                  <Title level={2}>{topicNames(params?.type)}</Title>
                  <Title level={4}>{data?.title}</Title>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      <div className="section-banner">
        <div className="ui container">
          <Row gutter={[16, 16]}>
            {renderBannerSection(
              data,
              LeftImage,
              profile,
              isAuthenticated,
              params,
              handleEditBtn,
              allowBookmark,
              visible,
              handleVisible,
              { ...{ handleRelationChange, relation } }
            )}
          </Row>
        </div>
      </div>

      <div className="section-info">
        <div className="ui container">
          <Row gutter={[16, 16]}>
            <Col xs={6} lg={6}>
              <div className="views-container">
                <List itemLayout="horizontal">
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={ViewsImage} />}
                      title={"123 views"}
                    />
                  </List.Item>
                </List>
              </div>

              <CardComponent
                title="Location and Geo-coverage"
                style={{
                  marginBottom: "30px",
                }}
              >
                <div className="list geo-coverage">
                  <List itemLayout="horizontal">
                    {data?.geoCoverageValues &&
                      data?.geoCoverageValues.length > 0 && (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar src={LocationImage} />}
                            title={renderCountries(
                              data,
                              countries,
                              transnationalOptions
                            )}
                          />
                        </List.Item>
                      )}
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={TransnationalImage} />}
                        title={data?.geoCoverageType}
                      />
                    </List.Item>
                    {/* <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={LanguageImage} />}
                        title={"English"}
                      />
                    </List.Item> */}
                  </List>
                </div>
              </CardComponent>

              <CardComponent
                title="Tags"
                style={{
                  marginBottom: "30px",
                }}
              >
                <div className="list tag-list">
                  <List itemLayout="horizontal">
                    {data?.tags && (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar src={TagsImage} />}
                          title={
                            <ul>
                              {data?.tags &&
                                data?.tags.map((tag) => (
                                  <li key={tag.tag}>{tag.tag}</li>
                                ))}
                            </ul>
                          }
                        />
                      </List.Item>
                    )}
                  </List>
                </div>
              </CardComponent>
              <CardComponent
                title="Connection"
                style={{
                  marginBottom: "30px",
                }}
              >
                <div className="list connection-list">
                  <List itemLayout="horizontal">
                    {data?.entityConnections.length > 0 &&
                      data?.entityConnections.map((item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                src={
                                  item?.image
                                    ? item.image
                                    : `https://ui-avatars.com/api/?size=480&name=${item.entity}`
                                }
                              />
                            }
                            title={item.entity}
                            description={"Entity"}
                          />{" "}
                          {/* <div className="see-more-button">See More</div> */}
                        </List.Item>
                      ))}
                  </List>
                  <List itemLayout="horizontal">
                    {data?.stakeholderConnections.length > 0 &&
                      data?.stakeholderConnections.map((item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar src={item.image} />}
                            title={item.stakeholder}
                            description={item.role}
                          />
                        </List.Item>
                      ))}
                  </List>
                  {/* <List itemLayout="horizontal">
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <>
                            <div className="count">+72</div>
                          </>
                        }
                        title={"Scroll to see more"}
                      />
                    </List.Item>
                  </List> */}
                </div>
              </CardComponent>
            </Col>
            <Col xs={18} lg={18}>
              <TabComponent
                style={{
                  marginBottom: "30px",
                }}
                relatedRef={relatedContent}
                recordRef={record}
                documentRef={document}
              />
              {data.type !== "Technical Resource" &&
                data.type !== "Policy" &&
                data.type !== "Action Plan" && (
                  <CardComponent
                    title="Description"
                    style={{
                      marginBottom: "30px",
                    }}
                  >
                    <p className="summary">{data?.summary}</p>
                  </CardComponent>
                )}

              <CardComponent
                title="Record"
                style={{
                  marginBottom: "30px",
                }}
                getRef={record}
              >
                <div className="record-table">
                  {countries &&
                    renderDetails(
                      {
                        countries,
                        languages,
                        regionOptions,
                        meaOptions,
                        transnationalOptions,
                      },
                      params,
                      data,
                      profile,
                      countries
                    )}
                </div>
              </CardComponent>
              <CardComponent
                title="Documents and info"
                style={{
                  marginBottom: "30px",
                }}
                getRef={document}
              >
                {data?.infoDocs && (
                  <div
                    className="list documents-list"
                    dangerouslySetInnerHTML={{ __html: data?.infoDocs }}
                  />
                )}
              </CardComponent>
              <CardComponent
                title={`Related content (${
                  data?.relatedContent && data?.relatedContent.length
                })`}
                style={{
                  marginBottom: "30px",
                }}
                getRef={relatedContent}
              >
                {data?.relatedContent.length > 0 && (
                  <Row gutter={16} className="related-content">
                    {data?.relatedContent.map((item) => (
                      <Col span={12}>
                        <Card
                          title={data?.type ? data.type : ""}
                          bordered={false}
                        >
                          <h4>{item.title}</h4>
                          {/* <p>{item.description}</p> */}
                          <div className="bottom-panel">
                            <div>
                              <Avatar.Group
                                maxCount={2}
                                size="large"
                                maxStyle={{
                                  color: "#f56a00",
                                  backgroundColor: "#fde3cf",
                                  cursor: "pointer",
                                }}
                              >
                                {item?.stakeholderConnections?.map(
                                  (connection, index) => (
                                    <Avatar src={connection.image} />
                                  )
                                )}
                              </Avatar.Group>
                            </div>
                            <div className="read-more">
                              Read More <ArrowRightOutlined />
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </CardComponent>
              {/* <CardComponent
                title="Comments (0)"
                style={{
                  marginBottom: "30px",
                }}
              /> */}
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default DetailsView;
