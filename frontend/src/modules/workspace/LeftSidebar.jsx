import React, { useState } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import { Row, Col } from "antd";

// Icons
import IconHome from "../../images/workspace/home-icon.svg";
import IconBookmark from "../../images/workspace/bookmark-icon.svg";
import IconNetwork from "../../images/workspace/network-icon.svg";
import IconAdmin from "../../images/workspace/admin-icon.svg";

const LeftSidebar = ({ active = 1 }) => {
  const [activeMenu, setActiveMenu] = useState(active);
  const sidebar = [
    { id: 1, title: "Home", url: "/workspace" },
    { id: 2, title: "Bookmarks", url: "/workspace/bookmark" },
    { id: 3, title: "Network", url: "/workspace/network" },
    { id: 4, title: "Admin", url: "/workspace/admin" },
  ];

  const icons = [IconHome, IconBookmark, IconNetwork, IconAdmin];

  return (
    <Col lg={3} md={3} xs={24} order={1} className="sidebar">
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
                to={s.url}
                className="item-menu"
                onClick={() => setActiveMenu(s.id)}
              >
                <img src={icons[sx] || IconHome} alt={s.title} />
                <p>{s.title}</p>
              </Link>
            ) : (
              <div className="item-menu">
                <img src={icons[sx] || IconHome} alt={s.title} />
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
