import React, { useState } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import { Row, Col } from "antd";

// Icons
import IconEvent from "../../images/events/event-icon.svg";
import IconForum from "../../images/events/forum-icon.svg";
import IconCommunity from "../../images/events/community-icon.svg";

const LeftSidebar = ({ active = 2, isValidUser }) => {
  const [activeMenu, setActiveMenu] = useState(active);
  const sidebar = [
    { id: 1, title: "Events", url: "/events" },
    { id: 2, title: "Community", url: "/stakeholder-overview" },
    { id: 3, title: "Forums", url: null },
  ];

  const icons = [IconEvent, IconCommunity, IconForum];

  return (
    <Col lg={2} xs={24} order={1} className="sidebar">
      <Row type="flex" justify="center">
        {sidebar.map((s, sx) => (
          <Col
            key={sx}
            lg={24}
            md={24}
            xs={6}
            className={classNames("item-sidebar", {
              active: activeMenu === s.id,
            })}
            onClick={() => setActiveMenu(s.id)}
          >
            {s.url ? (
              <Link
                to={isValidUser ? s.url : "/stakeholder-overview"}
                className="item-menu"
                onClick={() => setActiveMenu(s.id)}
              >
                <img src={icons[sx] || IconEvent} alt={s.title} />
                <p>{s.title}</p>
              </Link>
            ) : s.title.toLowerCase() === "forums" ? (
              <a
                href="#"
                href="https://communities.gpmarinelitter.org/"
                className="item-menu"
              >
                <img src={icons[sx] || IconEvent} alt={s.title} />
                <p>{s.title}</p>
              </a>
            ) : (
              <div className="item-menu">
                <img src={icons[sx] || IconEvent} alt={s.title} />
                <p>{s.title}</p>
              </div>
            )}
          </Col>
        ))}
      </Row>
    </Col>
  );
};

export default LeftSidebar;
