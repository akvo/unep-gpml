import React from "react";
import "./stakeholder-carousel.scss";
import { Card, Avatar } from "antd";
import { Link } from "react-router-dom";
import { UIStore } from "../../store";
import Carousel from "react-multi-carousel";
import { colors } from "../../utils/misc";
import { ReactComponent as LocationIcon } from "../../images/location.svg";
import { ReactComponent as LeftArrow } from "../../images/left-arrow.svg";
import { ReactComponent as RightArrow } from "../../images/right-arrow.svg";
import { ReactComponent as CircledUserIcon } from "../../images/stakeholder-overview/union-outlined.svg";

const colour = () => colors[Math.floor(Math.random() * colors.length)];

const StakeholderCarousel = ({ stakeholders }) => {
  const { countries } = UIStore.useState((s) => ({
    countries: s.countries,
    organisations: s.organisations,
    landing: s.landing,
  }));

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1200 },
      items: 4,
      slidesToSlide: 4,
    },
    desktop: {
      breakpoint: { max: 1199, min: 992 },
      items: 3,
      slidesToSlide: 3,
    },
    tablet: {
      breakpoint: { max: 991, min: 768 },
      items: 2,
      slidesToSlide: 2,
    },
    largeMobile: {
      breakpoint: { max: 767, min: 600 },
      items: 1.5,
      slidesToSlide: 1.5,
    },
    mobile: {
      breakpoint: { max: 599, min: 0 },
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
        dotListClass="connection-dot-list"
        showDots={true}
        renderDotsOutside={true}
        customLeftArrow={<CustomLeftArrow />}
        customRightArrow={<CustomRightArrow />}
        autoPlay={false}
      >
        {stakeholders
          .filter((x) => x.stakeholderRole !== "ADMIN")
          .map((stakeholder) => {
            const country = countries.find(
              (country) => country.id === stakeholder?.country
            )?.name;

            const name = stakeholder?.name?.split(" ");
            const firstInitial = name[0]?.substring(0, 1) || "";
            const secondInitial = name[1]?.substring(0, 1) || "";
            const initial = `${firstInitial}${secondInitial}`;

            return (
              <Link
                to={`/${
                  stakeholder?.type === "entity"
                    ? "organisation"
                    : "stakeholder"
                }/${stakeholder?.id}`}
              >
                <Card
                  className="connection-card"
                  key={stakeholder?.stakeholderId}
                >
                  <div
                    className={`connection-image-wrapper ${
                      !stakeholder?.image && "connection-no-image-wrapper"
                    }`}
                  >
                    <Avatar
                      className="connection-image"
                      src={stakeholder.image}
                      style={{ backgroundColor: colour() }}
                      alt={stakeholder?.name}
                    >
                      {!stakeholder?.image && <CircledUserIcon />}
                      <span>{initial}</span>
                    </Avatar>
                  </div>
                  <ul className="connection-detail-list">
                    <li className="list-item connection-name">
                      {stakeholder?.name}
                    </li>
                    {stakeholder?.type !== "entity" && country && (
                      <li className="list-item connection-location">
                        <LocationIcon />
                        <span>{country}</span>
                      </li>
                    )}
                    {stakeholder?.type === "entity" ? (
                      <li className="list-item  connection-role">ENTITY</li>
                    ) : stakeholder?.role === "owner" ? (
                      <li className="list-item  connection-role">OWNER</li>
                    ) : (
                      stakeholder?.jobTitle && (
                        <li className="list-item connection-job-title">
                          {stakeholder?.jobTitle}
                        </li>
                      )
                    )}
                  </ul>
                </Card>
              </Link>
            );
          })}
      </Carousel>
    </div>
  );
};

export default StakeholderCarousel;
