import React, { useState, useRef } from "react";
import {
  Layout,
  Carousel,
  PageHeader,
  Typography,
  Row,
  Col,
  List,
  Card,
  Button,
} from "antd";
import { groupBy } from "lodash";
import moment from "moment";

const { Title } = Typography;

import "./styles.scss";
import { TrimText } from "../../utils/string";
import Banner from "./Banner";
import Thumbnail from "./Thumbnail";
import capacities from "./json/capacity-building.json";
import SlidePrev from "../../images/capacity-building/slide-prev.svg";
import SlideNext from "../../images/capacity-building/slide-next.svg";
import LeftSidebar from "../left-sidebar/LeftSidebar";

const { Content, Header } = Layout;

const CapacityBuilding = () => {
  const slider = useRef();
  const prev = () => {
    slider.current.prev();
  };
  const next = () => {
    slider.current.next();
  };
  const banners = [
    {
      uid: 1,
      title:
        "Third COBSEA Webinar on the Post-2020 Global Biodiversity Framework",
      date: moment().format("DD MMMM YYYY"),
      category: "Webinar",
    },
    {
      uid: 2,
      title:
        "Troisième webinaire COBSEA sur le cadre mondial de la biodiversité post-2020",
      date: moment().format("DD MMMM YYYY"),
      category: "Webinar",
    },
  ];
  const groupCapacities = groupBy(capacities, "category");

  return (
    <Row id="capacity-building">
      <Col span={24} className="ui-header">
        <div className="ui-container">
          <div style={{ display: "flex", height: 75 }}>
            <div style={{ margin: "auto 0" }}>
              <Title level={3}>
                <span className="text-green">
                  Capacity building &amp; awareness
                </span>
              </Title>
            </div>
          </div>
        </div>
      </Col>
      <Col span={24}>
        <div className="ui-container">
          <LeftSidebar active={2}>
            <Row>
              <Col span={24} style={{ position: "relative" }}>
                <Carousel className="pm_event_banner" ref={slider}>
                  {banners.map((b, bx) => (
                    <Banner key={bx} {...b} />
                  ))}
                </Carousel>
                <div className="carousel-control">
                  <img
                    src={SlidePrev}
                    className="carousel-prev"
                    onClick={prev}
                  />
                  <img
                    src={SlideNext}
                    className="carousel-next"
                    onClick={next}
                  />
                </div>
              </Col>
              <Col span={24} style={{ padding: "0 16px", marginTop: 45 }}>
                {Object.keys(groupCapacities)?.map((g, gx) => (
                  <div
                    className={`capacity-section bg-image ${groupCapacities[g][0]?.category_id}`}
                    key={gx}
                  >
                    <PageHeader
                      title={<span className="text-green">{g}</span>}
                      extra={<Button type="ghost">See all &gt;</Button>}
                    />
                    <div className="section-content">
                      <List
                        grid={{
                          gutter: 16,
                          xs: 1,
                          sm: 1,
                          md: 2,
                          lg: 3,
                          xl: 3,
                          xxl: 3,
                        }}
                        dataSource={groupCapacities[g] || []}
                        renderItem={(item) => {
                          const thumb =
                            item.category_id === "events"
                              ? { width: 172, height: 114 }
                              : {};
                          return (
                            <List.Item>
                              <a
                                href={item.platform_link}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Card
                                  className={`card bg-color ${item.category_id}`}
                                  bordered="false"
                                  hoverable
                                >
                                  <Card.Grid
                                    className={`left ${item.category_id}`}
                                    bordered="false"
                                    hoverable
                                  >
                                    <Thumbnail url={item.image} {...thumb} />
                                  </Card.Grid>
                                  <Card.Grid
                                    className={`right ${item.category_id}`}
                                    bordered="false"
                                    hoverable={false}
                                  >
                                    <span className="title">
                                      <TrimText text={item.title} max={95} />
                                    </span>
                                    <span className="see-more">See more</span>
                                  </Card.Grid>
                                </Card>
                              </a>
                            </List.Item>
                          );
                        }}
                      />
                    </div>
                  </div>
                ))}
              </Col>
            </Row>
          </LeftSidebar>
        </div>
      </Col>
    </Row>
  );
};

export default CapacityBuilding;
