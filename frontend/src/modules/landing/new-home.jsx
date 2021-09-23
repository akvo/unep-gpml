import { UIStore } from "../../store";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Button,
  Select,
  Card,
  Avatar,
  Tooltip,
  Calendar,
  Row,
  Col,
  Badge,
  Carousel as AntdCarousel,
} from "antd";
import {
  LoadingOutlined,
  LeftOutlined,
  RightOutlined,
  ArrowRightOutlined,
  RiseOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, withRouter } from "react-router-dom";
import Chart from "../../utils/chart";
import Carousel from "react-multi-carousel";
import "./new-styles.scss";
import "react-multi-carousel/lib/styles.css";
import moment from "moment";
import imageNotFound from "../../images/image-not-found.png";
import logoNotFound from "../../images/logo-not-found.png";
import { TrimText } from "../../utils/string";
import {
  popularTopics,
  featuredContents,
  ourCommunity,
  benefit,
} from "./new-home-static-content";
import orderBy from "lodash/orderBy";
import humps from "humps";
import { topicNames } from "../../utils/misc";
import sortBy from "lodash/sortBy";
import api from "../../utils/api";

const cardSvg = [
  {
    color: "#4DA687",
    svg: (
      <svg
        className="wave"
        viewBox="0 0 328 192"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 28.474C36.4971 -3.27254 127.977 -14.0546 190.069 25.4789C252.162 65.0125 304.775 68.6063 328 65.0126V182C328 187.523 323.523 192 318 192H9.99999C4.47714 192 0 187.523 0 182V28.474Z"
          fill="#4DA687"
        />
      </svg>
    ),
  },
  {
    color: "#2D6796",
    svg: (
      <svg
        className="wave"
        viewBox="0 0 329 194"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 59.4558C43.2645 44.5054 76.5448 -3.93028 159.27 0.255409C241.996 4.4411 297.621 30.1535 329 44.5055V184C329 189.523 324.523 194 319 194H10C4.47716 194 0 189.523 0 184L0 59.4558Z"
          fill="#2D6796"
        />
      </svg>
    ),
  },
  {
    color: "#384E85",
    svg: (
      <svg
        className="wave"
        viewBox="0 0 329 192"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 50.5541C149.762 107 147.86 0 218.699 0C269.571 0 280.983 17.1299 329 50.5541V182C329 187.523 324.523 192 319 192H10C4.47716 192 0 187.523 0 182V50.5541Z"
          fill="#384E85"
        />
      </svg>
    ),
  },
  {
    color: "#FFB800",
    svg: (
      <svg
        className="wave"
        viewBox="0 0 328 158"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M77.2601 6.52324C53.5604 31.4368 27.4913 50.3722 0 30.9385V147.536C0 154.711 6.63584 157.502 9.95376 158H318.52C325.725 158 327.842 151.356 328 148.034V57.8455C318.362 43.8937 281.075 1.04132 237.468 22.9659C186.582 48.5504 103.33 -20.8814 77.2601 6.52324Z"
          fill="#FFB800"
        />
      </svg>
    ),
  },
];

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 1200 },
    items: 4,
  },
  desktop: {
    breakpoint: { max: 1199, min: 992 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 991, min: 768 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 599, min: 0 },
    items: 1,
  },
};

const sortPopularTopic = orderBy(
  popularTopics,
  ["count", "topic"],
  ["desc", "desc"]
);
const defTopic = sortPopularTopic[0]?.topic?.toLocaleLowerCase();

