import React, { useState } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import { Row, Col } from "antd";

// Icons
import IconHome from "../../images/workspace/home-icon.svg";
import IconAdmin from "../../images/workspace/admin-icon.svg";

const LeftSidebar = ({ active = 1, profile }) => {
  console.log(profile);
  const [activeMenu, setActiveMenu] = useState(active);
  const sidebar = [
    { id: 1, title: "Home", url: "/workspace" },
    {
      id: 4,
      title: "Admin",
      url: profile.role !== "USER" ? "/profile/admin-section" : "",
    },
  ];

  const icons = [IconHome, IconAdmin];

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
