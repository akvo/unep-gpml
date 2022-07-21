import React from "react";

import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/swiper.min.css";
import { Pagination, Navigation } from "swiper";

import InviteExpertCard from "./invite-expert-card";
import ExpertCard from "./expert-card";

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
      {experts.experts.map((expert) => 
        <SwiperSlide>
          <ExpertCard {...{ countries, organisations, expert }} />
        </SwiperSlide>
      )}
      {(!loading || experts.length > 0) &&
      <SwiperSlide>
        <InviteExpertCard {...{ setIsShownModal }} />
      </SwiperSlide>
      }
    </Swiper>
  );
};
export default ExpertCarousel;