const Landing = withRouter(
  ({
    history,
    setSignupModalVisible,
    setWarningModalVisible,
    isAuthenticated,
    loginWithPopup,
  }) => {
    const dateNow = moment.utc().format("DD-MM-YYYY");
    const { innerWidth, innerHeight } = window;
    const profile = UIStore.useState((s) => s.profile);
    const [selectedTopic, setSelectedTopic] = useState(defTopic);
    const [event, setEvent] = useState([]);
    const [data, setData] = useState(null);

    const isApprovedUser = profile?.reviewStatus === "APPROVED";
    const hasProfile = profile?.reviewStatus;
    const eventCarousel = useRef(null);
    const isMobileScreen = innerWidth <= 991;

    const handlePopularTopicChartClick = (params) => {
      const { name, tag } = params?.data;
      !isMobileScreen && setSelectedTopic(name.toLowerCase());
      isMobileScreen && history.push(`/browse?tag=${tag}`);
    };

    const handleOurCommunityProfileClick = () => {
      if (!isAuthenticated) {
        return loginWithPopup();
      }
      if (isAuthenticated && !hasProfile) {
        return history.push("/signup");
      }
      return setWarningModalVisible(true);
    };

    const dateCellRender = (value) => {
      const calendarDate = moment.utc(value).format("DD-MM-YYYY");
      if (data && data?.results) {
        const eventByDate = data.results
          .map((x) => {
            const startDate = moment.utc(x.startDate).format("DD-MM-YYYY");
            const endDate = moment.utc(x.endDate).format("DD-MM-YYYY");
            if (calendarDate >= startDate && calendarDate <= endDate) {
              return {
                ...x,
                date: calendarDate,
                isStart: calendarDate === startDate,
              };
            }
            return null;
          })
          .filter((x) => x);
        const start = eventByDate.filter(
          (x) => x.date === calendarDate && x.isStart
        );
        const highlight = eventByDate.filter(
          (x) => x.date === calendarDate && !x.isStart
        );
        if (start.length > 0) {
          return <Badge status="warning" />;
        }
        if (highlight.length > 0) {
          return <Badge status="default" />;
        }
        return "";
      }
      return;
    };

    const generateEvent = useCallback(
      (filterDate, searchNextEvent = false) => {
        const eventNow = data.results.filter((x, i) => {
          const date = moment.utc(x.startDate).format("DD-MM-YYYY");
          return date === filterDate;
        });
        if (!eventNow.length && searchNextEvent) {
          const nextDay = moment
            .utc(filterDate, "DD-MM-YYYY")
            .add(1, "days")
            .format("DD-MM-YYYY");
          generateEvent(nextDay, searchNextEvent);
        }
        if (eventNow.length || !searchNextEvent) {
          setEvent(eventNow);
        }
      },
      [data]
    );

    const handleOnDateSelected = (value) => {
      setEvent(null);
      const selectedDate = moment.utc(value).format("DD-MM-YYYY");
      generateEvent(selectedDate);
    };

    useEffect(() => {
      if (!data) {
        api.get("browse?topic=event").then((resp) => {
          setData(resp.data);
        });
      }
      if (data && data?.results) {
        generateEvent(dateNow, true);
      }
    }, [data, dateNow, generateEvent]);

    useEffect(() => {
      UIStore.update((e) => {
        e.disclaimer = "home";
      });
    }, []);

    return (
      <div id="landing">
        {/* Banner */}
        <div className="landing-container">
          <div className="landing-banner">
            <div className="ui container">
              <h1>
                Welcome to the Global Partnership on Marine Litter Digital
                Platform!
              </h1>
              <h2>Inform. Connect. Inspire.</h2>
              <div className="body-text">
                A partly open-source, multi-stakeholder platform that compiles
                different resources, connects stakeholders, and integrates data
                to guide action towards the long term elimination of marine
                litter and plastic pollution.{" "}
              </div>
              {!hasProfile && (
                <div>
                  <JoinGPMLButton
                    history={history}
                    loginWithPopup={loginWithPopup}
                  />
                  <Link to="/about-us">
                    <Button type="ghost" className="left">
                      Learn More
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Popular Topics */}
        <div className="popular-topics ui container section-container">
          <div className="section-title">
            <h2>
              Popular Topics
              <span className="see-more-link">
                <Link to="/topics">
                  See all topics <RightOutlined />
                </Link>
              </span>
            </h2>
          </div>
          <div className="body">
            <div className="chart-wrapper">
              <Chart
                key="popular-topic"
                title=""
                type="TREEMAP"
                height={500}
                className="popular-topic-chart"
                data={sortPopularTopic.map((x) => {
                  return {
                    id: x.id,
                    name: x.topic,
                    value: x.count,
                    tag: x.tag,
                  };
                })}
                onEvents={{
                  click: (e) => handlePopularTopicChartClick(e),
                }}
                selected={selectedTopic}
              />
            </div>
            {!isMobileScreen && (
              <div className="content">
                <div className="content-body">
                  {sortPopularTopic
                    .find((x) => x.topic.toLowerCase() === selectedTopic)
                    .items.map((x, i) => {
                      const { id, type, title, description } = x;
                      const link = `/${type
                        .toLowerCase()
                        .split(" ")
                        .join("_")}/${id}`;
                      return (
                        <div key={`summary-${i}`} className="item-body">
                          <div className="resource-label upper">
                            {topicNames(humps.camelizeKeys(type))}
                          </div>
                          <div className="asset-title">{title}</div>
                          <div className="body-text">
                            {TrimText({ text: description, max: 250 })}
                          </div>
                          <span className="read-more">
                            <Link to={link}>
                              Read more <ArrowRightOutlined />
                            </Link>
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
        <hr />
        {/* Featured Content */}
        <div className="featured-content ui container section-container">
          <div className="section-title">
            <h2>
              Featured Content{" "}
              <span className="see-more-link">
                <Link to="/browse">
                  See all <RightOutlined />
                </Link>
              </span>
            </h2>
          </div>
          <div className="body">
            <div className="content-left">
              {featuredContents
                .filter((x) => x.id !== 196)
                .map((x, i) => {
                  const { id, image, type, title, description, bookmark } = x;
                  const link = `/${type
                    .toLowerCase()
                    .split(" ")
                    .join("_")}/${id}`;
                  return (
                    <Card key={`fc-${i}`} className="item">
                      <div className="item-header">
                        <span className="resource-label upper">
                          {topicNames(humps.camelizeKeys(type))}
                        </span>
                        <span className="mark">
                          <RiseOutlined />
                          Trending
                        </span>
                      </div>
                      <div className="item-body">
                        <div className="asset-title">{title}</div>
                        <div className="body-text">
                          {TrimText({ text: description, max: 100 })}
                        </div>
                      </div>
                      <div className="item-footer">
                        <Avatar.Group
                          maxCount={3}
                          maxStyle={{
                            color: "#f56a00",
                            backgroundColor: "#fde3cf",
                          }}
                        >
                          {bookmark.map((b, i) => (
                            <Tooltip
                              key={`avatar-${i}`}
                              title={b.name}
                              placement="top"
                            >
                              <Avatar
                                style={{ backgroundColor: "#FFB800" }}
                                icon={<UserOutlined />}
                              />
                            </Tooltip>
                          ))}
                        </Avatar.Group>
                        <span className="read-more">
                          <Link to={link}>
                            Read more <ArrowRightOutlined />
                          </Link>
                        </span>
                      </div>
                    </Card>
                  );
                })}
            </div>
            <div className="content-right">
              {featuredContents
                .filter((x) => x.id === 196)
                .map((x, i) => {
                  const { id, image, type, title, description, bookmark } = x;
                  const link = `/${type
                    .toLowerCase()
                    .split(" ")
                    .join("_")}/${id}`;
                  return (
                    <Card key={`fc-${i}`} className="item">
                      <img
                        className="item-img"
                        width="100%"
                        src={image || imageNotFound}
                        alt={title}
                      />
                      <div className="item-header">
                        <span className="resource-label upper">
                          {topicNames(humps.camelizeKeys(type))}
                        </span>
                        <span className="mark">
                          <RiseOutlined />
                          Trending
                        </span>
                      </div>
                      <div className="item-body">
                        <div className="asset-title">{title}</div>
                        <div className="body-text">
                          {TrimText({ text: description, max: 450 })}
                        </div>
                      </div>
                      <div className="item-footer">
                        <Avatar.Group
                          maxCount={3}
                          maxStyle={{
                            color: "#f56a00",
                            backgroundColor: "#fde3cf",
                          }}
                        >
                          {bookmark.map((b, i) => (
                            <Tooltip
                              key={`avatar-${i}`}
                              title={b.name}
                              placement="top"
                            >
                              <Avatar
                                style={{ backgroundColor: "#FFB800" }}
                                icon={<UserOutlined />}
                              />
                            </Tooltip>
                          ))}
                        </Avatar.Group>
                        <span className="read-more">
                          <Link to={link}>
                            Read more <ArrowRightOutlined />
                          </Link>
                        </span>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div>
        </div>
        {/* Our Community */}
        <div className="our-community section-container">
          <div className="ui container">
            <div className="section-title green">
              <h2>Our Community</h2>
              <div className="body-text">
                Be part of an expanding active community and start sharing
                knowledge
              </div>
            </div>
            <div className="body">
              <Carousel
                centerMode={true}
                responsive={responsive}
                containerClass="carousel-container"
                itemClass="carousel-item"
                dotListClass="carousel-dot-list"
                showDots={true}
                renderDotsOutside={true}
                removeArrowOnDeviceType={["tablet", "mobile"]}
              >
                {sortBy(ourCommunity, "name").map((x, i) => {
                  const index = i > 3 ? i - 4 : i;
                  const { type, about, image, name, role, id } = x;
                  const link = isApprovedUser
                    ? id
                      ? `/${type}/${id}`
                      : "#"
                    : "#";
                  return (
                    <Link
                      to={link}
                      onClick={
                        !isApprovedUser && handleOurCommunityProfileClick
                      }
                    >
                      <div key={`oc-card-${i}`}>
                        <div className="type-wrapper">
                          <span className="mark">
                            {topicNames(humps.camelizeKeys(type))}
                          </span>
                        </div>
                        <div
                          className="about"
                          style={{ color: cardSvg[index]?.color }}
                        >
                          {about.length > 105 ? (
                            <Tooltip
                              title={about}
                              overlayClassName="our-community-tooltip"
                            >
                              {TrimText({ text: about, max: 105 })}
                            </Tooltip>
                          ) : (
                            <q>{about}</q>
                          )}
                        </div>
                        {cardSvg[index]?.svg}
                        <div className="detail">
                          <Avatar
                            className="photo"
                            size={{
                              xs: 85,
                              sm: 95,
                              md: 105,
                              lg: 110,
                              xl: 115,
                              xxl: 125,
                            }}
                            src={image || imageNotFound}
                            alt={name}
                          />
                          <h4>{name}</h4>
                          <p className="role">{role || ""}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </Carousel>
            </div>
          </div>
        </div>
        {/* Benefits of joining The GPML */}
        <div className="benefit section-container">
          <div className="ui container">
            <div className="section-title green">
              <h2>Benefits of joining The GPML:​</h2>
            </div>
            <div className="body">
              {benefit.map((x, i) => {
                return (
                  <div key={`benefit-${i}`} className="item">
                    <div className="asset-title">{x.title}</div>
                    <ul>
                      {x.childs.map((c, i) => (
                        <li key={`${c}-${i}`} className="body-text">
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            <div className="btn-wrapper">
              <JoinGPMLButton
                history={history}
                loginWithPopup={loginWithPopup}
              />
            </div>
          </div>
        </div>
        {/* Event */}
        <div className="event section-container">
          <div className="ui container">
            <div className="section-title green">
              <h2>
                Upcoming Events{" "}
                <span className="see-more-link">
                  <Link to="/browse?topic=event">
                    See all <RightOutlined />
                  </Link>
                </span>
              </h2>
            </div>
            <div className="body">
              <div className="content">
                {(!data || !event) && (
                  <div className="no-event">
                    <h2 className="loading text-white">
                      <LoadingOutlined spin /> Loading...
                    </h2>
                  </div>
                )}
                {event && event.length === 0 && (
                  <div className="no-event">No event on this day</div>
                )}
                {event &&
                  event.length > 0 &&
                  renderEventContent(event, eventCarousel)}
              </div>
              <div className="calendar">
                <Calendar
                  fullscreen={true}
                  onPanelChange={handleOnDateSelected}
                  onSelect={handleOnDateSelected}
                  headerRender={(e) => calendarHeader(e)}
                  dateCellRender={dateCellRender}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

const renderEventContent = (event, eventCarousel) => {
  return (
    <>
      {event.length > 0 && (
        <div className="event-more">
          <span>
            {event.length} event{event.length > 1 ? "s" : ""} on this day
          </span>
          {event.length > 1 && (
            <div className="button-carousel">
              <Button
                type="link"
                icon={<LeftOutlined />}
                onClick={(e) => {
                  eventCarousel.current.prev();
                }}
              />
              <Button
                type="link"
                icon={<RightOutlined />}
                onClick={(e) => {
                  eventCarousel.current.next();
                }}
              />
            </div>
          )}
        </div>
      )}
      <AntdCarousel
        autoplay
        dots={{ className: "custom-dots" }}
        ref={eventCarousel}
      >
        {event.length &&
          event.map((x, i) => {
            const { id, title, description, type, startDate, image } = x;
            return (
              <Card key={`event-${id}-${i}`} className="item">
                <div className="item-meta">
                  <div className="date">
                    {moment.utc(startDate).format("DD MMMM YYYY")}
                  </div>
                  <div className="status">Online</div>
                  <div className="mark">Featured</div>
                </div>
                <div className="resource-label upper margin">{type}</div>
                <img
                  className="item-img"
                  width="100%"
                  src={image ? image : imageNotFound}
                  alt={title}
                />
                <div className="item-body">
                  <div className="asset-title">{title}</div>
                  <div className="body-text">
                    {TrimText({ text: description, max: 300 })}
                  </div>
                </div>
                <div className="item-footer">
                  <span className="read-more">
                    <Link to={`/event/${id}`}>
                      Read more <ArrowRightOutlined />
                    </Link>
                  </span>
                </div>
              </Card>
            );
          })}
      </AntdCarousel>
    </>
  );
};

const calendarHeader = ({ value, onChange }) => {
  const start = 0;
  const end = 12;
  const monthOptions = [];

  const current = value.clone();
  const localeData = value.localeData();
  const months = [];
  for (let i = 0; i < 12; i++) {
    current.month(i);
    months.push(localeData.months(current));
  }

  for (let index = start; index < end; index++) {
    monthOptions.push(
      <Select.Option className="month-item" key={`${index}`}>
        {months[index]}
      </Select.Option>
    );
  }
  const month = value.month();

  const year = value.year();
  const options = [];
  for (let i = year - 10; i < year + 10; i += 1) {
    options.push(
      <Select.Option key={i} value={i} className="year-item">
        {i}
      </Select.Option>
    );
  }
  return (
    <div style={{ padding: 8 }}>
      <Row gutter={8} justify="end">
        <Col>
          <Select
            showSearch={true}
            dropdownMatchSelectWidth={false}
            className="year-select"
            onChange={(newYear) => {
              const now = value.clone().year(newYear);
              onChange(now);
            }}
            value={String(year)}
          >
            {options}
          </Select>
        </Col>
        <Col>
          <Select
            dropdownMatchSelectWidth={false}
            className="month-select"
            onChange={(selectedMonth) => {
              const newValue = value.clone();
              newValue.month(parseInt(selectedMonth, 10));
              onChange(newValue);
            }}
            value={String(month)}
          >
            {monthOptions}
          </Select>
        </Col>
      </Row>
    </div>
  );
};

const JoinGPMLButton = withRouter(({ history, loginWithPopup }) => {
  return (
    <Button
      type="primary"
      onClick={() => {
        history.push("/signup");
      }}
    >
      Join GPML
    </Button>
  );
});

export { Landing, JoinGPMLButton };
