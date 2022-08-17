import React from "react";
import "./stakeholder-carousel.scss";
import { Card, Avatar } from "antd";
import { Link } from "react-router-dom";
import { UIStore } from "../../store";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper";
// swiper bundle styles
import "swiper/swiper.min.css";

// import "swiper/modules/free-mode/free-mode.min.css";
import "swiper/modules/navigation/navigation.scss";
import "swiper/modules/pagination/pagination.min.css";
import "swiper/modules/thumbs/thumbs.min.css";

import { randomColor } from "../../utils/misc";
import { ReactComponent as LocationIcon } from "../../images/location.svg";
import { ReactComponent as CircledUserIcon } from "../../images/stakeholder-overview/union-outlined.svg";

const colour = () =>
  randomColor[Math.floor(Math.random() * randomColor.length)];

const StakeholderCarousel = ({ stakeholders }) => {
  const { countries } = UIStore.useState((s) => ({
    countries: s.countries,
    organisations: s.organisations,
    landing: s.landing,
  }));

  return (
    <div className="connection-wrapper">
      <Swiper
        spaceBetween={0}
        slidesPerGroup={window.innerWidth > 1024 ? 5 : 1}
        slidesPerView={"auto"}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Pagination, Navigation]}
        className="connection-carousel"
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
              <SwiperSlide>
                <Link
                  to={
                    stakeholder?.type === "entity"
                      ? `/organisation/${stakeholder?.entityId}`
                      : `/stakeholder/${stakeholder?.stakeholderId}`
                  }
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
              </SwiperSlide>
            );
          })}
      </Swiper>
    </div>
  );
};

export default StakeholderCarousel;
