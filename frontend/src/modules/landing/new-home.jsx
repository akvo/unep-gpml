import { UIStore } from "../../store";
import React, { useState, useEffect, useCallback } from "react";
import { Button, Card, Avatar, Tooltip } from "antd";
import {
  RightOutlined,
  ArrowRightOutlined,
  RiseOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, withRouter } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper";
// swiper bundle styles
import "swiper/swiper.min.css";

// import "swiper/modules/free-mode/free-mode.min.css";
import "swiper/modules/navigation/navigation.scss";
import "swiper/modules/pagination/pagination.min.css";
import "swiper/modules/thumbs/thumbs.min.css";

import "./new-styles.scss";
import moment from "moment";
import imageNotFound from "../../images/image-not-found.png";

import {
  featuredContents,
  ourCommunity,
  benefit,
} from "./new-home-static-content";
import { TrimText } from "../../utils/string";
import orderBy from "lodash/orderBy";
import humps from "humps";
import { topicNames } from "../../utils/misc";
import sortBy from "lodash/sortBy";
import api from "../../utils/api";

import TopicChart from "../chart/topic-chart";
import EventCalendar from "../../components/event-calendar/view";
import TopicBar from "../chart/topic-bar";
import { eventTrack } from "../../utils/misc";

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

const Landing = withRouter(
  ({
    history,
    setWarningModalVisible,
    isAuthenticated,
    loginWithPopup,
    setFilterMenu,
  }) => {
    const [sortedPopularTopics, setSortedPopularTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);

    const dateNow = moment().format("YYYY/MM/DD");
    const { innerWidth, innerHeight } = window;
    const profile = UIStore.useState((s) => s.profile);
    const [event, setEvent] = useState([]);
    const [data, setData] = useState(null);
    const [didMount, setDidMount] = useState(false);
    const [resources, setResources] = useState(null);

    const isApprovedUser = profile?.reviewStatus === "APPROVED";
    const hasProfile = profile?.reviewStatus;

    const isMobileScreen = innerWidth <= 991;

    const [sortPopularTopic, setSortPopularTopic] = useState([]);
    const defTopic = sortPopularTopic[0]?.topic?.toLocaleLowerCase();

    const handlePopularTopicChartClick = (params) => {
      const { name, tag } = params?.data;

      if (!isMobileScreen) {
        setSelectedTopic(name?.toLocaleLowerCase());
      } else {
        isMobileScreen && history.push(`/knowledge/library?tag=${tag}`);
      }
    };

    const handlePopularTopicBarClick = (e) => {
      const name = e.currentTarget.value;
      setSelectedTopic(name.toLowerCase());
    };

    const handleOurCommunityProfileClick = () => {
      if (!isAuthenticated) {
        return loginWithPopup();
      }
      if (isAuthenticated && !hasProfile) {
        return history.push("/onboarding");
      }
      return setWarningModalVisible(true);
    };

    const getResources = async () => {
      selectedTopic &&
        (await api.get(`/browse?tag=${selectedTopic}&limit=3`).then((resp) => {
          const data = resp?.data;

          setResources({
            items: data?.results,
            summary: data?.counts.filter(
              (count) =>
                count?.topic !== "gpml_member_entities" &&
                count?.topic !== "plastics" &&
                count?.topic !== "waste management" &&
                count?.topic !== "marine litter" &&
                count?.topic !== "capacity building" &&
                count?.topic !== "product by design" &&
                count?.topic !== "source to sea"
            ),
          });
        }));
    };

    useEffect(() => {
      getResources();

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTopic]);

    const generateEvent = useCallback(
      (filterDate, searchNextEvent = false) => {
        const eventNow = data.results.filter((x, i) => {
          const startDate = moment(x.startDate).format("YYYY/MM/DD");
          const endDate = moment(x.endDate).format("YYYY/MM/DD");
          return filterDate >= startDate && filterDate <= endDate;
        });
        if (!eventNow.length && searchNextEvent) {
          const nextDay = moment(filterDate, "YYYY/MM/DD")
            .add(1, "days")
            .format("YYYY/MM/DD");
          generateEvent(nextDay, searchNextEvent);
        }
        if (eventNow.length || !searchNextEvent) {
          setEvent(eventNow);
        }
      },
      [data]
    );

    useEffect(() => {
      UIStore.update((e) => {
        e.disclaimer = "home";
      });
    }, []);

    useEffect(() => {
      setSelectedTopic(defTopic);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortPopularTopic]);

    useEffect(() => {
      api
        .get(`/tag/topic/popular?&limit=6`)
        .then((resp) => {
          const data = resp?.data.map((item, i) => {
            return {
              id: i,
              topic: item?.tag,
              tag: item?.tag,
              count: item?.count,
            };
          });

          const sorted = orderBy(data, ["count", "topic"], ["desc", "desc"]);

          setSortedPopularTopics(sorted);

          const defaultTopic = sorted[0]?.topic?.toLocaleLowerCase();

          setSelectedTopic(defaultTopic);
        })
        .catch((err) => {
          console.error(err);
        });

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Note: this will fix the warning on the console

    useEffect(() => {
      setDidMount(true);
      return () => setDidMount(false);
    }, []);

    return (
      <div id="landing">
        {/* Banner */}
        <div className="landing-container">
          <div className="landing-banner">
            <div className="ui container">
              <h1>
                Welcome to the Digital Platform on Marine Litter and Plastic
                Pollution!
              </h1>
              <h2>Inform. Connect. Inspire.</h2>
              <div className="body-text">
                A partly open-source, multi-stakeholder platform, powered by the
                Global Partnership on Marine Litter (GPML), that compiles
                different resources, connects stakeholders, and integrates data
                to guide action towards the long term elimination of marine
                litter and plastic pollution.
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

        {/* Featured Content */}
        <div className="featured-content ui container section-container">
          <div className="section-title">
            <h2>
              Featured Content{" "}
              <span className="see-more-link">
                <Link to="/knowledge/library">
                  See all <RightOutlined />
                </Link>
              </span>
            </h2>
          </div>
          <div className="body">
            <div className="content-left content-left-desktop">
              <FeaturedContent {...{ history }} />
            </div>
            <div className="content-left-mobile">
              <FeaturedContentMobile {...{ history }} />
            </div>
            {/* Mobile slider */}

            <div className="content-right">
              {featuredContents
                .filter((x) => x.id === 196)
                .map((x, i) => {
                  const { id, image, type, title, description, bookmark } = x;
                  const link = `${humps.decamelize(type)}/${id}`;
                  return (
                    <Card
                      key={`fc-${i}`}
                      className="item"
                      onClick={() => {
                        history.push(link);
                        eventTrack("Featured Content", "View Url", "Button");
                      }}
                    >
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

        <hr />

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
          <TopicBar
            {...{
              selectedTopic,
              setSelectedTopic,
              sortedPopularTopics,
              handlePopularTopicBarClick,
            }}
          />
          <div className="body">
            <TopicChart
              wrapperHeight={"8%"}
              height={750}
              loadingId="home-loading"
              {...{
                selectedTopic,
                isMobileScreen,
                sortedPopularTopics,
                handlePopularTopicChartClick,
              }}
            />
            {/* {!isMobileScreen && ( */}
            <div className="content">
              <div className="content-body">
                {sortPopularTopic.length !== 0 &&
                  sortPopularTopic
                    .find((x) => x?.topic.toLowerCase() === selectedTopic)
                    ?.items.slice(0, 3)
                    ?.map((x, i) => {
                      const {
                        id,
                        type,
                        title,
                        description,
                        remarks,
                        summary,
                        abstract,
                      } = x;
                      const link = `/${humps.decamelize(type)}/${id}`;
                      return (
                        <Card
                          key={`summary-${i}`}
                          className="item-body"
                          onClick={() => history.push(link)}
                        >
                          <div className="resource-label upper">
                            {topicNames(humps.camelizeKeys(type))}
                          </div>
                          <div className="asset-title">{title || ""}</div>
                          <div className="body-text">
                            {TrimText({
                              text: description
                                ? description
                                : remarks
                                ? remarks
                                : summary
                                ? summary
                                : abstract,
                              max: 250,
                            })}
                          </div>
                          <span className="read-more">
                            <Link to={link}>
                              Read more <ArrowRightOutlined />
                            </Link>
                          </span>
                        </Card>
                      );
                    })}
                {resources?.items?.map((x, i) => {
                  const {
                    id,
                    type,
                    title,
                    description,
                    remarks,
                    summary,
                    abstract,
                  } = x;
                  const link = `/${humps.decamelize(type)}/${id}`;
                  return (
                    <Card
                      key={`summary-${i}`}
                      className="item-body"
                      onClick={() => history.push(link)}
                    >
                      <div className="resource-label upper">
                        {topicNames(humps.camelizeKeys(type))}
                      </div>
                      <div className="asset-title">{title || ""}</div>
                      <div className="body-text">
                        {TrimText({
                          text: description
                            ? description
                            : remarks
                            ? remarks
                            : summary
                            ? summary
                            : abstract,
                          max: 250,
                        })}
                      </div>
                      <span className="read-more">
                        <Link to={link}>
                          Read more <ArrowRightOutlined />
                        </Link>
                      </span>
                    </Card>
                  );
                })}
              </div>
            </div>
            {/* )} */}
          </div>
        </div>
        {/* Our Community */}
        <div className="our-community section-container">
          <div className="ui container">
            <div className="section-title green">
              <h2>
                Our Community{" "}
                <span className="see-more-link ant-btn-ghost ant-btn">
                  <Link
                    to={isApprovedUser ? "/connect/events" : "#"}
                    onClick={() => {
                      !isApprovedUser
                        ? handleOurCommunityProfileClick()
                        : setFilterMenu(["organisation", "stakeholder"]);
                    }}
                  >
                    See all <RightOutlined />
                  </Link>
                </span>
              </h2>
              <div className="body-text">
                Be part of an expanding active community and start sharing
                knowledge
              </div>
            </div>
            <div className="body">
              <Swiper
                spaceBetween={12}
                slidesPerGroup={window.innerWidth > 1024 ? 4 : 1}
                slidesPerView={"auto"}
                pagination={{
                  clickable: true,
                }}
                navigation={true}
                modules={[Pagination, Navigation]}
                className="community-carousel"
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
                    <SwiperSlide>
                      <Link
                        key={`oc-card-link-${i}`}
                        to={link}
                        onClick={() => {
                          !isApprovedUser && handleOurCommunityProfileClick();
                        }}
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
                    </SwiperSlide>
                  );
                })}
              </Swiper>
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
        <EventCalendar />
      </div>
    );
  }
);

const JoinGPMLButton = withRouter(({ history, loginWithPopup }) => {
  return (
    <Button
      type="primary"
      onClick={() => {
        history.push("/onboarding");
      }}
    >
      Join GPML
    </Button>
  );
});

const FeaturedContent = ({ history }) => {
  return featuredContents
    .filter((x) => x.id !== 196)
    .map((x, i) => {
      const { id, image, type, title, description, bookmark } = x;
      const link = `/${humps.decamelize(type)}/${id}`;
      return (
        <Card
          key={`fc-${i}`}
          className="item"
          onClick={() => {
            history.push(link);
            eventTrack("Featured Content", "View Url", "Button");
          }}
        >
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
                <Tooltip key={`avatar-${i}`} title={b.name} placement="top">
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
    });
};

const FeaturedContentMobile = ({ history }) => {
  return (
    <Swiper
      slidesPerView={1}
      spaceBetween={2}
      slidesPerGroup={1}
      pagination={{
        clickable: true,
      }}
      navigation={true}
      modules={[Pagination, Navigation]}
      className="feature-content"
    >
      {featuredContents
        .filter((x) => x.id !== 196)
        .map((x, i) => {
          const { id, image, type, title, description, bookmark } = x;
          const link = `/${humps.decamelize(type)}/${id}`;
          return (
            <SwiperSlide>
              <Card
                key={`fc-${i}`}
                className="item"
                onClick={() => {
                  history.push(link);
                  eventTrack("Featured Content", "View Url", "Button");
                }}
              >
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
            </SwiperSlide>
          );
        })}
    </Swiper>
  );
};

export { Landing, JoinGPMLButton };
