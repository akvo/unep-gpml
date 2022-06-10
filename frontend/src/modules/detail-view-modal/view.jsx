import React, { useState } from "react";
import "./style.scss";
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

const DetailViewModal = () => {
  const [isShownModal, setIsShownModal] = useState(true);
  const data = [
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
            <h3 className="modal-resource-type content-heading">Action plan</h3>
            <h4 className="modal-resource-title">
              A Green Future: Our 25 Year Plan To Improve The Environment
            </h4>
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
          className="resource-info"
          gutter={{
            lg: 24,
          }}
        >
          <Col lg={12}>
            <img className="resource-image" src={TestImage} alt="" />
          </Col>
          <Col lg={12}>
            <Row>
              <h3 className="content-heading">Description</h3>
              <p className="content-paragraph">
                This 25 Year Environment Plan sets out government action to help
                the natural world regain and retain good health. It aims to
                deliver cleaner air and water in our cities and rural
                landscapes, protect threatened species and provide richer
                wildlife habitats. It calls for an approach to agriculture,
                forestry, land use and fishing that puts the environment first.
                The Plan looks forward to delivering a Green Brexit ? seizing
                this once-in-alifetime chance to reform our agriculture and
                fisheries management, how we restore nature, and how we care for
                our land, our rivers and our seas.
              </p>
            </Row>
            <Row>
              <Col>
                <h3 className="content-heading">Location & Geocoverage</h3>
                <span className="detail-item">Geocoverage: National</span>
                <div className="detail-item">
                  {["United Kingdom", "France", "Belgium", "Germany"]
                    .map((location) => location)
                    .join(", ")}
                </div>

                <span className="detail-item">English</span>
              </Col>
            </Row>
          </Col>
        </Row>

        <Col>
          {/* CONNECTION */}
          <Col>
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
              {["a", "b", "c"].map((connection, index) => (
                <Avatar
                  className="related-content-avatar"
                  style={{ border: "none", height: 51, width: 51 }}
                  key={index}
                  src={
                    <Avatar
                      style={{
                        backgroundColor: "#09689A",
                        verticalAlign: "middle",
                      }}
                      size={51}
                    >
                      {connection}
                    </Avatar>
                  }
                />
              ))}
            </Avatar.Group>
          </Col>

          {/* TAGS */}
          <Col className="section">
            <h3 className="content-heading">Tags</h3>
            <List itemLayout="horizontal">
              <List.Item>
                <List.Item.Meta
                  title={
                    <ul className="tag-list">
                      {[
                        "Reducing plastics",
                        "Action Plan",
                        "Urban Area (Environment)",
                      ].map((tag) => (
                        <li className="tag-list-item" key={tag}>
                          <Tag className="resource-tag">{tag}</Tag>
                        </li>
                      ))}
                    </ul>
                  }
                />
              </List.Item>
            </List>
          </Col>
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
              dataSource={data}
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
          <Col className="input-wrapper">
            <MessageOutlined className="message-icon" />
            <Input
              className="comment-input"
              placeholder="Join the discussion..."
              suffix={<SendOutlined />}
            />
          </Col>
        </Col>
      </Modal>
    </div>
  );
};

export default DetailViewModal;
