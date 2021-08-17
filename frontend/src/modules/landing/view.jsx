import { UIStore } from "../../store";
import React, { useState, useEffect } from "react";
import {
  Button,
  Select,
  Switch,
  Card,
  Avatar,
  Tooltip,
  Calendar,
  Image,
} from "antd";
import {
  LoadingOutlined,
  RightOutlined,
  ArrowRightOutlined,
  RiseOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, withRouter } from "react-router-dom";
import Maps from "./maps";
import Chart from "../../utils/chart";
import Carousel from "react-multi-carousel";
import "./styles.scss";
import "react-multi-carousel/lib/styles.css";
import humps from "humps";
import { topicNames, tTypes } from "../../utils/misc";

const newLanding = true;
const popularTopics = [
  {
    id: 1,
    topic: "Product by design",
    count: 65,
    summary: [
      {
        count: 12,
        type: "policy",
      },
      {
        count: 13,
        type: "events",
      },
      {
        count: 14,
        type: "technical resources",
      },
      {
        count: 14,
        type: "technology",
      },
      {
        count: 12,
        type: "action plan",
      },
      {
        count: 14,
        type: "initiatives",
      },
      {
        count: 14,
        type: "financial resources",
      },
    ],
    items: [
      {
        id: 1,
        type: "policy",
        title: "Paullum deliquit, ponderibus modulisque suis ratio utitur.",
        description:
          "Integer legentibus erat a ante historiarum dapibus. Idque Caesaris facere voluntate liceret: sese habere. Ambitioni dedisse scripsisse iudicaretur.",
      },
      {
        id: 2,
        type: "technology",
        title: "Cum sociis natoque penatibus et magnis dis parturient.",
        description: "At nos hinc posthac, sitientis piros Afros.",
      },
      {
        id: 3,
        type: "event",
        title: "Nihilne te nocturnum praesidium Palati, nihil urbis vigiliae.",
        description:
          "Ambitioni dedisse scripsisse iudicaretur. Quis aute iure reprehenderit in voluptate velit esse. Magna pars studiorum, prodita quaerimus. ",
      },
    ],
  },
  {
    id: 2,
    topic: "Waste management",
    count: 61,
    summary: [
      {
        count: 12,
        type: "policy",
      },
      {
        count: 13,
        type: "events",
      },
      {
        count: 12,
        type: "technical resources",
      },
      {
        count: 12,
        type: "technology",
      },
      {
        count: 12,
        type: "action plan",
      },
      {
        count: 12,
        type: "initiatives",
      },
      {
        count: 12,
        type: "financial resources",
      },
    ],
    items: [
      {
        id: 1,
        type: "policy",
        title: "Paullum deliquit, ponderibus modulisque suis ratio utitur.",
        description:
          "Integer legentibus erat a ante historiarum dapibus. Idque Caesaris facere voluntate liceret: sese habere. Ambitioni dedisse scripsisse iudicaretur.",
      },
      {
        id: 2,
        type: "technology",
        title: "Cum sociis natoque penatibus et magnis dis parturient.",
        description: "At nos hinc posthac, sitientis piros Afros.",
      },
      {
        id: 3,
        type: "event",
        title: "Nihilne te nocturnum praesidium Palati, nihil urbis vigiliae.",
        description:
          "Ambitioni dedisse scripsisse iudicaretur. Quis aute iure reprehenderit in voluptate velit esse. Magna pars studiorum, prodita quaerimus. ",
      },
    ],
  },
  {
    id: 3,
    topic: "Plastics",
    count: 57,
    summary: [
      {
        count: 12,
        type: "policy",
      },
      {
        count: 13,
        type: "events",
      },
      {
        count: 14,
        type: "technical resources",
      },
      {
        count: 14,
        type: "technology",
      },
      {
        count: 12,
        type: "action plan",
      },
      {
        count: 14,
        type: "initiatives",
      },
      {
        count: 14,
        type: "financial resources",
      },
    ],
    items: [
      {
        id: 1,
        type: "policy",
        title: "Paullum deliquit, ponderibus modulisque suis ratio utitur.",
        description:
          "Integer legentibus erat a ante historiarum dapibus. Idque Caesaris facere voluntate liceret: sese habere. Ambitioni dedisse scripsisse iudicaretur.",
      },
      {
        id: 2,
        type: "technology",
        title: "Cum sociis natoque penatibus et magnis dis parturient.",
        description: "At nos hinc posthac, sitientis piros Afros.",
      },
      {
        id: 3,
        type: "event",
        title: "Nihilne te nocturnum praesidium Palati, nihil urbis vigiliae.",
        description:
          "Ambitioni dedisse scripsisse iudicaretur. Quis aute iure reprehenderit in voluptate velit esse. Magna pars studiorum, prodita quaerimus. ",
      },
    ],
  },
  {
    id: 4,
    topic: "Marine litter",
    count: 56,
    summary: [
      {
        count: 12,
        type: "policy",
      },
      {
        count: 13,
        type: "events",
      },
      {
        count: 14,
        type: "technical resources",
      },
      {
        count: 14,
        type: "technology",
      },
      {
        count: 12,
        type: "action plan",
      },
      {
        count: 14,
        type: "initiatives",
      },
      {
        count: 14,
        type: "financial resources",
      },
    ],
    items: [
      {
        id: 1,
        type: "policy",
        title: "Paullum deliquit, ponderibus modulisque suis ratio utitur.",
        description:
          "Integer legentibus erat a ante historiarum dapibus. Idque Caesaris facere voluntate liceret: sese habere. Ambitioni dedisse scripsisse iudicaretur.",
      },
      {
        id: 2,
        type: "technology",
        title: "Cum sociis natoque penatibus et magnis dis parturient.",
        description: "At nos hinc posthac, sitientis piros Afros.",
      },
      {
        id: 3,
        type: "event",
        title: "Nihilne te nocturnum praesidium Palati, nihil urbis vigiliae.",
        description:
          "Ambitioni dedisse scripsisse iudicaretur. Quis aute iure reprehenderit in voluptate velit esse. Magna pars studiorum, prodita quaerimus. ",
      },
    ],
  },
  {
    id: 5,
    topic: "Capacity building",
    count: 50,
    summary: [
      {
        count: 12,
        type: "policy",
      },
      {
        count: 13,
        type: "events",
      },
      {
        count: 14,
        type: "technical resources",
      },
      {
        count: 14,
        type: "technology",
      },
      {
        count: 12,
        type: "action plan",
      },
      {
        count: 14,
        type: "initiatives",
      },
      {
        count: 14,
        type: "financial resources",
      },
    ],
    items: [
      {
        id: 1,
        type: "policy",
        title: "Paullum deliquit, ponderibus modulisque suis ratio utitur.",
        description:
          "Integer legentibus erat a ante historiarum dapibus. Idque Caesaris facere voluntate liceret: sese habere. Ambitioni dedisse scripsisse iudicaretur.",
      },
      {
        id: 2,
        type: "technology",
        title: "Cum sociis natoque penatibus et magnis dis parturient.",
        description: "At nos hinc posthac, sitientis piros Afros.",
      },
      {
        id: 3,
        type: "event",
        title: "Nihilne te nocturnum praesidium Palati, nihil urbis vigiliae.",
        description:
          "Ambitioni dedisse scripsisse iudicaretur. Quis aute iure reprehenderit in voluptate velit esse. Magna pars studiorum, prodita quaerimus. ",
      },
    ],
  },
  {
    id: 6,
    topic: "Source to sea",
    count: 48,
    summary: [
      {
        count: 12,
        type: "policy",
      },
      {
        count: 13,
        type: "events",
      },
      {
        count: 14,
        type: "technical resources",
      },
      {
        count: 14,
        type: "technology",
      },
      {
        count: 12,
        type: "action plan",
      },
      {
        count: 14,
        type: "initiatives",
      },
      {
        count: 14,
        type: "financial resources",
      },
    ],
    items: [
      {
        id: 1,
        type: "policy",
        title: "Paullum deliquit, ponderibus modulisque suis ratio utitur.",
        description:
          "Integer legentibus erat a ante historiarum dapibus. Idque Caesaris facere voluntate liceret: sese habere. Ambitioni dedisse scripsisse iudicaretur.",
      },
      {
        id: 2,
        type: "technology",
        title: "Cum sociis natoque penatibus et magnis dis parturient.",
        description: "At nos hinc posthac, sitientis piros Afros.",
      },
      {
        id: 3,
        type: "event",
        title: "Nihilne te nocturnum praesidium Palati, nihil urbis vigiliae.",
        description:
          "Ambitioni dedisse scripsisse iudicaretur. Quis aute iure reprehenderit in voluptate velit esse. Magna pars studiorum, prodita quaerimus. ",
      },
    ],
  },
];
const featuredContents = [
  {
    image: null,
    type: "data hub",
    title: "Morbi odio eros, volutpat ut pharetra vitae, lobortis sed nibh.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec tempor ante ac leo cursus, quis fringilla elit sagittis. Maecenas ac maximus massa...",
    bookmark: [
      {
        image: "",
        name: "Name 1",
      },
      {
        image: "",
        name: "Name 2",
      },
      {
        image: "",
        name: "Name 3",
      },
      {
        image: "",
        name: "Name 4",
      },
    ],
  },
  {
    image: null,
    type: "policy",
    title: "Nihilne te nocturnum praesidium Palati, nihil urbis vigiliae.",
    description:
      "Integer legentibus erat a ante historiarum dapibus. Idque Caesaris facere voluntate liceret: sese habere. Ambitioni dedisse scripsisse iudicaretur. Fabio vel iudice vincam,",
    bookmark: [
      {
        image: "",
        name: "Name 1",
      },
      {
        image: "",
        name: "Name 2",
      },
      {
        image: "",
        name: "Name 3",
      },
      {
        image: "",
        name: "Name 4",
      },
    ],
  },
  {
    image: "fc-initiative.png",
    type: "initiative",
    title: "Morbi odio eros, volutpat ut pharetra vitae, lobortis sed nibh.",
    description:
      "Inmensae subtilitatis, obscuris et malesuada fames. Ut enim ad minim veniam, quis nostrud exercitation. Quisque ut dolor gravida, placerat libero vel, euismod. Salutantibus vitae elit libero, a pharetra augue. Vivamus sagittis lacus vel augue laoreet rutrum faucibus. Quam temere in vitiis, legem sancimus haerentia. Fabio vel iudice vincam, sunt in culpa qui officia. Quis aute iure reprehenderit in voluptate velit esse. Non equidem invideo, miror magis posuere velit aliquet. Quisque placerat facilisis egestas cillum dolore. Praeterea iter est quasdam res quas ex communi.",
    bookmark: [
      {
        image: "",
        name: "Name 1",
      },
      {
        image: "",
        name: "Name 2",
      },
      {
        image: "",
        name: "Name 3",
      },
      {
        image: "",
        name: "Name 4",
      },
      {
        image: "",
        name: "Name 4",
      },
    ],
  },
  {
    image: null,
    type: "technical resource",
    title: "Contra legem facit qui id facit quod lex prohibet.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec tempor ante ac leo cursus, quis fringilla elit sagittis. Maecenas ac maximus massa...",
    bookmark: [
      {
        image: "",
        name: "Name 1",
      },
      {
        image: "",
        name: "Name 2",
      },
      {
        image: "",
        name: "Name 3",
      },
      {
        image: "",
        name: "Name 4",
      },
    ],
  },
  {
    image: null,
    type: "story map",
    title: "At nos hinc posthac, sitientis piros Afros.",
    description:
      "Tu quoque, Brute, fili mi, nihil timor populi, nihil! Quisque placerat facilisis egestas cillum dolore. Hi omnes lingua, institutis, legibus inter se differunt. Paullum deliquit, ponderibus",
    bookmark: [
      {
        image: "",
        name: "Name 1",
      },
      {
        image: "",
        name: "Name 2",
      },
      {
        image: "",
        name: "Name 3",
      },
      {
        image: "",
        name: "Name 4",
      },
    ],
  },
];
const ourCommunity = [
  {
    type: "stakeholder",
    about:
      "Sed haec quis possit intrepidus aestimare tellus. Cum sociis natoque penatibus et magnis dis parturient.",
    name: "John Malkovich",
    role: "Entity Role -  Entity",
  },
  {
    type: "stakeholder",
    about: "Salutantibus vitae elit libero, a pharetra augue.",
    name: "Bertrand Lacaze",
    role: "Entity Role -  Entity",
  },
  {
    type: "stakeholder",
    about:
      "Contra legem facit qui id facit quod lex prohibet. Quid securi etiam tamquam eu fugiat nulla pariatur.",
    name: "Xavier Mendoza",
    role: "Entity Role -  Entity",
  },
  {
    type: "entity",
    about:
      "Contra legem facit qui id facit quod lex prohibet. Quid securi etiam tamquam eu fugiat nulla pariatur.",
    name: "Black Forest Solutions",
    role: null,
  },
  {
    type: "stakeholder",
    about:
      "Contra legem facit qui id facit quod lex prohibet. Quid securi etiam tamquam eu fugiat nulla pariatur.",
    name: "Xavier",
    role: "Entity Role -  Entity",
  },
];
const benefit = [
  {
    title: "GPML Partnership",
    childs: [
      "Tap into a global network of like-minded members​",
      "Discover opportunities to showcase your work​",
      "Avoid duplication of effort and optimise impact​",
    ],
  },
  {
    title: "GPML Digital Platform​",
    childs: [
      "Access a data hub to guide efforts towards SDGs and more",
      "Utilise an array of resources at your fingertips​",
      "Network with other stakeholders​",
    ],
  },
];
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
    breakpoint: { max: 4000, min: 3000 },
    items: 4,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 4,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 3,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

