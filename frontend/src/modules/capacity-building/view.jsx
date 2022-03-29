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

const { Title } = Typography;

import "./styles.scss";

import Banner from "./Banner";
import capacities from "./json/capacity-building.json";
import slides from "./json/slider.json";

import SlidePrev from "../../images/capacity-building/slide-prev.svg";
import SlideNext from "../../images/capacity-building/slide-next.svg";
import LeftSidebar from "../left-sidebar/LeftSidebar";
import { CapacityCard } from "./CapacityCard";

import IconLibrary from "../../images/capacity-building/ic-knowledge-library.svg";
import IconLearning from "../../images/capacity-building/ic-capacity-building.svg";
import IconExchange from "../../images/capacity-building/ic-exchange.svg";
import IconCaseStudies from "../../images/capacity-building/ic-case-studies.svg";

const CapacityBuilding = () => {
  const slider = useRef();

  const sidebar = [
    {
      id: 1,
      title: "LIBRARY",
      url: "/knowledge-library",
      icon: IconLibrary,
    },
    {
      id: 2,
      title: "LEARNING",
      url: "/capacity-building",
      icon: IconLearning,
    },
    {
      id: 4,
      title: "Case studies",
      url: "/case-studies",
      icon: IconCaseStudies,
    },
  ];

  const prev = () => {
    slider.current.prev();
  };
  const next = () => {
    slider.current.next();
  };
  const groupCapacities = groupBy(capacities, "category");

  return (
    <Row id="capacity-building">
      <Col span={24} className="ui-header">
        <div className="ui-container">
          <div>
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
        <div className="">
          <LeftSidebar active={2} sidebar={sidebar}>
            <Row>
              <Col span={24} style={{ position: "relative" }}>
                <Carousel className="pm_event_banner" ref={slider}>
                  {slides.map((b, bx) => (
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
                      title={<span className="text-green text-upper">{g}</span>}
                      extra={
                        <Button
                          href="/knowledge-library"
                          target="_blank"
                          rel="noopener noreferrer"
                          type="ghost"
                        >
                          See all &gt;
                        </Button>
                      }
                    />
                    <div className="section-content">
                      <List
                        grid={{
                          gutter: 16,
                          xs: 1,
                          sm: 1,
                          md: 1,
                          lg: 2,
                          xl: 3,
                          xxl: 3,
                        }}
                        dataSource={groupCapacities[g] || []}
                        renderItem={(item) => {
                          return (
                            <List.Item>
                              <a
                                href={item.platform_link}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <CapacityCard {...item} />
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
