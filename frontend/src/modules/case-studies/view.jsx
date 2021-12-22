import React, { useRef } from "react";
import { Carousel } from "antd";

import "./styles.scss";
import datastudies from "./json/case-studies.json";
import CaseStudy from "./CaseStudy";
import LeftSidebar from "../left-sidebar/LeftSidebar";
import SlidePrev from "../../images/capacity-building/slide-prev.svg";
import SlideNext from "../../images/capacity-building/slide-next.svg";

const CaseStudies = () => {
  const slider = useRef();
  const prev = () => {
    slider.current.prev();
  };
  const next = () => {
    slider.current.next();
  };
  return (
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
  );
};

export default CaseStudies;