const Landing = ({
  history,
  data,
  setSignupModalVisible,
  setWarningModalVisible,
  isAuthenticated,
  loginWithPopup,
  setFilters,
}) => {
  const { innerWidth, innerHeight } = window;
  const { profile, countries } = UIStore.currentState;
  const [country, setCountry] = useState(null);
  const [counts, setCounts] = useState("project");
  const [mapData, setMapData] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("product by design");

  const isApprovedUser = profile?.reviewStatus === "APPROVED";
  const hasProfile = profile?.reviewStatus;
  const clickCountry = (name) => {
    history.push(`/browse?country=${name}`);
  };

  const handleChangeCountry = (id) => {
    setCountry(id);
  };
  const countryOpts = countries
    ? countries
        .map((it) => ({ value: it.id, label: it.name }))
        .sort((a, b) => a.label.localeCompare(b.label))
    : [];

  const countryObj = country && countries.find((it) => it.id === country);

  const handleSummaryClick = (topic) => {
    setCounts(topic);
  };

  const handleSeeAllStakeholderClick = () => {
    if (!isAuthenticated) {
      return loginWithPopup();
    }
    if (isAuthenticated && !hasProfile) {
      return setSignupModalVisible(true);
    }
    return setWarningModalVisible(true);
  };

  const selected =
    countries && country ? data?.map?.find((x) => x.countryId === country) : {};

  const summaryData = data?.summary?.filter((it, index) => {
    const current = Object.keys(it)[0];
    return tTypes.indexOf(current) > -1;
  });

  function onPanelChange(value, mode) {
    console.log(value, mode);
  }

  useEffect(() => {
    setFilters(null);
    UIStore.update((e) => {
      e.disclaimer = "home";
    });
  }, [setFilters]);

  return (
    <div id="landing">
      {/* Banner */}
      <div className="landing-container">
        <div className="landing-banner">
          <div className="ui container">
            <h2>
              Welcome to the Global Partnership on Marine Litter Digital
              Platform!
            </h2>
            <p>
              A partly open-source, multi-stakeholder platform that compiles
              different resources, connects stakeholders, and integrates data to
              guide action towards the long term elimination of marine litter
              and plastic pollution.{" "}
              {/* <a
                href="https://www.gpmarinelitter.org/what-we-do/gpml-digital-platform"
                target="_blank"
                rel="noreferrer"
              >
                here
              </a>
              . */}
            </p>
            <div>
              <Button type="primary">Join GPML</Button>
              <Button type="ghost" className="left">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Popular Topics */}
      <div className="popular-topics ui container">
        <div className="title">
          <h2>
            Popular Content{" "}
            <span>
              See all topics <RightOutlined />
            </span>
          </h2>
        </div>
        <div className="body">
          <div className="chart-wrapper">
            <Chart
              key="popular-topic"
              title=""
              type="TREEMAP"
              height={600}
              data={popularTopics.map((x) => {
                return {
                  id: x.id,
                  name: x.topic,
                  value: x.count,
                };
              })}
              wrapper={false}
              onEvents={{
                click: (e) => setSelectedTopic(e.data.name.toLowerCase()),
              }}
              selected={selectedTopic}
            />
          </div>
          <div className="content">
            <div className="content-header">
              {popularTopics
                .find((x) => x.topic.toLowerCase() === selectedTopic)
                .summary.map((x, i) => {
                  return (
                    <div key={`summary-${i}`} className="item">
                      <h4>{x.count}</h4>
                      <span>{x.type}</span>
                    </div>
                  );
                })}
            </div>
            <div className="content-body">
              {popularTopics
                .find((x) => x.topic.toLowerCase() === selectedTopic)
                .items.map((x, i) => {
                  return (
                    <div key={`summary-${i}`} className="item">
                      <span className="type">{x.type}</span>
                      <h4>{x.title}</h4>
                      <p>{x.description}</p>
                      <span className="read-more">
                        Read more <ArrowRightOutlined />
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
      <hr />
      {/* Featured Content */}
      <div className="featured-content ui container">
        <div className="title">
          <h2>
            Featured Content{" "}
            <span>
              See all <RightOutlined />
            </span>
          </h2>
        </div>
        <div className="body">
          <div className="content-left">
            {featuredContents
              .filter((x) => x.image === null)
              .map((x, i) => {
                return (
                  <Card key={`fc-${i}`} className="item">
                    <div className="item-header">
                      <span className="type">{x.type}</span>
                      <span className="mark">
                        <RiseOutlined />
                        Trending
                      </span>
                    </div>
                    <div className="item-body">
                      <h4>{x.title}</h4>
                      <p>{x.description}</p>
                    </div>
                    <div className="item-footer">
                      <Avatar.Group
                        maxCount={3}
                        maxStyle={{
                          color: "#f56a00",
                          backgroundColor: "#fde3cf",
                        }}
                      >
                        {x.bookmark.map((b, i) => (
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
                        Read more <ArrowRightOutlined />
                      </span>
                    </div>
                  </Card>
                );
              })}
          </div>
          <div className="content-right">
            {featuredContents
              .filter((x) => x.image !== null)
              .map((x, i) => {
                return (
                  <Card key={`fc-${i}`} className="item">
                    <img
                      className="item-img"
                      width="100%"
                      src="./fc-initiative.png"
                      alt={x.title}
                    />
                    <div className="item-header">
                      <span className="type">{x.type}</span>
                      <span className="mark">
                        <RiseOutlined />
                        Trending
                      </span>
                    </div>
                    <div className="item-body">
                      <h4>{x.title}</h4>
                      <p>{x.description}</p>
                    </div>
                    <div className="item-footer">
                      <Avatar.Group
                        maxCount={3}
                        maxStyle={{
                          color: "#f56a00",
                          backgroundColor: "#fde3cf",
                        }}
                      >
                        {x.bookmark.map((b, i) => (
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
                        Read more <ArrowRightOutlined />
                      </span>
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>
      </div>
      {/* Our Community */}
      <div className="our-community">
        <div className="ui container">
          <div className="title">
            <h2>
              Our Community{" "}
              <span>
                See all <RightOutlined />
              </span>
            </h2>
            <p>
              Be part of an expanding active community and start sharing
              knowledges
            </p>
          </div>
          <div className="body">
            <Carousel
              responsive={responsive}
              showDots={true}
              containerClass="carousel-container"
              itemClass="carousel-item"
              renderDotsOutside={true}
              dotListClass="carousel-dot-list"
              centerMode={true}
            >
              {ourCommunity.map((x, i) => {
                const index = i > 3 ? i - 4 : i;
                return (
                  <div key={`oc-card-${i}`}>
                    <div className="type">
                      <span>{x.type}</span>
                    </div>
                    <div
                      className="about"
                      style={{ color: cardSvg[index]?.color }}
                    >
                      <q>{x.about}</q>
                    </div>
                    {cardSvg[index]?.svg}
                    <div className="detail">
                      <Avatar
                        className="photo"
                        size={{
                          xs: 49,
                          sm: 57,
                          md: 65,
                          lg: 79,
                          xl: 105,
                          xxl: 125,
                        }}
                        icon={<UserOutlined />}
                      />
                      <h4>{x.name}</h4>
                      <p className="role">{x?.role || ""}</p>
                    </div>
                  </div>
                );
              })}
            </Carousel>
          </div>
        </div>
      </div>
      {/* Benefits of joining The GPML */}
      <div className="benefit">
        <div className="ui container">
          <div className="title">
            <h2>Benefits of joining The GPML:​</h2>
          </div>
          <div className="body">
            {benefit.map((x, i) => {
              return (
                <div key={`benefit-${i}`} className="item">
                  <h4>{x.title}</h4>
                  <ul>
                    {x.childs.map((c, i) => (
                      <li key={`${c}-${i}`}>{c}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <div className="btn-wrapper">
            <Button className="btn" type="primary">
              Join GPML
            </Button>
          </div>
        </div>
      </div>
      {/* Event */}
      <div className="event">
        <div className="ui container">
          <div className="title">
            <h2>
              Upcoming Events{" "}
              <span>
                See all <RightOutlined />
              </span>
            </h2>
          </div>
          <div className="body">
            <div className="content">
              <Card className="item">
                <div className="item-meta">
                  <div className="date">17 August 2021</div>
                  <div className="status">Online</div>
                  <div className="mark">Featured</div>
                </div>
                <div className="item-type">Event</div>
                <div className="item-body">
                  <div className="img">
                    <Image src="./event-item.png" />
                  </div>
                  <h2 className="title">
                    United Nations World Oceans Day 2021
                  </h2>
                  <p className="description">
                    Join us for this year’s UN World Oceans Day annual event as
                    we hear from thought-leaders, celebrities, institutional
                    partners, community voices, entrepreneurs, and
                    cross-industry experts about the biodiversity and economic
                    opportunity that the ocean sustains. Learn more about the
                    event here.
                  </p>
                </div>
                <div className="item-footer">
                  <Avatar.Group
                    maxCount={2}
                    maxStyle={{ color: "#f56a00", backgroundColor: "#fde3cf" }}
                  >
                    <Avatar style={{ backgroundColor: "#f56a00" }}>K</Avatar>
                    <Tooltip title="Ant User" placement="top">
                      <Avatar
                        style={{ backgroundColor: "#87d068" }}
                        icon={<UserOutlined />}
                      />
                    </Tooltip>
                    <Tooltip title="Ant User" placement="top">
                      <Avatar
                        style={{ backgroundColor: "#87d068" }}
                        icon={<UserOutlined />}
                      />
                    </Tooltip>
                  </Avatar.Group>
                  <span className="read-more">
                    Read more <ArrowRightOutlined />
                  </span>
                </div>
              </Card>
            </div>
            <div className="calendar">
              <Calendar fullscreen={false} onPanelChange={onPanelChange} />
            </div>
          </div>
        </div>
      </div>
      {/* // Old landing page content */}
      {!newLanding && (
        <>
          <div className="landing-container map-container">
            {!data && (
              <h2 className="loading">
                <LoadingOutlined spin /> Loading Data
              </h2>
            )}
            {data && (
              <div className="map-overlay">
                <Select
                  showSearch
                  allowClear
                  placeholder="Countries"
                  options={countryOpts}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().indexOf(input.toLowerCase()) >=
                    0
                  }
                  value={country}
                  onChange={handleChangeCountry}
                  virtual={false}
                />
                <Summary
                  clickEvents={handleSummaryClick}
                  seeAllEvents={handleSeeAllStakeholderClick}
                  isApprovedUser={isApprovedUser}
                  summary={summaryData}
                  country={countryObj}
                  counts={counts}
                  selected={selected}
                  init={counts}
                />
              </div>
            )}
            {/* Dont render maps on mobile */}
            {innerWidth >= 768 && (
              <Maps
                data={data?.map || []}
                clickEvents={clickCountry}
                topic={counts}
                country={countries.find((x) => x.id === country)}
              />
            )}
          </div>
          <div className="topics">
            <div className="ui container">
              {data?.topics.map(
                (topic, index) =>
                  (topic.topicType !== "stakeholder" || isApprovedUser) && (
                    <TopicItem key={`topic-${index}`} {...{ topic }} />
                  )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Summary = ({
  clickEvents,
  seeAllEvents,
  summary,
  country,
  counts,
  selected,
  init,
  isApprovedUser,
}) => {
  summary = summary.map((x) => ({
    ...x,
    name: Object.keys(x).find((k) => k !== "country"),
  }));
  summary = tTypes.map((x) => summary.find((it) => it.name === x));
  const restricted = ["stakeholder", "organisation"];
  return (
    <div className="summary">
      <header>{!selected ? "Global summary" : "Summary"}</header>
      <ul>
        {!country &&
          summary.map((it, index) => {
            const current = Object.keys(it)[0];
            let className =
              init !== current
                ? "summary-list"
                : "summary-list summary-list-selected";
            if (init === "") {
              className =
                current !== counts
                  ? "summary-list"
                  : "summary-list summary-list-selected";
              className = counts === "" ? "" : className;
            }
            return (
              <li key={`li-${index}`} className={className}>
                <div className="switcher" onClick={(e) => clickEvents(current)}>
                  <Switch
                    size="small"
                    checked={counts === current || init === current}
                  />
                </div>
                <div className="text" onClick={(e) => clickEvents(current)}>
                  <div className="label">{topicNames(current)}</div>
                  <span>
                    <b>{it[current]}</b> in <b>{it.countries}</b>{" "}
                    {it.countries === 1 ? "country" : "countries"}
                  </span>
                </div>
                {restricted.includes(current) && !isApprovedUser ? (
                  <Link to="/" onClick={seeAllEvents}>
                    See all
                  </Link>
                ) : (
                  <Link
                    to={{
                      pathname: "/browse",
                      search: `?topic=${humps.decamelize(current)}`,
                    }}
                  >
                    See all
                  </Link>
                )}
              </li>
            );
          })}
        {country &&
          tTypes.map((type) => (
            <li key={type}>
              <div className="text">
                <div className="label">{topicNames(type)}</div>
              </div>
              <b>{selected?.[type] || 0}</b>
            </li>
          ))}
        <li className="no-hover">
          <div className="disclaimer">
            The boundaries and names shown, and the designations used on this
            map do not imply official endorsement or acceptance by the United
            Nations.
          </div>
        </li>
      </ul>
    </div>
  );
};

const TopicItem = ({ topic }) => {
  const fullName = (data) =>
    data.title
      ? `${data.title} ${data.firstName} ${data.lastName}`
      : `${data.firstName} ${data.lastName}`;
  const title =
    (topic.topicType === "stakeholder" && fullName(topic)) ||
    topic.title ||
    topic.name;
  return (
    <div className="topic-item">
      <div className="inner">
        <span className="type">latest {topicNames(topic.topicType)}</span>
        <h2>{title}</h2>
        {/*topic.description && <p>{topic.description}</p>*/}
        <div className="bottom">
          <Link to={`/${topic.topicType}/${topic.id}`}>
            <Button type="link">Find out more</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default withRouter(Landing);
