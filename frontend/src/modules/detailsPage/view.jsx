import React, {
  Fragment,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import "./styles.scss";
import { Row, Col, Tooltip, Typography, Card, List, Avatar } from "antd";
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
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { withRouter, useHistory } from "react-router-dom";
import uniqBy from "lodash/uniqBy";
import isEmpty from "lodash/isEmpty";
import { redirectError } from "../error/error-util";
import api from "../../utils/api";

const CardComponent = ({ title, style, children }) => {
  return (
    <div className="card-wrapper" style={style}>
      <Card title={title} bordered={false} style={style}>
        {children}
      </Card>
    </div>
  );
};

const TabComponent = ({ title, style, children, getRef }) => {
  return (
    <div className="tab-wrapper" style={style}>
      <ul>
        <li>
          <a href="#">Record</a>
        </li>
        <li>
          <a href="#">Documents And Info</a>
        </li>
        <li>
          <a onClick={() => getRef.current.scrollIntoView()}>Related Content</a>
        </li>
        <li>
          <a href="#">Reviews</a>
        </li>
      </ul>
    </div>
  );
};

const SharePanel = () => {
  return (
    <div className="sticky-panel">
      <div className="sticky-panel-item">
        <DownloadOutlined />
        <h2>View</h2>
      </div>
      <div className="sticky-panel-item">
        <HeartOutlined />
        <h2>Bookmark</h2>
      </div>
      <div className="sticky-panel-item">
        <ShareAltOutlined />
        <h2>Share</h2>
      </div>
      <div className="sticky-panel-item">
        <DeleteOutlined />
        <h2>Delete</h2>
      </div>
      <div className="sticky-panel-item">
        <EditOutlined />
        <h2>Update</h2>
      </div>
    </div>
  );
};

const DetailsView = ({
  match: { params },
  setStakeholderSignupModalVisible,
  setFilterMenu,
}) => {
  const relatedContent = useRef(null);

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
    <div id="details">
      <div className="section-header">
        <div className="ui container">
          <Row>
            <Col xs={24} lg={24}>
              <div className="header-wrapper">
                <img src={ActionGreen} />
                <div>
                  <Title level={2}>{data?.type}</Title>
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
            <Col xs={6} lg={6}>
              <img src={LeftImage} className="resource-image" />
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
                  <p>
                    A healthy Baltic Sea environment with diverse biological
                    components functioning in balance, resulting in a good
                    ecological status and supporting a wide range of sustainable
                    economic and social activities. Initially adopted in 2015,
                    the plan has already led to significant progress on marine
                    litter, including the development of a knowledge base and
                    various HELCOM commitments to address marine litter in the
                    Baltic Sea. In 2020, the revision of the HELCOM Regional
                    Action Plan on Marine Litter (RAP ML) has started. As a
                    first step, a thorough evaluation of the implementation of
                    each of the regional and voluntary national actions has been
                    initiated. The revision of the Action Plan is to be
                    conducted simultaneously and in connection with the revision
                    of the Baltic Sea Action Plan (BSAP), the RAP ML being one
                    of the key supplementary documents of the updated BSAP. Both
                    updates are to conclude in 2021.
                  </p>
                </CardComponent>
                <SharePanel />
              </div>
            </Col>
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
                <div className="list">
                  <List itemLayout="horizontal">
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={LocationImage} />}
                        title={
                          "Latvia, Poland, Germany, Sweden, Lithuania, Denmark, Russian Federation, Finland, Estonia"
                        }
                      />
                    </List.Item>
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={TransnationalImage} />}
                        title={"Transnational"}
                      />
                    </List.Item>
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={LanguageImage} />}
                        title={"English"}
                      />
                    </List.Item>
                  </List>
                </div>
              </CardComponent>

              <CardComponent
                title="Tags"
                style={{
                  marginBottom: "30px",
                }}
              >
                <div className="list">
                  <List itemLayout="horizontal">
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={TagsImage} />}
                        title={
                          "Action plan, macroplastics, microplastics, best practice, manual, mechanism, mechanism, state of knowledge, litter monitoring, prevention"
                        }
                      />
                    </List.Item>
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
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={EntityImage} />}
                        title={"Helcom"}
                        description={"Entity"}
                      />{" "}
                      <div className="see-more-button">See More</div>
                    </List.Item>
                  </List>
                  <List itemLayout="horizontal">
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={AvatarImage} />}
                        title={"Bertrand Lacaze"}
                        description={"Owner -  Helcom"}
                      />
                    </List.Item>
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={AvatarImage} />}
                        title={"Bertrand Lacaze"}
                        description={"Owner -  Helcom"}
                      />
                    </List.Item>
                  </List>
                  <List itemLayout="horizontal">
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
                  </List>
                </div>
              </CardComponent>
            </Col>
            <Col xs={18} lg={18}>
              <TabComponent
                style={{
                  marginBottom: "30px",
                }}
                getRef={relatedContent}
              />
              <CardComponent
                title="Record"
                style={{
                  marginBottom: "30px",
                }}
              >
                <div className="record-table">
                  <div className="record-table-wrapper">
                    <div>Amount Invested</div>
                    <div>USD 000</div>
                  </div>
                  <div className="record-table-wrapper">
                    <div>In Kind Contributions</div>
                    <div>USD 000</div>
                  </div>
                  <div className="record-table-wrapper">
                    <div>Funding Type</div>
                    <div>Not applicable</div>
                  </div>
                  <div className="record-table-wrapper">
                    <div>Funding Name</div>
                    <div>
                      Financial Rules of the Helsinki Commission can be found
                      here:
                      https://helcom.fi/about-us/internal-rules/internal-rules/
                    </div>
                  </div>
                  <div className="record-table-wrapper">
                    <div>Focus Area:</div>
                    <div>The Baltic Sea</div>
                  </div>
                </div>
              </CardComponent>
              <CardComponent
                title="Documents and info"
                style={{
                  marginBottom: "30px",
                }}
              >
                <div className="list documents-list">
                  <List itemLayout="horizontal">
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={TransnationalImage} />}
                        title={"www.link.fi"}
                      />
                    </List.Item>
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={TransnationalImage} />}
                        title={"www.link.fi"}
                      />
                    </List.Item>
                  </List>
                </div>
              </CardComponent>
              <CardComponent
                title="Related content (4)"
                style={{
                  marginBottom: "30px",
                }}
              >
                <Row
                  gutter={16}
                  className="related-content"
                  ref={relatedContent}
                >
                  <Col span={12}>
                    <Card title="INITIATIVE " bordered={false}>
                      <h4>
                        Legal limits on single-use plastics and microplastics{" "}
                      </h4>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Donec tempor ante ac leo cursus, quis fringilla elit
                        sagittis. Maecenas ac maximus massa...
                      </p>
                      <div className="bottom-panel">
                        <div>
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
                        </div>
                        <div className="read-more">
                          Read More <ArrowRightOutlined />
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="INITIATIVE " bordered={false}>
                      <h4>
                        Legal limits on single-use plastics and microplastics{" "}
                      </h4>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Donec tempor ante ac leo cursus, quis fringilla elit
                        sagittis. Maecenas ac maximus massa...
                      </p>
                      <div className="bottom-panel">
                        <div>
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
                        </div>
                        <div className="read-more">
                          Read More <ArrowRightOutlined />
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="INITIATIVE " bordered={false}>
                      <h4>
                        Legal limits on single-use plastics and microplastics{" "}
                      </h4>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Donec tempor ante ac leo cursus, quis fringilla elit
                        sagittis. Maecenas ac maximus massa...
                      </p>
                      <div className="bottom-panel">
                        <div>
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
                        </div>
                        <div className="read-more">
                          Read More <ArrowRightOutlined />
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="INITIATIVE " bordered={false}>
                      <h4>
                        Legal limits on single-use plastics and microplastics{" "}
                      </h4>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Donec tempor ante ac leo cursus, quis fringilla elit
                        sagittis. Maecenas ac maximus massa...
                      </p>
                      <div className="bottom-panel">
                        <div>
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
                        </div>
                        <div className="read-more">
                          Read More <ArrowRightOutlined />
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </CardComponent>
              <CardComponent
                title="Reviews (0)"
                style={{
                  marginBottom: "30px",
                }}
              />
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default DetailsView;
