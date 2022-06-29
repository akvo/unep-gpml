import React from "react";
import "./style.scss";
import { Col, Avatar, Card, Pagination } from "antd";
import Carousel from "react-multi-carousel";
import { Link } from "react-router-dom";
import { ArrowRightOutlined } from "@ant-design/icons";
import { ReactComponent as LeftArrow } from "../../images/left-arrow.svg";
import { ReactComponent as RightArrow } from "../../images/right-arrow.svg";
import technicalResource from "../../images/placeholders/technical-resource-placeholder.png";
import actionPlan from "../../images/placeholders/action-plan-placeholder.png";
import policy from "../../images/placeholders/policy-placeholder.png";
import financingResource from "../../images/placeholders/financing-resource-placeholder.png";
import technology from "../../images/placeholders/technology-placeholder.png";
import initiative from "../../images/placeholders/initiative-placeholder.png";
import event from "../../images/placeholders/initiative-placeholder.png";
import { topicNames } from "../../utils/misc";

const RelatedContent = ({
  url,
  data,
  title,
  relatedContent,
  dataCount,
  isShownCount,
  relatedContentCount,
  isShownPagination,
  relatedContentPage,
  getRelatedContent,
  responsive,
}) => {
  const CardComponent = ({ title, style, children, getRef }) => {
    return (
      <div
        className={`card-wrapper mb-10 related-content-wrapper`}
        ref={getRef}
      >
        <Card title={title} bordered={false} style={style}>
          {children}
        </Card>
      </div>
    );
  };

  const CustomRightArrow = ({ onClick, ...rest }) => {
    const {
      onMove,
      carouselState: { currentSlide },
    } = rest;

    return (
      <button
        className="react-multiple-carousel__arrow custom-right-arrow"
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
        className="react-multiple-carousel__arrow custom-left-arrow"
        onClick={() => onClick()}
      >
        <LeftArrow />
      </button>
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
        t = "project";
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
    if(item?.thumbnail) return item.thumbnail
    if(item?.image) return item.image
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
        item?.type?.toLowerCase() === "project"
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

  return (
    <CardComponent
      title={
        <div className="related-content-title-wrapper">
          <div className="related-content-title">{title}</div>
          {isShownCount && dataCount > 0 && (
            <div className="related-content-count">Total {dataCount}</div>
          )}
        </div>
      }
      getRef={relatedContent}
    >
      <Carousel
        centerMode={true}
        responsive={responsive}
        containerClass={`related-content ${
          isShownPagination && "content-with-pagination"
        }`}
        itemClass={`carousel-item ${
          dataCount > 20 && "carousel-with-extra-card"
        }`}
        dotListClass={`carousel-dot-list ${isShownPagination && "hidden-dot"}`}
        showDots={true}
        renderDotsOutside={true}
        customLeftArrow={<CustomLeftArrow />}
        customRightArrow={<CustomRightArrow />}
      >
        {relatedContent.map((item) => {
          return (
            <Col key={item?.id} className="card" span={12}>
              <a
                href={`/${getType(item?.type)}/${item.id}`}
                className={`description-holder ${
                  isShownPagination ? "with-pagination" : "no-pagination"
                }`}
                style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url(${
                    getThumbnail(item)
                  })`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div>
                  <h3>{item.title}</h3>
                  <h4>
                    {data?.type
                      ? topicNames(data?.type)
                      : item?.type
                      ? topicNames(item?.type)
                      : ""}
                  </h4>
                </div>
                <div className="bottom-panel">
                  <div>
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
                  <div className="read-more">
                    Read More <ArrowRightOutlined />
                  </div>
                </div>
              </a>
              <div className="slider-card">
                <img
                  className="related-content-image"
                  src={getThumbnail(item)}
                  alt={item?.type}
                />
              </div>
            </Col>
          );
        })}
        {dataCount > 20 && (
          <a
            href={`/knowledge/library${url ? url : ""}`}
            className="card"
            span={12}
          >
            <div className="resources-count">
              <span className="count">+{dataCount - 20}</span>
              <p>resources</p>
            </div>

            <div className="read-more">
              View All <ArrowRightOutlined />
            </div>
          </a>
        )}
      </Carousel>

      {isShownPagination && (
        <div className="pagination-wrapper">
          <Pagination
            showTitle={false}
            showSizeChanger={false}
            defaultCurrent={1}
            current={relatedContentPage + 1}
            pageSize={8}
            total={relatedContentCount || 0}
            onChange={(n, size) => getRelatedContent(n - 1)}
          />
        </div>
      )}
    </CardComponent>
  );
};

export default RelatedContent;
