import React from "react";
import "./stakeholder-carousel.scss";
import { Button, Row, Card, Avatar } from "antd";
import { Link, useHistory } from "react-router-dom";
import { UIStore } from "../../store";
import Carousel from "react-multi-carousel";
import { colors } from "../../utils/misc";
import { ReactComponent as LocationIcon } from "../../images/location.svg";
import { ReactComponent as ExpertBadge } from "../../images/stakeholder-overview/expert-badge.svg";
import { ReactComponent as PartnerBadge } from "../../images/stakeholder-overview/partner-badge.svg";
import { ReactComponent as GPMLMemberBadge } from "../../images/stakeholder-overview/member-of-gpml-badge.svg";
import { ReactComponent as LeftArrow } from "../../images/left-arrow.svg";
import { ReactComponent as RightArrow } from "../../images/right-arrow.svg";
// import { ReactComponent as CircledUserIcon } from "../../images/stakeholder-overview/union-outlined.svg";

const colour = () => colors[Math.floor(Math.random() * colors.length)];

const StakeholderCarousel = () => {
  const { countries } = UIStore.useState((s) => ({
    countries: s.countries,
    organisations: s.organisations,
    landing: s.landing,
  }));

  const stakeholders = [
    {
      id: 2,
      image:
        "https://directory.growasia.org/wp-content/uploads/solution_logos/0.jpg",
      role: "resource_editor",
      stakeholder: "Testing Profile",
      stakeholderId: 10003,
      stakeholderRole: "ADMIN",
      country: 380,
    },
    {
      id: 3,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
    {
      id: 4,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 380,
    },
    {
      id: 5,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
    {
      id: 7,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
    {
      id: 5,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
    {
      id: 5,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
    {
      id: 5,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
    {
      id: 5,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
    {
      id: 5,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
    {
      id: 5,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
    {
      id: 5,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
    {
      id: 5,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
    {
      id: 5,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
    {
      id: 5,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
    {
      id: 5,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
    {
      id: 5,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
    {
      id: 5,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
    {
      id: 5,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
    {
      id: 5,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
    {
      id: 5,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
    {
      id: 5,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
    {
      id: 5,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
    {
      id: 5,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
    {
      id: 5,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
    {
      id: 5,
      image: "/image/profile/5",
      role: "resource_editor",
      stakeholder: "Yagami Light",
      stakeholderId: 10005,
      stakeholderRole: "USER",
      country: 840,
    },
  ];

  const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  const CustomRightArrow = ({ onClick, ...rest }) => {
    const {
      onMove,
      carouselState: { currentSlide },
    } = rest;

    return (
      <button
        className="react-multiple-carousel__arrow custom-connection-right-arrow"
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
        className="react-multiple-carousel__arrow custom-connection-left-arrow"
        onClick={() => onClick()}
      >
        <LeftArrow />
      </button>
    );
  };

  return (
   <div className="connection-wrapper">
      <Carousel
      responsive={responsive}
      containerClass="connection-carousel"
      centerMode={true}
      responsive={responsive}
      dotListClass="connection-dot-list"
      showDots={true}
      renderDotsOutside={true}
      customLeftArrow={<CustomLeftArrow />}
      customRightArrow={<CustomRightArrow />}
    >
      {stakeholders.map((stakeholder) => {
        const country = countries.find(
          (country) => country.id === stakeholder?.country
        )?.name;

        return (
          <Card className="connection-card">
            <Avatar
              className={`connection-small-image ${
                !stakeholder?.image && "connection-no-image"
              }`}
              src={stakeholder.image}
              style={{ backgroundColor: colour() }}
              alt={stakeholder?.stakeholder}
            >
              {!stakeholder?.image && <CircledUserIcon />}
              <span>{`${stakeholder?.stakeholder?.substring(0, 1)}`}</span>
            </Avatar>

            <ul className="connection-detail-list">
              <li className="list-item connection-image-wrapper">
                <Avatar
                  className={`connection-image ${
                    !stakeholder?.image && "connection-no-image"
                  }`}
                  src={stakeholder.image}
                  style={{ backgroundColor: colour() }}
                  alt={stakeholder?.stakeholder}
                >
                  {!stakeholder?.image && <CircledUserIcon />}
                  <span>{`${stakeholder?.stakeholder?.substring(0, 1)}`}</span>
                </Avatar>
              </li>

              <li className="list-item connection-name">
                {`${stakeholder?.stakeholder}`}
              </li>
              <li className="list-item connection-location">
                <LocationIcon />
                <span>{country}</span>
              </li>
              <li className="list-item connection-activity">
                {stakeholder?.jobTitle}
              </li>
            </ul>
            <ul className="badge-list">
              <li>
                <GPMLMemberBadge />
              </li>
              {/* <li>
              <PartnerBadge />
            </li> */}
              {/* <li>
              <ExpertBadge />
            </li> */}
            </ul>
          </Card>
        );
      })}
    </Carousel>
   </div>
  );
};

export default StakeholderCarousel;
