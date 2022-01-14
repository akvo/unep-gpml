import React from "react";
import moment from "moment";
import { TrimText } from "../../utils/string";

const Banner = ({ image, title, category, credit }) => (
  <div className="banner_info">
    <div className="banner_img">
      <img src={image} alt={title || ""} style={{ width: "100%" }} />
      {credit && (
        <div className="photo_credit">
          <div>
            <span>{credit?.name ? `Photo by ${credit.name}` : ""}</span>
          </div>
          {credit?.date || ""}
        </div>
      )}
    </div>
    <div className="event_details">
      <span className="title">{category || "Webinar"}</span>
      <div className="site_title">
        <h1>
          <TrimText text={title || ""} max={100} />
        </h1>
      </div>
      <div className="event_date">{moment().format("DD MMMM YYYY")}</div>
      <div className="location"></div>
    </div>
  </div>
);

export default Banner;
