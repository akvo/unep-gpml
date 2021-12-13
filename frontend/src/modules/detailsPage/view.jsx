import React from "react";
import "./styles.scss";
import {
  Row,
  Col,
  Select,
  Button,
  Switch,
  Radio,
  Popover,
  Steps,
  Typography,
  Card,
  List,
  Avatar,
} from "antd";
const { Title } = Typography;

import StickyBox from "react-sticky-box";
import ActionGreen from "../../images/action-green.png";
import LeftImage from "../../images/sea-dark.jpg";

const CardComponent = ({ title, style, children }) => {
  return (
    <div className="card-wrapper" style={style}>
      <Card title={title} bordered={false}>
        {children}
      </Card>
    </div>
  );
};

const TabComponent = ({ title, style, children }) => {
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
          <a href="#">Related Content</a>
        </li>
        <li>
          <a href="#">Reviews</a>
        </li>
      </ul>
    </div>
  );
};

function DetailsView() {
  return (
    <div id="details">
      <div className="section-header">
        <div className="ui container">
          <Row>
            <Col xs={24} lg={24}>
              <div className="header-wrapper">
                <img src={ActionGreen} />
                <div>
                  <Title level={2}>ACTION PLAN</Title>
                  <Title level={4}>
                    Regional Action Plan for Marine Litter in the Baltic Sea{" "}
                  </Title>
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
            <Col xs={18} lg={18}>
              <CardComponent
                title="Description"
                style={{
                  height: "100%",
                }}
              >
                <p>
                  A healthy Baltic Sea environment with diverse biological
                  components functioning in balance, resulting in a good
                  ecological status and supporting a wide range of sustainable
                  economic and social activities. Initially adopted in 2015, the
                  plan has already led to significant progress on marine litter,
                  including the development of a knowledge base and various
                  HELCOM commitments to address marine litter in the Baltic Sea.
                  In 2020, the revision of the HELCOM Regional Action Plan on
                  Marine Litter (RAP ML) has started. As a first step, a
                  thorough evaluation of the implementation of each of the
                  regional and voluntary national actions has been initiated.
                  The revision of the Action Plan is to be conducted
                  simultaneously and in connection with the revision of the
                  Baltic Sea Action Plan (BSAP), the RAP ML being one of the key
                  supplementary documents of the updated BSAP. Both updates are
                  to conclude in 2021.
                </p>
              </CardComponent>
            </Col>
          </Row>
        </div>
      </div>

      <div className="section-info">
        <div className="ui container">
          <Row gutter={[16, 16]}>
            <Col xs={6} lg={6}>
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
                        avatar={
                          <Avatar src="https://joeschmoe.io/api/v1/random" />
                        }
                        title={
                          "Latvia, Poland, Germany, Sweden, Lithuania, Denmark, Russian Federation, Finland, Estonia"
                        }
                      />
                    </List.Item>
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar src="https://joeschmoe.io/api/v1/random" />
                        }
                        title={"Transnational"}
                      />
                    </List.Item>
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar src="https://joeschmoe.io/api/v1/random" />
                        }
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
                        avatar={
                          <Avatar src="https://joeschmoe.io/api/v1/random" />
                        }
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
              />
            </Col>
            <Col xs={18} lg={18}>
              <TabComponent
                style={{
                  marginBottom: "30px",
                }}
              />
              <CardComponent
                title="Record"
                style={{
                  marginBottom: "30px",
                }}
              />
              <CardComponent
                title="Documents and info"
                style={{
                  marginBottom: "30px",
                }}
              />
              <CardComponent
                title="Related content (4)"
                style={{
                  marginBottom: "30px",
                }}
              />
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
}

export default DetailsView;
