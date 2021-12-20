import React, { useState, useRef } from "react";
import { Carousel, PageHeader, Row, Col, List, Card, Button } from "antd";
import classNames from "classnames";
import { groupBy } from "lodash";
import moment from "moment";
import { TrimText } from "../../utils/string";
import Banner from "./Banner";
import Thumbnail from "./Thumbnail";
import capacities from "./json/capacity-building.json";
import IconLibrary from "../../images/capacity-building/ic_library.svg";
import IconLearning from "../../images/capacity-building/ic_learning.svg";
import IconExchange from "../../images/capacity-building/ic_exchange.svg";
import SlidePrev from "../../images/capacity-building/slide-prev.svg";
import SlideNext from "../../images/capacity-building/slide-next.svg";
import IconCaseStudies from "../../images/capacity-building/ic_case_studies.svg";
import "./styles.scss";

const CapacityBuilding = () => {
  const [activeMenu, setActiveMenu] = useState(1);
  const slider = useRef();
  const prev = () => {
    slider.current.prev();
  };
  const next = () => {
    slider.current.next();
  };
  const sidebar = [
    {
      id: 1,
      title: "LIBRARY",
    },
    {
      id: 2,
      title: "LEARNING",
    },
    {
      id: 3,
      title: "EXCHANGE",
    },
    {
      id: 4,
      title: "Case studies",
    },
  ];
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
  const icons = [IconLibrary, IconLearning, IconExchange, IconCaseStudies];
  return (
    <div id="capacity-building">
      <Row type="flex" className="bg-dark-primary">
        <Col>
          <PageHeader
            title={
              <span className="text-green">Capacity building & awareness</span>
            }
          />
        </Col>
      </Row>
      <Row type="flex">
        <Col lg={3} md={3} xs={24} order={1} className="sidebar">
          <Row type="flex" justify="center">
            {sidebar.map((s, sx) => (
              <Col
                key={sx}
                lg={24}
                md={24}
                xs={6}
                className={classNames("item-sidebar", {
                  active: activeMenu === s.id,
                })}
                onClick={() => setActiveMenu(s.id)}
              >
                <div style={{ margin: "auto", textAlign: "center" }}>
                  <img src={icons[sx] || IconLibrary} />
                  <p style={{ color: "#fff" }}>{s.title}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Col>
        <Col lg={21} md={21} xs={24} order={2}>
          <Row>
            <Col span={24} style={{ position: "relative" }}>
              <Carousel className="pm_event_banner" ref={slider}>
                {banners.map((b, bx) => (
                  <Banner key={bx} {...b} />
                ))}
              </Carousel>
              <div className="carousel-control">
                <img src={SlidePrev} className="carousel-prev" onClick={prev} />
                <img src={SlideNext} className="carousel-next" onClick={next} />
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
                            <Card
                              className={`card bg-color ${item.category_id}`}
                              bordered="false"
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
                                <span style={{ textAlign: "right" }}>
                                  <Button type="link" href={item.platform_link}>
                                    See more
                                  </Button>
                                </span>
                              </Card.Grid>
                            </Card>
                          </List.Item>
                        );
                      }}
                    />
                  </div>
                </div>
              ))}
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default CapacityBuilding;
