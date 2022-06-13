import React, { useState, useEffect, useCallback, useRef } from "react";
import "./style.scss";
import isoConv from "iso-language-converter";
import {
  Modal,
  Button,
  Row,
  Col,
  List,
  Avatar,
  Input,
  Tag,
  Tooltip,
  Comment,
} from "antd";
import {
  EyeFilled,
  HeartTwoTone,
  MailTwoTone,
  MessageOutlined,
  PlayCircleTwoTone,
  SendOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import TestImage from "../../images/landing-gpml.jpg";
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

const DetailView = ({
  params,
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

  const relation = relations.find(
    (it) =>
      it.topicId === parseInt(params.id) &&
      it.topic === resourceTypeToTopicType(params.type)
  );
  console.log("data::::::", data);
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
          // getComment(params.id, params.type);
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
  }, [profile, isLoaded]);

  const testData = [
    {
      author: "Han Solo",
      avatar: "https://joeschmoe.io/api/v1/random",
      content: (
        <p>
          We supply a series of design principles, practical patterns and high
          quality design resources (Sketch and Axure), to help people create
          their product prototypes beautifully and efficiently.
        </p>
      ),
      datetime: (
        <Tooltip
          title={moment().subtract(2, "days").format("YYYY-MM-DD HH:mm:ss")}
        >
          <span>{moment().subtract(2, "days").fromNow()}</span>
        </Tooltip>
      ),
    },
  ];

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
    const newArray = [...new Set([...countries])];
    dataCountries = data["geoCoverageCountries"]
      ?.map((x) => newArray.find((it) => it.id === x)?.name)
      .join(", ");
    return dataCountries;
  };

  return (
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
          >
            View
          </Button>
          <Button
            className="recording-button two-tone-button"
            icon={<PlayCircleTwoTone twoToneColor="#09689a" />}
            type="primary"
            shape="round"
            size="middle"
            ghost
          >
            Recording
          </Button>
          <Button
            className="share-button two-tone-button"
            icon={<MailTwoTone twoToneColor="#09689a" />}
            type="primary"
            shape="round"
            size="middle"
            ghost
          >
            Share
          </Button>
          <Button
            className="bookmark-button two-tone-button"
            icon={<HeartTwoTone twoToneColor="#09689a" />}
            type="primary"
            shape="round"
            size="middle"
            ghost
          >
            Bookmark
          </Button>
        </Col>
      </div>

      <Row
        className="resource-info section"
        gutter={{
          lg: 24,
        }}
      >
        {/* {data?.image && ( */}
        <Col lg={12}>
          <img className="resource-image" src={TestImage} alt="" />
        </Col>
        {/* )} */}
        <Col lg={data?.image ? 12 : 24}>
          <Row>
            <h3 className="content-heading">Description</h3>
            <p className="content-paragraph">{data?.description}</p>
          </Row>
          <Row>
            <Col>
              <h3 className="content-heading">Location & Geocoverage</h3>
              <span className="detail-item">
                <TransnationalImage />{" "}
                <span>{titleCase(data?.geoCoverageType || "")}</span>
              </span>

              <div className="detail-item">
                {data?.geoCoverageType !== "sub-national" &&
                  data?.geoCoverageType !== "national" && (
                    <>
                      {data?.geoCoverageCountryGroups &&
                        data?.geoCoverageCountryGroups.length > 0 && (
                          <>
                            <LocationImage />{" "}
                            {renderGeoCoverageCountryGroups(
                              data,
                              countries,
                              transnationalOptions
                            )}
                          </>
                        )}
                    </>
                  )}

                {data?.geoCoverageType !== "sub-national" &&
                  data?.geoCoverageType !== "national" && (
                    <>
                      {data?.geoCoverageCountries &&
                        data?.geoCoverageCountries.length > 0 && (
                          <>
                            <LocationImage />{" "}
                            {renderCountries(
                              data,
                              countries,
                              transnationalOptions
                            )}
                          </>
                        )}
                    </>
                  )}

                {(data?.geoCoverageType === "sub-national" ||
                  data?.geoCoverageType === "national") && (
                  <>
                    {data?.geoCoverageValues &&
                      data?.geoCoverageValues.length > 0 && (
                        <>
                          <LocationImage />{" "}
                          {renderCountries(
                            data,
                            countries,
                            transnationalOptions
                          )}
                        </>
                      )}
                  </>
                )}

                {(data?.subnationalCity || data?.q24SubnationalCity) && (
                  <>
                    <CityImage />{" "}
                    {data?.subnationalCity
                      ? data?.subnationalCity
                      : data?.q24SubnationalCity}
                  </>
                )}
              </div>

              {data?.languages && (
                <span className="detail-item">
                  {data?.languages
                    .map((language) => isoConv(language?.isoCode) || "")
                    .join(", ")}
                </span>
              )}
            </Col>
          </Row>
        </Col>
      </Row>

      <Col>
        {/* CONNECTION */}
        {data?.stakeholderConnections &&
          data?.stakeholderConnections?.length > 0 && (
            <Col className="section">
              <h3 className="content-heading">Connections</h3>

              <Avatar.Group
                maxCount={2}
                size="large"
                maxStyle={{
                  color: "#f56a00",
                  backgroundColor: "#fde3cf",
                  cursor: "pointer",
                  height: 51,
                  width: 51,
                }}
              >
                {data?.stakeholderConnections.filter(
                  (x) =>
                    x.stakeholderRole !== "ADMIN" || x.role === "interested in"
                )?.length > 0 &&
                  data?.stakeholderConnections
                    .filter(
                      (x) =>
                        x.stakeholderRole !== "ADMIN" ||
                        x.role === "interested in"
                    )
                    .map((connection, index) => (
                      <Avatar
                        className="related-content-avatar"
                        style={{ border: "none", height: 51, width: 51 }}
                        key={index}
                        src={
                          <Avatar
                            avatar={<Avatar src={connection} />}
                            style={{
                              backgroundColor: "#09689A",
                              verticalAlign: "middle",
                            }}
                            size={51}
                            title={
                              <Link to={`/stakeholder/${connection}`}>
                                {connection}
                              </Link>
                            }
                          >
                            {connection}
                          </Avatar>
                        }
                      />
                    ))}
              </Avatar.Group>
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
          <p className="content-paragraph">
            <div
              className="list documents-list"
              dangerouslySetInnerHTML={{ __html: data?.infoDocs }}
            />
          </p>
        </Col>
      )}

      <Col className="section">
        <h3 className="content-heading">Records</h3>
        <div>
          <table className="record-table">
            <tbody>
              <tr className="record-row">
                <td>Year</td>
                <td className="record-value">2</td>
              </tr>
              <tr className="record-row">
                <td>Valid from</td>
                <td className="record-value">2</td>
              </tr>
              <tr className="record-row">
                <td>Valid until</td>
                <td className="record-value">2</td>
              </tr>
              <tr className="record-row">
                <td>Amount Invested</td>
                <td className="record-value">2</td>
              </tr>
              <tr className="record-row">
                <td>In Kind Contributions</td>
                <td className="record-value">2</td>
              </tr>
              <tr className="record-row">
                <td>Funding Type</td>
                <td className="record-value">2</td>
              </tr>
              <tr className="record-row">
                <td>Funding Name</td>
                <td className="record-value">2</td>
              </tr>
              <tr className="record-row">
                <td>Focus Area:</td>
                <td className="record-value">2</td>
              </tr>
              <tr className="record-row">
                <td>Lifecycle Phase</td>
                <td className="record-value">2</td>
              </tr>
              <tr className="record-row">
                <td>Sector</td>
                <td className="record-value">2</td>
              </tr>
              <tr className="record-row">
                <td>Initiative Owner</td>
                <td className="record-value">2</td>
              </tr>
              <tr className="record-row">
                <td>Entity Type</td>
                <td className="record-value">2</td>
              </tr>
              <tr className="record-row">
                <td>Initiative Term</td>
                <td>2</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Col>

      {/* COMMENTS */}
      <Col className="section comment-section">
        <h3 className="content-heading">Discussion</h3>
        <Row>
          <List
            className="comment-list"
            itemLayout="horizontal"
            dataSource={testData}
            renderItem={(item) => (
              <li>
                <Comment
                  // actions={item.actions}
                  author={item.author}
                  avatar={item.avatar}
                  content={item.content}
                  datetime={item.datetime}
                />
              </li>
            )}
          />
        </Row>
      </Col>
      <Col className="input-wrapper">
        <MessageOutlined className="message-icon" />
        <Input
          className="comment-input"
          placeholder="Join the discussion..."
          suffix={<SendOutlined />}
        />
      </Col>
    </div>
  );
};

export default DetailView;
