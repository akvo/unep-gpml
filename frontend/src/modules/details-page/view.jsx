/* eslint-disable react-hooks/exhaustive-deps */
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
  List,
  Avatar,
  Popover,
  Input,
  Button,
  Tag,
  Modal,
  notification,
} from "antd";

import {
  EyeFilled,
  HeartTwoTone,
  MailTwoTone,
  PlayCircleTwoTone,
  HeartFilled,
  InfoCircleOutlined,
  LoadingOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import api from "../../utils/api";
import { UIStore } from "../../store";
import LeftImage from "../../images/sea-dark.jpg";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useHistory } from "react-router-dom";
import uniqBy from "lodash/uniqBy";
import isEmpty from "lodash/isEmpty";
import { redirectError } from "../error/error-util";
import { detailMaps } from "./mapping";
import moment from "moment";
import { topicNames, resourceTypeToTopicType } from "../../utils/misc";
import { multicountryGroups } from "../knowledge-library/multicountry";
import RelatedContent from "../../components/related-content/related-content";
import { titleCase } from "../../utils/string";
import { ReactComponent as LocationImage } from "../../images/location.svg";
import { ReactComponent as TransnationalImage } from "../../images/transnational.svg";
import { ReactComponent as CityImage } from "../../images/city-icn.svg";
import Comments from "./comment";
import Header from "./header";

const currencyFormat = (curr) => Intl.NumberFormat().format(curr);

