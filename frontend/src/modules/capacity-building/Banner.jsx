import React from "react";
import moment from "moment";

const Banner = ({ title, category, date }) => (
  <div className="banner_info">
    <div className="banner_img">
      <div className="photo_credit">
        <div>
          <span>Photo by Izdhaan Nizar</span>
        </div>
        21 Jun 2021
      </div>
    </div>
    <div className="event_details">
      <span className="title">{category || "Webinar"}</span>
      <div className="site_title">
        <h1>{title || ""}</h1>
      </div>
      <div className="event_date">
        {date || moment().format("DD MMMM YYYY")}
      </div>
      <div className="location"></div>
    </div>
  </div>
);

export default Banner;
