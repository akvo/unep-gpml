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
  Popover,
  Input,
  Button,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
const { Title } = Typography;
import { UIStore } from "../../store";
import ActionGreen from "../../images/action-green.png";
import LeftImage from "../../images/sea-dark.jpg";
import LocationImage from "../../images/location.svg";
import TransnationalImage from "../../images/transnational.svg";
import CityImage from "../../images/city-icn.svg";
import TagsImage from "../../images/tags.svg";
import { ReactComponent as Recording } from "../../images/event-recording.svg";
import { ReactComponent as ViewIcon } from "../../images/resource-detail/view-icn.svg";
import { ReactComponent as EditIcon } from "../../images/resource-detail/edit-icn.svg";
import { ReactComponent as ShareIcon } from "../../images/resource-detail/share-icn.svg";
import { ReactComponent as TrashIcon } from "../../images/resource-detail/trash-icn.svg";
import { ReactComponent as BookMarkIcon } from "../../images/resource-detail/bookmark-icn.svg";
import {
  DeleteOutlined,
  ArrowRightOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useHistory } from "react-router-dom";
import uniqBy from "lodash/uniqBy";
import isEmpty from "lodash/isEmpty";
import { redirectError } from "../error/error-util";
import api from "../../utils/api";
import imageNotFound from "../../images/image-not-found.png";
import { detailMaps } from "./mapping";
import moment from "moment";
import { topicNames, resourceTypeToTopicType } from "../../utils/misc";
import { multicountryGroups } from "../knowledge-library/multicountry";

const currencyFormat = (curr) => Intl.NumberFormat().format(curr);