const renderGeoCoverageCountryGroups = (data, countries) => {
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
const renderCountries = (data, countries) => {
  let dataCountries = null;
  const newArray = [...new Set([...countries])];
  dataCountries = data["geoCoverageCountries"]
    ?.map((x) => newArray.find((it) => it.id === x)?.name)
    .join(", ");
  return dataCountries;
};

const DetailsView = ({
  match: { params },
  setStakeholderSignupModalVisible,
  setFilterMenu,
  isAuthenticated,
}) => {
  const relatedContent = useRef(null);
  const [showLess, setShowLess] = useState(true);

  const {
    profile,
    countries,
    languages,
    regionOptions,
    meaOptions,
    transnationalOptions,
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
  const { loginWithPopup } = useAuth0();
  const [warningVisible, setWarningVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState("");
  const [editComment, setEditComment] = useState("");

  const relation = relations.find(
    (it) =>
      it.topicId === parseInt(params.id) &&
      it.topic === resourceTypeToTopicType(params.type.replace("-", "_"))
  );

  const isConnectStakeholders = ["organisation", "stakeholder"].includes(
    params?.type
  );

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
        .get(`/detail/${params.type.replace("-", "_")}/${params.id}`)
        .then((d) => {
          setData(d.data);
          getComment(params.id, params.type.replace("-", "_"));
        })
        .catch((err) => {
          console.error(err);
          redirectError(err, history);
        });
    if (isLoaded() && profile.reviewStatus === "APPROVED") {
      setTimeout(() => {
        api
          .get(`/favorite/${params.type.replace("-", "_")}/${params.id}`)
          .then((resp) => {
            setRelations(resp.data);
          });
      }, 100);
    }
    UIStore.update((e) => {
      e.disclaimer = null;
    });
    window.scrollTo({ top: 0 });
  }, [profile, isLoaded]);

  const getComment = async (id, type) => {
    let res = await api.get(
      `/comment?resource_id=${id}&resource_type=${
        type.replace("-", "_") === "project" ? "initiative" : type
      }`
    );
    if (res && res?.data) {
      setComments(res.data?.comments);
    }
  };

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
      case "action-plan":
        form = "actionPlan";
        link = "edit-action-plan";
        type = "action_plan";
        break;
      case "policy":
        form = "policy";
        link = "edit-policy";
        type = "policy";
        break;
      case "technical-resource":
        form = "technicalResource";
        link = "edit-technical-resource";
        type = "technical_resource";
        break;
      case "financing-resource":
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

  const handleDeleteBtn = () => {
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
        console.log("params?.type::::::", params?.type);
        return api
          .delete(`/detail/${params?.type.replace("-", "_")}/${params?.id}`)
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
  };

  const handleVisible = () => {
    setVisible(!visible);
  };

  const [comment, setComment] = useState("");
  const [newComment, setNewComment] = useState("");

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

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1200 },
      items: 6,
      slidesToSlide: 6,
    },
    desktop: {
      breakpoint: { max: 1199, min: 992 },
      items: 5,
      slidesToSlide: 5,
    },
    tablet: {
      breakpoint: { max: 991, min: 768 },
      items: 4,
      slidesToSlide: 4,
    },
    largeMobile: {
      breakpoint: { max: 767, min: 600 },
      items: 3,
      slidesToSlide: 3,
    },
    mobile: {
      breakpoint: { max: 599, min: 361 },
      items: 2,
      slidesToSlide: 2,
    },
    extraSmallMobile: {
      breakpoint: { max: 360, min: 0 },
      items: 0.7,
      slidesToSlide: 0.7,
    },
  };

  const description = data?.description ? data?.description : data?.summary;

  // Check image ratio
  let imageRatio = "";
  const resourceImage = document.getElementById("detail-resource-image");
  if (resourceImage?.naturalWidth > resourceImage?.naturalHeight) {
    imageRatio = "image-landscape";
  } else if (resourceImage?.naturalWidth < resourceImage?.naturalHeight) {
    imageRatio = "image-portrait";
  } else {
    imageRatio = "image-square";
  }

  return (
    <div className="detail-view-wrapper">
      <div
        id="detail-view"
        style={!isAuthenticated ? { paddingBottom: "1px" } : { padding: 0 }}
      >
        <Header
          {...{
            data,
            LeftImage,
            profile,
            isAuthenticated,
            params,
            handleEditBtn,
            handleDeleteBtn,
            allowBookmark,
            visible,
            handleVisible,
            showLess,
            setShowLess,
            placeholder,
            handleRelationChange,
            relation,
          }}
        />
        <Row
          className="resource-info "
          gutter={{
            lg: 24,
          }}
        >
          {data?.image && (
            <a
              className="resource-image-wrapper"
              href={`${
                data?.url && data?.url?.includes("https://")
                  ? data?.url
                  : data.languages
                  ? data?.languages[0].url
                  : data?.url?.includes("http://")
                  ? data?.url
                  : "https://" + data?.url
              }`}
              target="_blank"
            >
              <img
                className={`resource-image ${imageRatio}`}
                id="detail-resource-image"
                src={data?.image}
                alt={data?.title}
              />
            </a>
          )}

          <Col className="details-content-wrapper section-description section">
            {description && (
              <Row>
                <h3 className="content-heading">Description</h3>
                <p className="content-paragraph">{description}</p>
              </Row>
            )}

            <Row>
              {data?.geoCoverageType && (
                <Col className="section-geo-coverage">
                  <div className="extra-wrapper">
                    <h3 className="content-heading">Location & Geocoverage</h3>
                    <span
                      style={{
                        marginBottom: data?.geoCoverageType === "global" && 0,
                      }}
                      className="detail-item geocoverage-item"
                    >
                      <div className="transnational-icon detail-item-icon">
                        <TransnationalImage />
                      </div>
                      <span>{titleCase(data?.geoCoverageType || "")}</span>
                    </span>

                    {data?.geoCoverageType !== "global" && (
                      <>
                        {data?.geoCoverageType !== "sub-national" &&
                          data?.geoCoverageType !== "national" &&
                          data?.geoCoverageCountryGroups?.length > 0 &&
                          renderGeoCoverageCountryGroups(
                            data,
                            countries,
                            transnationalOptions
                          ) && (
                            <div className="detail-item">
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
                            </div>
                          )}

                        {data?.geoCoverageType !== "sub-national" &&
                          data?.geoCoverageType !== "national" && (
                            <>
                              {data?.geoCoverageCountries &&
                                data?.geoCoverageCountries?.length > 0 &&
                                renderCountries(
                                  data,
                                  countries,
                                  transnationalOptions
                                ) && (
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
                          data?.geoCoverageType === "national") &&
                          data?.geoCoverageValues &&
                          data?.geoCoverageValues.length > 0 &&
                          renderCountries(
                            data,
                            countries,
                            transnationalOptions
                          ) && (
                            <div className="detail-item">
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
                            </div>
                          )}

                        {(data?.subnationalCity ||
                          data?.q24SubnationalCity) && (
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
                      </>
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
                  </div>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
        <Col>
          {/* CONNECTION */}
          {(data?.entityConnections?.length > 0 ||
            data?.stakeholderConnections.filter(
              (x) => x.stakeholderRole !== "ADMIN" || x.role === "interested in"
            )?.length > 0) && (
            <Col className="section">
              <div className="extra-wrapper">
                <h3 className="content-heading">Connections</h3>
                {data?.entityConnections?.length > 0 && (
                  <List itemLayout="horizontal">
                    {data?.entityConnections?.map((item) => (
                      <List.Item key={item?.id} className="stakeholder-row">
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
                        />
                      </List.Item>
                    ))}
                  </List>
                )}
                {data?.stakeholderConnections.filter(
                  (x) =>
                    x.stakeholderRole !== "ADMIN" || x.role === "interested in"
                )?.length > 0 && (
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
                    style={{
                      marginTop:
                        data?.entityConnections?.length > 0 ? "16px" : 0,
                    }}
                  >
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
                              description={titleCase(
                                item?.role?.replace("_", " ")
                              )}
                            />
                          </List.Item>
                        ))}
                    </List>
                  </Avatar.Group>
                )}
                {data?.stakeholderConnections.filter(
                  (x) =>
                    x.stakeholderRole !== "ADMIN" || x.role === "interested in"
                ).length > 4 && (
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
                )}
              </div>
            </Col>
          )}
        </Col>
        {/* TAGS */}
        {data?.tags && data?.tags?.length > 0 && (
          <Col className="section-tag section">
            <div className="extra-wrapper">
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
            </div>
          </Col>
        )}
        {/* DOCUMENTS AND INFO */}
        {data?.infoDocs && (
          <Col className="section section-document">
            <div className="extra-wrapper">
              <h3 className="content-heading">Documents and info</h3>
              <div className="content-paragraph">
                <div
                  className="list documents-list"
                  dangerouslySetInnerHTML={{ __html: data?.infoDocs }}
                />
              </div>
            </div>
          </Col>
        )}

        <Records {...{ countries, languages, params, data, profile }} />

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
        <Comments
          {...{
            profile,
            params,
            comment,
            comments,
            editComment,
            setEditComment,
            newComment,
            setNewComment,
            showReplyBox,
            setShowReplyBox,
            setComment,
            getComment,
            loginWithPopup,
            isAuthenticated,
          }}
        />
      </div>
    </div>
  );
};

const Records = ({ countries, languages, params, data }) => {
  const mapping = detailMaps[params.type.replace("-", "_")];
  if (!mapping) {
    return;
  }
  const renderRow = (item, index) => {
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

    if (
      (key === "lifecyclePhase" && data[key]?.length === 0) ||
      (key === "sector" && data[key]?.length === 0) ||
      (key === "focusArea" && data[key]?.length === 0)
    ) {
      return false;
    }

    return (
      <Fragment key={`${params.type}-${name}`}>
        {displayEntry && (
          <div key={name + index} className="record-row">
            <div className="record-name">{name}</div>
            <div className="record-value">
              {key === null && type === "static" && value}
              {value === key && type === "name" && data[key] === false && "No"}
              {value === key && type === "name" && data[key] === true && "Yes"}
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
                type === "startDate" &&
                moment.utc(data[arrayCustomValue[0]]).format("DD MMM YYYY")}
              {value === "custom" &&
                type === "endDate" &&
                moment.utc(data[arrayCustomValue[0]]).format("DD MMM YYYY")}

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
                data[key]?.length !== 0 &&
                data[key]?.map((x) => x.name).join(", ")}
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
                data[key][customValue]?.map((x) => x.name).join(", ")}
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
  };
  return (
    <Col className="record-section section">
      <h3 className="content-heading">Records</h3>
      <div>
        <div className="record-table">
          <div>{countries && mapping.map(renderRow)}</div>
        </div>
      </div>
    </Col>
  );
};

export default DetailsView;
