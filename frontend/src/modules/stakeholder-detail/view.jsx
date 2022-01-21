import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import "./styles.scss";
import { Row, Col, Button, Switch, Avatar, List, Card } from "antd";
import StickyBox from "react-sticky-box";
import AvatarImage from "../../images/stakeholder/Avatar.png";
import StakeholderRating from "../../images/stakeholder/stakeholder-rating.png";
import LocationImage from "../../images/location.svg";
import EntityImage from "../../images/entity.png";

const CardComponent = ({ title, style, children, getRef }) => {
  return (
    <div className="card-wrapper" style={style} ref={getRef}>
      <Card title={title} bordered={false} style={style}>
        {children}
      </Card>
    </div>
  );
};

const StakeholderDetail = () => {
  return (
    <div id="stakeholder-detail">
      <StickyBox style={{ zIndex: 10 }}>
        <div className="topbar-container">
          <div className="ui container">
            <Row>
              <Col xs={24} lg={24}>
                <div className="topbar-wrapper">
                  <div className="topbar-image-holder">
                    <img src={AvatarImage} />
                  </div>
                  <div className="topbar-title-holder">
                    <h1>Jean Edouard Morizot</h1>
                    <p>
                      <span>
                        <img src={StakeholderRating} />
                      </span>
                      Expert: Marine Litter
                    </p>
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
            <Col xs={6} lg={6}>
              <CardComponent title="Basic info">
                <div className="list ">
                  <List itemLayout="horizontal">
                    <List.Item className="location">
                      <List.Item.Meta
                        avatar={<Avatar src={LocationImage} />}
                        title="France"
                      />
                    </List.Item>
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={EntityImage} />}
                        title={"Helcom"}
                        description={"Entity"}
                      />
                    </List.Item>
                  </List>
                </div>
              </CardComponent>
              <CardComponent title="Contact info" />
            </Col>
            <Col xs={18} lg={18}></Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default StakeholderDetail;
