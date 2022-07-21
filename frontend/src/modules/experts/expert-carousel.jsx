import React, { useEffect, useState } from "react";
import { Card, Avatar } from "antd";
import { Link } from "react-router-dom";
import { randomColor } from "../../utils/misc";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/swiper.min.css";
import { Pagination, Navigation } from "swiper";

import { ReactComponent as LocationIcon } from "../../images/location.svg";
import { ReactComponent as ExpertBadge } from "../../images/stakeholder-overview/expert-badge.svg";
import { ReactComponent as CircledUserIcon } from "../../images/stakeholder-overview/union-outlined.svg";
import InviteExpertCard from "./invite-expert-card";
import { titleCase } from "../../utils/string";

const ExpertCarousel = ({
  experts,
  countries,
  organisations,
  setIsShownModal,
  loading,
}) => {
  return (
    <Swiper
      spaceBetween={20}
      slidesPerGroup={window.innerWidth > 1024 ? 4 : 1}
      slidesPerView={"auto"}
      pagination={{
        clickable: true,
      }}
      navigation={true}
      modules={[Pagination, Navigation]}
      className="mySwiper"
    >
      {experts.experts.map((expert) => {
        const country = countries.find(
          (country) => country.id === expert.country
        )?.name;

        const entity = organisations.find(
          (organisation) => organisation.id === expert.affiliation
        );

        return (
          <SwiperSlide>
            <Link to={`/stakeholder/${expert?.id}`} key={expert?.id}>
              <Card>
                <div className="expert-detail-list">
                  <div className="list-item expert-image-wrapper">
                    {expert?.affiliation && (
                      <Avatar
                        className="entity-logo"
                        style={{
                          backgroundColor: randomColor(
                            entity?.name?.substring(0, 1)
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
                      className={`expert-image ${
                        !expert.picture && "no-image"
                      }`}
                      src={expert.picture}
                      style={{
                        backgroundColor: randomColor(
                          expert?.firstName?.substring(0, 1)
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
                      {expert?.expertise?.join(", ")}
                    </li>
                  </ul>
                </div>
              </Card>
            </Link>
          </SwiperSlide>
        );
      })}
      {(!loading || experts.length > 0) && (
        <SwiperSlide>
          <InviteExpertCard {...{ setIsShownModal }} />
        </SwiperSlide>
      )}
    </Swiper>
  );
};
export default ExpertCarousel;
