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
  ];
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1200 },
      items: 6,
      slidesToSlide: 6,
    },
    desktop: {
      breakpoint: { max: 1199, min: 992 },
      items: 5,
      slidesToSlide: 5,
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
      items: 0.7,
      slidesToSlide: 0.7,
    },
  };
  return (
    <div id="experts">
      <Row type="flex" className="body-wrapper">
        <LeftSidebar active={5} sidebar={sidebar}>
          <div className="expert-list-section">
            <div className="expert-top-tools">
              <div className="page-label">Showing 7 Of 16</div>
              <button className="view-button" shape="round" size="large">
                <div className="view-button-text ">Switch to grid view</div>
                {view === "map" ? <AppstoreOutlined /> : <GlobeIcon />}
              </button>
              <button className="sort-by-button">
                <SortIcon />
                <div className="sort-button-text">
                  <span>Sort by:</span>
                  <b>{`A>Z`}</b>
                </div>
              </button>
            </div>
            <Carousel responsive={responsive} containerClass="expert-carousel">
              {expert.map((item) => {
                return (
                  <Card key={item?.id}>
                    <ul className="expert-detail-list">
                      <img
                        className="expert-image"
                        src={item?.image}
                        alt={item?.name}
                      />

                      <li className="expert-name">{item?.name}</li>
                      <li className="expert-location">
                        <LocationIcon />
                        <span> {item?.location}</span>
                      </li>
                      <li className="expert-activity">{item?.activity}</li>
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
