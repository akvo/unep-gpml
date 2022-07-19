import React, { useEffect, useState } from "react";
import { Card, Avatar } from "antd";
import { Link } from "react-router-dom";
import Carousel from "react-multi-carousel";
import { randomColor } from "../../utils/misc";

import { ReactComponent as LocationIcon } from "../../images/location.svg";
import { ReactComponent as ExpertBadge } from "../../images/stakeholder-overview/expert-badge.svg";
import { ReactComponent as LeftArrow } from "../../images/left-arrow.svg";
import { ReactComponent as RightArrow } from "../../images/right-arrow.svg";
import { ReactComponent as CircledUserIcon } from "../../images/stakeholder-overview/union-outlined.svg";
import { ReactComponent as StarOutlined } from "../../images/stakeholder-overview/star-outlined.svg";
import InviteExpertCard from "./invite-expert-card";
import { titleCase } from "../../utils/string";

const ExpertCarousel = ({
  experts,
  countries,
  organisations,
  setIsShownModal,
}) => {
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

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1200 },
      items: 2.5,
      slidesToSlide: 2.5,
    },
    desktop: {
      breakpoint: { max: 1199, min: 992 },
      items: 2,
      slidesToSlide: 2,
    },
    tablet: {
      breakpoint: { max: 991, min: 768 },
      items: 1.5,
      slidesToSlide: 1.5,
    },
    largeMobile: {
      breakpoint: { max: 767, min: 600 },
      items: 1,
      slidesToSlide: 1,
    },
    mobile: {
      breakpoint: { max: 599, min: 361 },
      items: 1,
      slidesToSlide: 1,
    },
    extraSmallMobile: {
      breakpoint: { max: 360, min: 0 },
      items: 1,
      slidesToSlide: 1,
    },
  };

  return (
    <Carousel
      centerMode={true}
      responsive={responsive}
      containerClass="expert-carousel"
      itemClass="expert-carousel-item"
      dotListClass="expert-carousel-dots"
      showDots={true}
      renderDotsOutside={true}
      autoPlaySpeed={100000}
      arrows
      draggable
      swipeable
      // customLeftArrow={<CustomLeftArrow />}
      // customRightArrow={<CustomRightArrow />}
    >
      {experts.experts.map((expert, index) => {
        const country = countries.find(
          (country) => country.id === expert.country
        )?.name;

        const entity = organisations.find(
          (organisation) => organisation.id === expert.affiliation
        );

        return (
          <Link to={`/stakeholder/${expert?.id}`}>
            <Card key={expert?.id}>
              <div className="expert-detail-list">
                <div className="list-item expert-image-wrapper">
                  {expert?.affiliation && (
                    <Avatar
                      className="entity-logo"
                      style={{
                        backgroundColor: randomColor(
                          entity?.name.substring(0, 1)
                        ),
                        verticalAlign: "middle",
                      }}
                      size={32}
                    >
                      {entity?.name?.substring(0, 2)}
                    </Avatar>
                  )}
                  <div className="expert-badge">
                    <ExpertBadge />
                  </div>
                  <Avatar
                    className={`expert-image ${!expert.picture && "no-image"}`}
                    src={expert.picture}
                    style={{
                      backgroundColor: randomColor(
                        expert?.firstName.substring(0, 1)
                      ),
                    }}
                    alt={expert?.firstName ? expert?.firstName : expert?.name}
                  >
                    {!expert.picture && <CircledUserIcon />}
                    <span>
                      {`${expert?.firstName
                        ?.substring(0, 1)
                        ?.toUpperCase()}${expert?.lastName
                        ?.substring(0, 1)
                        ?.toUpperCase()}`}
                    </span>
                  </Avatar>
                </div>
                <ul>
                  <li className="expert-name">
                    {`${titleCase(expert?.firstName)} ${titleCase(
                      expert?.lastName
                    )}`}
                  </li>
                  {expert?.country && (
                    <li className="expert-location">
                      <LocationIcon />
                      <span>{country}</span>
                    </li>
                  )}
                  <li className="expert-activity">
                    {expert.expertise.join(', ')}
                  </li>
                </ul>
              </div>
            </Card>
          </Link>
        );
      })}
      {/* <InviteExpertCard {...{ setIsShownModal }} /> */}
    </Carousel>
  );
};
export default ExpertCarousel;
