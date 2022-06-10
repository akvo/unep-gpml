import React, { useState, useEffect, useCallback } from "react";
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
} from "@ant-design/icons";
import TestImage from "../../images/landing-gpml.jpg";
import moment from "moment";
import { isEmpty } from "lodash";
import api from "../../utils/api";
import { UIStore } from "../../store";
import { titleCase } from "../../utils/string";
import { Link } from "react-router-dom";
import { topicNames } from "../../utils/misc";

const DetailViewModal = ({
  resourceType,
  resourceId,
  isShownModal,
  setIsShownModal,
  data,
}) => {
  const { profile, countries } = UIStore.useState((s) => ({
    profile: s.profile,
    countries: s.countries,
  }));

  const [relations, setRelations] = useState([]);
  const isConnectStakeholders = ["organisation", "stakeholder"].includes(
    resourceType
  );
  const isLoaded = useCallback(
    () =>
      Boolean(
        !isEmpty(countries) &&
          (isConnectStakeholders ? !isEmpty(profile) : true)
      ),
    [countries, profile, isConnectStakeholders]
  );

  useEffect(() => {
    if (isLoaded() && profile.reviewStatus === "APPROVED") {
      setTimeout(() => {
        api.get(`/favorite/${resourceType}/${resourceId}`).then((resp) => {
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

  return (
    <div id="detail-view-modal">
      <Button type="primary" onClick={() => setIsShownModal(true)}>
        Hide modal
      </Button>
      <Modal
        title={
          <div className="modal-header">
            <h3 className="modal-resource-type content-heading">
              {topicNames(resourceType)}
            </h3>
            <h4 className="modal-resource-title">{data?.title}</h4>
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
        }
        style={{
          top: 34,
        }}
        width={1037}
        visible={isShownModal}
        onCancel={() => setIsShownModal(false)}
      >
        <Row
          className="resource-info section"
          gutter={{
            lg: 24,
          }}
        >
          {data?.image && (
            <Col lg={12}>
              <img className="resource-image" src={data?.image} alt="" />
            </Col>
          )}
          <Col lg={data?.image ? 12 : 24}>
            <Row>
              <h3 className="content-heading">Description</h3>
              <p className="content-paragraph">{data?.summary}</p>
            </Row>
            <Row>
              <Col>
                <h3 className="content-heading">Location & Geocoverage</h3>
                <span className="detail-item">
                  Geocoverage: {titleCase(data?.geoCoverageType || "")}
                </span>
                <div className="detail-item">
                  {["United Kingdom", "France", "Belgium", "Germany"]
                    .map((location) => location)
                    .join(", ")}
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
                  {data?.stakeholderConnections?.map((connection, index) => (
                    <Avatar
                      className="related-content-avatar"
                      style={{ border: "none", height: 51, width: 51 }}
                      key={index}
                      src={
                        <Avatar
                          avatar={<Avatar src={connection?.image} />}
                          style={{
                            backgroundColor: "#09689A",
                            verticalAlign: "middle",
                          }}
                          size={51}
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
                        {data?.tags?.map((tag) => (
                          <li className="tag-list-item" key={tag}>
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
          {/* DATE */}
          <Row className="section section-date">
            <Col>
              <h3 className="content-heading">Year</h3>
              <span className="detail-item">2018</span>
            </Col>
            <Col>
              <h3 className="content-heading">Valid from</h3>
              <span className="detail-item">02 Apr 2018</span>
            </Col>
            <Col>
              <h3 className="content-heading">Valid until</h3>
              <span className="detail-item">Ongoing</span>
            </Col>
          </Row>
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
      </Modal>
    </div>
  );
};

export default DetailViewModal;
