import React, { useRef, useState, useEffect } from "react";
import { Button, Carousel, Row, Col, Layout, Select } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

import "./styles.scss";
import datastudies from "./json/case-studies.json";
import CaseStudy from "./CaseStudy";
import LeftSidebar from "../left-sidebar/LeftSidebar";
import SlidePrev from "../../images/capacity-building/slide-prev.svg";
import SlideNext from "../../images/capacity-building/slide-next.svg";
import DropdownIcon from "../../images/case-studies/ic_dropdown.svg";
import { titleCase } from "../../utils/string";

const { Header, Content } = Layout;

const CaseStudies = () => {
  const [indexSlide, setIndexSlide] = useState(0);
  const caseStudyReff = useRef();

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

  useEffect(() => {
    window.scrollTo({
      behavior: "smooth",
      top: caseStudyReff.current.offsetTop,
    });
  }, []);
  return (
    <Row id="case-study" ref={caseStudyReff}>
      <Col span={24} className="ui-header">
        <div className="ui-container">
          <Row gutter={[8, 16]}>
            <Col lg={6} md={24}>
              <Select
                defaultValue={0}
                onChange={(value) => goTo(value)}
                suffixIcon={
                  <img src={DropdownIcon} style={{ width: 30, height: 30 }} />
                }
                size="large"
                value={indexSlide}
              >
                {datastudies.map((c, cx) => (
                  <Select.Option key={cx} value={cx}>
                    {titleCase(c.title)}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col lg={18} md={24} className="text-right">
              <Button
                href={datastudies[indexSlide].platform_link || "#"}
                type="link"
                shape="round"
                className="green-border"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn More
              </Button>
              <a
                href={
                  "https://wedocs.unep.org/bitstream/handle/20.500.11822/38223/Case-studies.pdf?sequence=1&isAllowed=y"
                }
              >
                <Button className="btn-download ml-1">
                  Download as pdf&nbsp;
                  <DownloadOutlined />
                </Button>
              </a>
            </Col>
          </Row>
        </div>
      </Col>
      <Col span={24}>
        <div className="">
          <LeftSidebar active={4}>
            <Carousel
              dots={false}
              ref={slider}
              afterChange={(index) => setIndexSlide(index)}
              effect="fade"
            >
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
