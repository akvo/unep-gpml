import React, { useState } from "react";
import { Button, Row, Card, Image } from "antd";
import Carousel from "react-multi-carousel";
import { AppstoreOutlined } from "@ant-design/icons";
import "./style.scss";
import LeftSidebar from "../../components/left-sidebar/left-sidebar";
import { ReactComponent as IconEvent } from "../../images/events/event-icon.svg";
import { ReactComponent as IconForum } from "../../images/events/forum-icon.svg";
import { ReactComponent as IconCommunity } from "../../images/events/community-icon.svg";
import { ReactComponent as IconPartner } from "../../images/stakeholder-overview/partner-icon.svg";
import { ReactComponent as ExpertIcon } from "../../images/stakeholder-overview/expert-icon.svg";
import { ReactComponent as SortIcon } from "../../images/knowledge-library/sort-icon.svg";
import { ReactComponent as GlobeIcon } from "../../images/transnational.svg";
import { ReactComponent as LocationIcon } from "../../images/location.svg";
import { ReactComponent as ExpertBadge } from "../../images/stakeholder-overview/expert-badge.svg";
import { ReactComponent as PartnerBadge } from "../../images/stakeholder-overview/partner-badge.svg";
import { ReactComponent as GPMLMemberBadge } from "../../images/stakeholder-overview/member-of-gpml-badge.svg";
import { ReactComponent as LeftArrow } from "../../images/left-arrow.svg";
import { ReactComponent as RightArrow } from "../../images/right-arrow.svg";

const Experts = () => {
  const sidebar = [
    { id: 1, title: "Events", url: "/connect/events", icon: <IconEvent /> },
    {
      id: 2,
      title: "Community",
      url: "/connect/community",
      icon: <IconCommunity />,
    },

    { id: 3, title: "Forums", url: null, icon: <IconForum /> },
    {
      id: 4,
      title: "Partners",
      url: "/connect/partners",
      icon: <IconPartner />,
    },
    {
      id: 5,
      title: "Experts",
      url: "/connect/experts",
      icon: <ExpertIcon />,
    },
  ];

  const [view, setView] = useState("map");
  const [isAscending, setIsAscending] = useState(null);

  const expert = [
    {
      id: 1,
      name: "Kaneki Ken",
      entity: "Akvo",
      image: "/image/profile/2",
      location: "France",
      activity: "Marine biologist",
      isExpert: true,
      isGPMLMember: true,
    },
    {
      id: 2,
      name: "Daniel",
      entity: "Akvo",
      image: "/image/profile/2",
      location: "France",
      activity: "Marine biologist",
      isExpert: true,
      isGPMLMember: true,
      isPartner: true,
    },
    {
      id: 3,
      name: "Light Yagami",
      entity: "Akvo",
      image: "/image/profile/2",
      location: "France",
      activity: "Marine biologist",
      isExpert: true,
      isGPMLMember: true,
      isPartner: true,
    },
    {
      id: 4,
      name: "Misa",
      entity: "Akvo",
      image: "/image/profile/2",
      location: "France",
      activity: "Marine biologist",
      isExpert: true,
      isPartner: true,
    },
    {
      id: 5,
      name: "Misa",
      entity: "Akvo",
      image: "/image/profile/2",
      location: "France",
      activity: "Marine biologist",
      isExpert: true,
      isPartner: true,
    },
    {
      id: 6,
      name: "Misa",
      entity: "Akvo",
      image: "/image/profile/2",
      location: "France",
      activity: "Marine biologist",
      isExpert: true,
      isPartner: true,
    },
  ];
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1200 },
      items: 7,
      slidesToSlide: 7,
    },
    desktop: {
      breakpoint: { max: 1199, min: 992 },
      items: 6,
      slidesToSlide: 6,
    },
    tablet: {
      breakpoint: { max: 991, min: 768 },
      items: 4,
      slidesToSlide: 4,
    },
    largeMobile: {
      breakpoint: { max: 767, min: 600 },
      items: 3,
      slidesToSlide: 3,
    },
    mobile: {
      breakpoint: { max: 599, min: 361 },
      items: 2,
      slidesToSlide: 2,
    },
    extraSmallMobile: {
      breakpoint: { max: 360, min: 0 },
      items: 1,
      slidesToSlide: 1,
    },
  };

  const CustomRightArrow = ({ onClick, ...rest }) => {
    const {
      onMove,
      carouselState: { currentSlide },
    } = rest;

    return (
      <button
        className="react-multiple-carousel__arrow custom-right-arrow expert-carousel-arrow"
        onClick={() => onClick()}
      >
        <RightArrow />
      </button>
    );
  };

  const CustomLeftArrow = ({ onClick, ...rest }) => {
    const {
      onMove,
      carouselState: { currentSlide },
    } = rest;

    return (
      <button
        className="react-multiple-carousel__arrow custom-left-arrow expert-carousel-arrow"
        onClick={() => onClick()}
      >
        <LeftArrow />
      </button>
    );
  };

  return (
    <div id="experts">
      <Row type="flex" className="body-wrapper">
        <LeftSidebar active={5} sidebar={sidebar}>
          <div className="expert-list-section">
            <div className="expert-top-tools">
              <div className="page-label">Showing 7 Of 16</div>
              <button
                className="view-button"
                shape="round"
                size="large"
                onClick={() => {
                  view === "map" ? setView("grid") : setView("map");
                }}
              >
                <div className="view-button-text ">
                  Switch to {`${view === "map" ? "grid" : "map"}`} view
                </div>
                {view === "map" ? <AppstoreOutlined /> : <GlobeIcon />}
              </button>
              <button
                className="sort-by-button"
                onClick={() => setIsAscending(!isAscending)}
              >
                <SortIcon
                  style={{
                    transform:
                      isAscending || isAscending === null
                        ? "initial"
                        : "rotate(180deg)",
                  }}
                />
                <div className="sort-button-text">
                  <span>Sort by:</span>
                  <b>{isAscending ? `A>Z` : "Z>A"}</b>
                </div>
              </button>
            </div>
            <Carousel
              responsive={responsive}
              dotListClass="expert-carousel-dots"
              showDots={true}
              renderDotsOutside={true}
              customLeftArrow={<CustomLeftArrow />}
              customRightArrow={<CustomRightArrow />}
              containerClass="expert-carousel"
            >
              {expert.map((item) => {
                return (
                  <Card key={item?.id}>
                    <ul className="expert-detail-list">
                      <li className="list-item expert-image-wrapper">
                        <img
                          src="https://storage.googleapis.com/akvo-unep-gpml/images/organisation_010_logo.PNG"
                          className="entity-logo"
                        />
                        <img
                          className="expert-image"
                          src={item?.image}
                          alt={item?.name}
                        />
                      </li>

                      <li className="list-item expert-name">{item?.name}</li>
                      <li className="list-item expert-location">
                        <LocationIcon />
                        <span> {item?.location}</span>
                      </li>
                      <li className="list-item expert-activity">
                        {item?.activity}
                      </li>
                    </ul>
                    <ul className="badge-list">
                      <li>
                        <GPMLMemberBadge />
                      </li>
                      <li>
                        <PartnerBadge />
                      </li>
                      <li>
                        <ExpertBadge />
                      </li>
                    </ul>
                  </Card>
                );
              })}
            </Carousel>
          </div>
        </LeftSidebar>
      </Row>
    </div>
  );
};

export default Experts;
