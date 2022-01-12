import React, { useRef, useState } from "react";
import { Button, Carousel, Row, Col, Layout, Select } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

import "./styles.scss";
import datastudies from "./json/case-studies.json";
import CaseStudy from "./CaseStudy";
import LeftSidebar from "../left-sidebar/LeftSidebar";
import SlidePrev from "../../images/capacity-building/slide-prev.svg";
import SlideNext from "../../images/capacity-building/slide-next.svg";
import DropdownIcon from "../../images/case-studies/ic_dropdown.svg";

const { Header, Content } = Layout;

const CaseStudies = () => {
  const [indexSlide, setIndexSlide] = useState(0);

  const slider = useRef();
  const prev = () => {
    slider.current.prev();
  };
  const next = () => {
    slider.current.next();
  };
  const goTo = (index) => {
    setIndexSlide(index);
    slider.current.goTo(index);
  };
  return (
    <Row id="case-study">
      <Col span={24} className="ui-header">
        <div className="ui-container">
          <Row type="flex" justify="space-between" align="middle">
            <Col lg={5} sm={12} xs={24}>
              <Select
                defaultValue={0}
                onChange={(value) => goTo(value)}
                suffixIcon={
                  <img src={DropdownIcon} style={{ width: 30, height: 30 }} />
                }
                size="large"
              >
                {datastudies.map((c, cx) => (
                  <Select.Option key={cx} value={cx}>{`Case Study ${
                    cx + 1
                  }`}</Select.Option>
                ))}
              </Select>
            </Col>
            <Col lg={10} sm={12} xs={24} className="text-right">
              <div
                style={{
                  display: "flex",
                  justifyContent: "end",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                <div>
                  <Button
                    href={datastudies[indexSlide].external_url}
                    type="link"
                    shape="round"
                    className="green-border"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn More
                  </Button>
                </div>
                <div>
                  <Button className="btn-download">
                    Download as pdf&nbsp;
                    <DownloadOutlined />
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Col>
      <Col span={24}>
        <div className="ui-container">
          <LeftSidebar active={4}>
            <Carousel dots={false} ref={slider}>
              {datastudies?.map((c, cx) => (
                <CaseStudy {...c} key={cx} />
              ))}
            </Carousel>
            <div className="carousel-control">
              <img src={SlidePrev} className="carousel-prev" onClick={prev} />
              <img src={SlideNext} className="carousel-next" onClick={next} />
            </div>
          </LeftSidebar>
        </div>
      </Col>
    </Row>
  );
};

export default CaseStudies;
