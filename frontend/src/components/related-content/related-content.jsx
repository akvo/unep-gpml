import React from "react";
import "./style.scss";
import { Col, Avatar, Card } from "antd";
import Carousel from "react-multi-carousel";
import { ArrowRightOutlined } from "@ant-design/icons";
import { ReactComponent as LeftArrow } from "../../images/left-arrow.svg";
import { ReactComponent as RightArrow } from "../../images/right-arrow.svg";

const RelatedContent = ({ data, relatedContent, title }) => {
  const CardComponent = ({
    title,
    style,
    children,
    getRef,
    specificClassName,
  }) => {
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

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1200 },
      items: 7,
      slidesToSlide: 4,
    },
    desktop: {
      breakpoint: { max: 1199, min: 992 },
      items: 7,
      slidesToSlide: 3,
    },
    tablet: {
      breakpoint: { max: 991, min: 768 },
      items: 5,
      slidesToSlide: 2,
    },
    mobile: {
      breakpoint: { max: 599, min: 0 },
      items: 1,
      slidesToSlide: 1,
    },
  };

  return (
    <CardComponent
      title={
        <div className="related-content-title-wrapper">
          <div className="related-content-title">{title}</div>
          <div className="related-content-count">
            Total {relatedContent && relatedContent?.length}
          </div>
        </div>
      }
      getRef={relatedContent}
    >
      <Carousel
        centerMode={true}
        responsive={responsive}
        containerClass="related-content"
        itemClass="carousel-item"
        dotListClass="carousel-dot-list"
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
                className="description-holder"
                style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url(${item?.image})`,
                  backgroundPosition: "center",
                  backgroundSize: "calc(100% - 16px) calc(100% - 16px)",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div>
                  <h3>{item.title}</h3>
                  <h4>{data?.type ? data.type : ""}</h4>
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
                {item?.image && (
                  <img
                    className="related-content-image"
                    src={item?.image}
                    alt={item?.type}
                  />
                )}
              </div>
            </Col>
          );
        })}
      </Carousel>
    </CardComponent>
  );
};

export default RelatedContent;
