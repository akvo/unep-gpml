import { UIStore } from "../../store";
import React, { useState, useEffect } from "react";
import { Button, Select, Switch, Card } from "antd";
import {
  LoadingOutlined,
  RightOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Link, withRouter } from "react-router-dom";
import Maps from "./maps";
import "./styles.scss";
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

  useEffect(() => {
    setFilters(null);
    UIStore.update((e) => {
      e.disclaimer = "home";
    });
  }, [setFilters]);

  return (
    <div id="landing">
      <div className="landing-container">
        <div className="landing-banner ui container">
          <h2>
            Welcome to the Global Partnership on Marine Litter Digital Platform!
          </h2>
          <p>
            A partly open-source, multi-stakeholder platform that compiles
            different resources, connects stakeholders, and integrates data to
            guide action towards the long term elimination of marine litter and
            plastic pollution.{" "}
            <a
              href="https://www.gpmarinelitter.org/what-we-do/gpml-digital-platform"
              target="_blank"
              rel="noreferrer"
            >
              here
            </a>
            .
          </p>
          <div>
            <Button type="primary">Join GPML</Button>
            <Button type="ghost" className="left">
              Learn More
            </Button>
          </div>
        </div>
      </div>

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
            {popularTopics.map((x, i) => {
              return (
                <Card
                  key={`topic-${i}`}
                  className="item"
                  onClick={(e) => setSelectedTopic(x.topic.toLowerCase())}
                >
                  <p>{x.topic}</p>
                  <span>{x?.count}</span>
                </Card>
              );
            })}
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
