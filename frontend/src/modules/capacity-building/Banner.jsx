import React from "react";
import moment from "moment";
import { Typography } from "antd";

const { Title, Text } = Typography;

const Banner = ({
  platformLink,
  startDate,
  category,
  created,
  image,
  title,
  credit,
}) => (
  <a href={platformLink} target="_blank" rel="noopener noreferrer">
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
        <span className="text-upper">
          <Text className="label">{category || "Webinar"}</Text>
        </span>
        <div className="site_title">
          <Title level={title.length <= 70 ? 1 : 2}>{title}</Title>
        </div>
        <div className={`event_date ${category}`}>
          <Text className="label">
            {moment(startDate || created).format("DD MMMM YYYY")}
          </Text>
        </div>
        <div className="location"></div>
      </div>
    </div>
  </a>
);

export default Banner;