const CardComponent = ({ title, style, children, getRef }) => {
  return (
    <div className={`card-wrapper mb-10`} ref={getRef}>
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
  tagRef,
  descriptionRef,
  data,
}) => {
  return (
    <div className="tab-wrapper" style={style}>
      <ul>
        {data.type !== "Technical Resource" &&
          data.type !== "Policy" &&
          data.type !== "Action Plan" && (
            <li>
              <a onClick={() => descriptionRef.current.scrollIntoView()}>
                Description
              </a>
            </li>
          )}
        <li>
          <a onClick={() => recordRef.current.scrollIntoView()}>Record</a>
        </li>
        {data?.infoDocs && (
          <li>
            <a onClick={() => documentRef.current.scrollIntoView()}>
              Documents And Info
            </a>
          </li>
        )}
        <li>
          <a onClick={() => tagRef.current.scrollIntoView()}>Tags</a>
        </li>
        {data?.relatedContent && data?.relatedContent?.length > 0 && (
          <li>
            <a onClick={() => relatedRef.current.scrollIntoView()}>
              Related Content
            </a>
          </li>
        )}
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
      association = [relationType];
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
              : data?.url.includes("http://")
              ? data?.url
              : "https://" + data?.url
          }`}
          target="_blank"
        >
          <ViewIcon className="recording-icon view-icon" />
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
          <BookMarkIcon className="bookmark-icon bookmark-filled" />
        ) : (
          <BookMarkIcon className="bookmark-icon" />
        )}
        <h2>Bookmark</h2>
      </div>
      <Popover
        overlayStyle={{
          width: "22vw",
        }}
        overlayClassName="popover-multi-country"
        content={
          <Input.Group compact>
            <Input
              style={{ width: "calc(100% - 20%)" }}
              defaultValue={`${
                data?.url && data?.url.includes("https://")
                  ? data?.url
                  : data.languages
                  ? data?.languages[0].url
                  : data?.url.includes("http://")
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
          <ShareIcon className="recording-icon" />
          <h2>Share</h2>
        </div>
      </Popover>
      {data?.recording && (
        <div className="sticky-panel-item">
          <a
            onClick={() => {
              window.open(
                data?.recording.includes("https://")
                  ? data?.recording
                  : "https://" + data?.recording,
                "_blank"
              );
            }}
          >
            <Recording className="recording-icon" />
            <h2>Recording</h2>
          </a>
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
          <TrashIcon className="recording-icon" />
          <h2>Delete</h2>
        </div>
      )}
      {canEdit() && (
        <div className="sticky-panel-item" onClick={() => handleEditBtn()}>
          <EditIcon className="edit-icon" />
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
  showLess,
  setShowLess,
  placeholder,
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
            <a
              href={`${
                data?.url && data?.url.includes("https://")
                  ? data?.url
                  : data.languages
                  ? data?.languages[0].url
                  : data?.url.includes("http://")
                  ? data?.url
                  : "https://" + data?.url
              }`}
              target="_blank"
            >
              <img
                src={
                  data.image
                    ? data.image
                    : require(`../../images/resource-detail/${
                        placeholder[params.type]
                      }`).default
                }
                className="resource-image"
              />
            </a>
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
              <p>{data?.summary}</p>
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
        <Col xs={6} lg={24} className="long-image-container">
          <div className="banner-wrapper">
            <div className="long-image">
              <a
                href={`${
                  data?.url && data?.url.includes("https://")
                    ? data?.url
                    : data.languages
                    ? data?.languages[0].url
                    : data?.url.includes("http://")
                    ? data?.url
                    : "https://" + data?.url
                }`}
                target="_blank"
              >
                <img
                  src={
                    data.image
                      ? data.image
                      : data.qimage
                      ? data.qimage
                      : require(`../../images/resource-detail/${
                          placeholder[params.type]
                        }`).default
                  }
                  className="resource-image"
                />
              </a>
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
            ? `${currency} ${currencyFormat(amount)} - ${remarks}`
            : `${currencyFormat(amount)} - ${remarks}`
          : currency
          ? `${currency} ${currencyFormat(amount)}`
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
                {currencyObject && data[currencyObject.name]
                  ? `${data[currencyObject.name]?.[0]?.name?.toUpperCase()} `
                  : ""}
                {value === key &&
                  type === "currency" &&
                  currencyFormat(data[value])}
                {value === key &&
                  type === "date" &&
                  data[key] !== "Ongoing" &&
                  moment(data[key]).format("DD MMM YYYY")}
                {value === key &&
                  type === "date" &&
                  data[key] === "Ongoing" &&
                  data[key]}
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

const renderGeoCoverageCountryGroups = (
  data,
  countries,
  transnationalOptions
) => {
  let dataCountries = null;
  const newArray = [...new Set([...transnationalOptions, ...countries])];
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
        <span id={index}>
          {(index ? ", " : " ") + item.name}{" "}
          {item.countries && item.countries.length > 0 && (
            <Popover
              overlayClassName="popover-multi-country"
              title={""}
              content={
                <ul className="list-country-group">
                  {item.countries.map((name) => (
                    <li id={name.id}>{name.name}</li>
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
  const newArray = [...new Set([...transnationalOptions, ...countries])];
  dataCountries = data["geoCoverageCountries"]
    ?.map((x) => newArray.find((it) => it.id === x)?.name)
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
  const tag = useRef(null);
  const description = useRef(null);
  const reviews = useRef(null);
  const [showLess, setShowLess] = useState(true);

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
              showLess,
              setShowLess,
              placeholder,
              { ...{ handleRelationChange, relation } }
            )}
          </Row>
        </div>
      </div>

      <div className="section-info">
        <div className="ui container">
          <Row gutter={[16, 16]}>
            <Col xs={6} lg={6}>
              {/* <div className="views-container">
                <List itemLayout="horizontal">
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={ViewsImage} />}
                      title={"123 views"}
                    />
                  </List.Item>
                </List>
              </div> */}

              <CardComponent title="Location and Geo-coverage">
                <div className="list geo-coverage">
                  <List itemLayout="horizontal">
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={TransnationalImage} />}
                        title={data?.geoCoverageType}
                      />
                    </List.Item>
                    {data?.geoCoverageType !== "sub-national" && (
                      <>
                        {data?.geoCoverageValues &&
                          data?.geoCoverageValues.length > 0 && (
                            <List.Item>
                              <List.Item.Meta
                                avatar={<Avatar src={LocationImage} />}
                                title={
                                  <>
                                    {renderGeoCoverageCountryGroups(
                                      data,
                                      countries,
                                      transnationalOptions
                                    )}
                                  </>
                                }
                              />
                            </List.Item>
                          )}
                      </>
                    )}
                    {data?.geoCoverageType === "sub-national" && (
                      <>
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
                      </>
                    )}
                    {data?.subnationalCity && (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar src={CityImage} />}
                          title={data?.subnationalCity}
                        />
                      </List.Item>
                    )}
                  </List>
                </div>
              </CardComponent>
              {data?.entityConnections.length +
                data?.stakeholderConnections.filter(
                  (x) =>
                    x.stakeholderRole !== "ADMIN" || x.role === "interested in"
                )?.length >
                0 && (
                <CardComponent
                  title={`Connections (${
                    data?.entityConnections.length +
                    data?.stakeholderConnections.filter(
                      (x) =>
                        x.stakeholderRole !== "ADMIN" ||
                        x.role === "interested in"
                    )?.length
                  })`}
                >
                  <div className="list connection-list">
                    {data?.entityConnections.length > 0 && (
                      <List itemLayout="horizontal">
                        {data?.entityConnections.map((item) => (
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
                    )}
                    {data?.stakeholderConnections.filter(
                      (x) =>
                        x.stakeholderRole !== "ADMIN" ||
                        x.role === "interested in"
                    )?.length > 0 && (
                      <List itemLayout="horizontal">
                        {data?.stakeholderConnections
                          .filter(
                            (x) =>
                              x.stakeholderRole !== "ADMIN" ||
                              x.role === "interested in"
                          )
                          .map((item) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={<Avatar src={item.image} />}
                                title={
                                  <Link
                                    to={`/stakeholder/${item.stakeholderId}`}
                                  >
                                    {item.stakeholder}
                                  </Link>
                                }
                                description={item.role}
                              />
                            </List.Item>
                          ))}
                      </List>
                    )}
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
              )}
            </Col>
            <Col xs={18} lg={18}>
              <TabComponent
                style={{
                  marginBottom: "30px",
                }}
                relatedRef={relatedContent}
                recordRef={record}
                documentRef={document}
                tagRef={tag}
                descriptionRef={description}
                data={data}
              />
              {data.type !== "Technical Resource" &&
                data.type !== "Policy" &&
                data.type !== "Action Plan" && (
                  <CardComponent title="Description" getRef={description}>
                    <p className="summary">{data?.summary}</p>
                  </CardComponent>
                )}

              <CardComponent title="Record" getRef={record}>
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
              {data?.infoDocs && (
                <CardComponent title="Documents and info" getRef={document}>
                  {data?.infoDocs && (
                    <div
                      className="list documents-list"
                      dangerouslySetInnerHTML={{ __html: data?.infoDocs }}
                    />
                  )}
                </CardComponent>
              )}
              {data?.tags && data?.tags.length > 0 && (
                <CardComponent title="Tags" getRef={tag}>
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
              )}
              {data?.relatedContent && data?.relatedContent?.length > 0 && (
                <CardComponent
                  title={`Related content (${
                    data?.relatedContent && data?.relatedContent.length
                  })`}
                  getRef={relatedContent}
                >
                  {data?.relatedContent.length > 0 && (
                    <Row gutter={16} className="related-content">
                      {data?.relatedContent.map((item) => (
                        <Col span={12}>
                          <div className="slider-card">
                            <div className="image-holder">
                              <img
                                src={
                                  require(`../../images/${icons[params.type]}`)
                                    .default
                                }
                              />
                            </div>

                            <div className="description-holder">
                              <h4>{data?.type ? data.type : ""}</h4>
                              <h6>{item.title}</h6>
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
                                    {item?.entityConnections?.map(
                                      (connection, index) => (
                                        <Avatar src={connection.image} />
                                      )
                                    )}
                                  </Avatar.Group>
                                </div>
                                <a href={`/${params.type}/${item.id}`}>
                                  <div className="read-more">
                                    Read More <ArrowRightOutlined />
                                  </div>
                                </a>
                              </div>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  )}
                </CardComponent>
              )}
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
