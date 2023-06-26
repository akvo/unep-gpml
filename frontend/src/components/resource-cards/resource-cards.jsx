import React from "react";
import "./style.scss";
import { Col, Avatar } from "antd";
import classNames from "classnames";
import { ArrowRightOutlined } from "@ant-design/icons";
import technicalResource from "../../images/placeholders/technical-resource-placeholder.png";
import actionPlan from "../../images/placeholders/action-plan-placeholder.png";
import policy from "../../images/placeholders/policy-placeholder.png";
import financingResource from "../../images/placeholders/financing-resource-placeholder.png";
import technology from "../../images/placeholders/technology-placeholder.png";
import initiative from "../../images/placeholders/initiative-placeholder.png";
import event from "../../images/placeholders/event-placeholder.png";
import { topicNames } from "../../utils/misc";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination as SwiperPagination, Navigation } from "swiper";
// swiper bundle styles
import "swiper/swiper.min.css";
import "swiper/modules/free-mode/free-mode.min.css";
import "swiper/modules/navigation/navigation.scss";
import "swiper/modules/pagination/pagination.min.css";
import { Link } from "react-router-dom";

const Card = ({ showMoreCardClick, showMoreCardHref, children }) => {
  if (showMoreCardClick) {
    return (
      <div className="card" onClick={showMoreCardClick}>
        {children}
      </div>
    );
  }
  if (showMoreCardHref) {
    return (
      <Link className="card" to={showMoreCardHref}>
        {children}
      </Link>
    );
  }
  return children;
};

const ResourceCards = ({
  items,
  showMoreCard,
  showMoreCardAfter = 0,
  showMoreCardClick,
  showMoreCardHref,
  firstCard,
  showModal = () => null,
}) => {
  if (showMoreCardAfter > 0) {
    if (showMoreCardAfter < items?.length) {
      showMoreCard = (
        <Card {...{ showMoreCardClick, showMoreCardHref }}>
          <div className="resources-count">
            <span className="count">+{items.length - showMoreCardAfter}</span>
            <p>resources</p>
          </div>

          <div className="read-more">
            View All <ArrowRightOutlined />
          </div>
        </Card>
      );
    }
  }

  return (
    <Swiper
      spaceBetween={0}
      slidesPerGroup={4}
      slidesPerView={"auto"}
      pagination={{
        clickable: true,
      }}
      navigation={true}
      modules={[SwiperPagination, Navigation]}
      className="resource-cards"
    >
      {firstCard && <SwiperSlide>{firstCard}</SwiperSlide>}
      {items?.slice(0, showMoreCardAfter).map((item) => {
        return (
          <SwiperSlide key={item?.id}>
            <ResourceCard item={item} showModal={showModal} />
          </SwiperSlide>
        );
      })}
      {showMoreCard && (
        <SwiperSlide className="show-more-card">{showMoreCard}</SwiperSlide>
      )}
    </Swiper>
  );
};

const getType = (type) => {
  let t = "";
  switch (type) {
    case "Action Plan":
      t = "action_plan";
      break;
    case "Event":
      t = "event";
      break;
    case "Initiative":
      t = "initiative";
      break;
    case "Policy":
      t = "policy";
      break;
    case "Financing Resource":
      t = "financing_resource";
      break;
    case "Technical Resource":
      t = "technical_resource";
      break;
    case "Technology":
      t = "technology";
      break;
    default:
      t = type;
  }
  return t;
};

const getThumbnail = (item) => {
  if (item?.thumbnail) return item.thumbnail;
  if (item?.image) return item.image;
  if (
    item?.type === "action_plan" ||
    item?.type?.toLowerCase() === "action plan"
  ) {
    return actionPlan;
  }
  if (item?.type?.toLowerCase() === "policy") {
    return policy;
  }
  if (item?.type?.toLowerCase() === "technology") {
    return technology;
  }
  if (item?.type?.toLowerCase() === "event") {
    return event;
  }
  if (
    item?.type?.toLowerCase() === "initiative" ||
    item?.type?.toLowerCase() === "initiative"
  ) {
    return initiative;
  }
  if (
    item?.type === "technical_resource" ||
    item?.type?.toLowerCase() === "technical resource"
  ) {
    return technicalResource;
  }
  if (
    item?.type === "financing_resource" ||
    item?.type?.toLowerCase() === "financing resource"
  ) {
    return financingResource;
  }
};

export const ResourceCard = ({ item, index, showModal }) => {
  const innerContent = (
    <>
      <h3>{item.title}</h3>
      <div className="bottom-panel">
        {item?.entityConnections?.length > 0 && (
          <div className="connections">
            <Avatar.Group
              maxCount={2}
              size="large"
              maxStyle={{
                color: "#f56a00",
                backgroundColor: "#fde3cf",
                cursor: "pointer",
              }}
            >
              {item?.entityConnections?.map((connection, index) => (
                <Avatar
                  className="related-content-avatar"
                  style={{ border: "none" }}
                  key={item?.entity || index}
                  src={
                    connection?.image ? (
                      connection?.image
                    ) : item?.image ? (
                      item.image
                    ) : (
                      <Avatar
                        style={{
                          backgroundColor: "#09689A",
                          verticalAlign: "middle",
                        }}
                        size={40}
                      >
                        {item?.entity?.substring(0, 2)}
                      </Avatar>
                    )
                  }
                />
              ))}
            </Avatar.Group>
          </div>
        )}
        <h4>{item?.type ? topicNames(item?.type) : ""}</h4>
      </div>
    </>
  );
  let thumbnail = item.thumbnail;
  if (
    (!thumbnail && item.type === "financing_resource") ||
    item.type === "policy" ||
    item.type === "action_plan" ||
    item.type === "technical_resource"
  ) {
    thumbnail = item.image;
  }
  if (!thumbnail || thumbnail == null) {
    return (
      <div className="resource-card nothumb" key={item.id}>
        <Link
          id={item.id}
          to={`/${getType(item?.type)?.replace("_", "-")}/${item.id}`}
          type={getType(item?.type)?.replace("_", "-")}
          onClick={showModal}
          className="nothumb-container"
        >
          {innerContent}
        </Link>
      </div>
    );
  }
  return (
    <div className="resource-card" key={item.id}>
      <Link
        to={`/${getType(item?.type)?.replace("_", "-")}/${item.id}`}
        id={item.id}
        type={getType(item?.type)?.replace("_", "-")}
        className="description-holder"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url(${thumbnail})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
        onClick={showModal}
      >
        {innerContent}
      </Link>
      <div className="thumb-container">
        <img src={thumbnail} alt={item?.type} />
      </div>
    </div>
  );
};

export default ResourceCards;
