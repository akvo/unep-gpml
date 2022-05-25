import React, { useRef, useState, useEffect } from "react";
import { Button, Carousel, Row, Col, Layout, Select } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

import "./styles.scss";
import datastudies from "./json/case-studies.json";
import CaseStudy from "./CaseStudy";
import LeftSidebar from "../../components/left-sidebar/left-sidebar";
import { ReactComponent as DropdownIcon } from "../../images/case-studies/ic-dropdown.svg";
import { titleCase } from "../../utils/string";

import { ReactComponent as IconLibrary } from "../../images/capacity-building/ic-knowledge-library.svg";
import { ReactComponent as IconLearning } from "../../images/capacity-building/ic-capacity-building.svg";
import { ReactComponent as IconExchange } from "../../images/capacity-building/ic-exchange.svg";
import { ReactComponent as IconCaseStudies } from "../../images/capacity-building/ic-case-studies.svg";

const { Header, Content } = Layout;

const CaseStudies = () => {
  const [isShownDropdown, setIsShownDropdown] = useState(false);
  const [indexSlide, setIndexSlide] = useState(0);
  const caseStudyReff = useRef();

  const sidebar = [
    {
      id: 1,
      title: "Library",
      url: "/knowledge/library",
      icon: <IconLibrary />,
    },
    {
      id: 2,
      title: "Learning",
      url: "/knowledge/capacity-building",
      icon: <IconLearning />,
    },
    {
      id: 4,
      title: "Case studies",
      url: "/knowledge/case-studies",
      icon: <IconCaseStudies />,
    },
  ];

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
          <Row gutter={[8, 16]} className="header-form">
            <Col lg={6} md={24} className="case-study-mobile-dropdown">
              <Col lg={6} md={24}>
                {!isShownDropdown && (
                  <Button
                    className="toggle-dropdown"
                    onClick={() => setIsShownDropdown(!isShownDropdown)}
                  >
                    <DropdownIcon />
                  </Button>
                )}
                {isShownDropdown && (
                  <Select
                    dropdownClassName="overlay-zoom"
                    className="case-study-dropdown"
                    defaultValue={0}
                    onChange={(value) => goTo(value)}
                    suffixIcon={<DropdownIcon />}
                    virtual={false}
                    size="large"
                    value={indexSlide}
                  >
                    {datastudies.map((c, cx) => (
                      <Select.Option key={cx} value={cx}>
                        {titleCase(c.title)}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Col>
            </Col>
            <Col lg={6} md={24} className="case-study-desktop-dropdown">
              <Col lg={6} md={24}>
                <Select
                  dropdownClassName="overlay-zoom"
                  className="case-study-dropdown"
                  defaultValue={0}
                  onChange={(value) => goTo(value)}
                  suffixIcon={<DropdownIcon />}
                  virtual={false}
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
            </Col>

            <Col lg={18} md={24} className="text-right">
              <Button
                href={datastudies[indexSlide].platform_link || "#"}
                type="link"
                shape="round"
                className="green-border case-study-learn-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn More
              </Button>
              <a
                target="_blank"
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
          <LeftSidebar active={4} sidebar={sidebar}>
            <Carousel
              dots={false}
              ref={slider}
              afterChange={(index) => setIndexSlide(index)}
            >
              {datastudies?.map((c, cx) => (
                <CaseStudy {...c} key={cx} />
              ))}
            </Carousel>
            <div className="carousel-control">
              <button className="carousel-prev" onClick={prev}>
                <DropdownIcon />
              </button>

              <button className="carousel-next" onClick={next}>
                <DropdownIcon />
              </button>
            </div>
          </LeftSidebar>
        </div>
      </Col>
    </Row>
  );
};

export default CaseStudies;
