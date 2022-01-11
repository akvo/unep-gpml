import React, { useState } from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { Row, Col } from "antd";

import IconLibrary from "../../images/capacity-building/ic_library.svg";
import IconLearning from "../../images/capacity-building/ic_learning.svg";
import IconExchange from "../../images/capacity-building/ic_exchange.svg";
import IconCaseStudies from "../../images/capacity-building/ic_case_studies.svg";
import "./styles.scss";

const LeftSidebar = ({ children, active = 1 }) => {
  const [activeMenu, setActiveMenu] = useState(active);
  const sidebar = [
    {
      id: 1,
      title: "LIBRARY",
      url: "/knowledge-library",
    },
    {
      id: 2,
      title: "LEARNING",
      url: "/capacity-building",
    },
    {
      id: 3,
      title: "EXCHANGE",
      url: null,
    },
    {
      id: 4,
      title: "Case studies",
      url: "/case-studies",
    },
  ];
  const icons = [IconLibrary, IconLearning, IconExchange, IconCaseStudies];
  return (
    <Row type="flex">
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
            >
              {s.url ? (
                <Link
                  to={s.url}
                  className="item-menu"
                  onClick={() => setActiveMenu(s.id)}
                >
                  <img src={icons[sx] || IconLibrary} alt={s.title} />
                  <p>{s.title}</p>
                </Link>
              ) : (
                <div className="item-menu disabled">
                  <img src={icons[sx] || IconLibrary} alt={s.title} />
                  <p>{s.title}</p>
                </div>
              )}
            </Col>
          ))}
        </Row>
      </Col>
      <Col lg={22} xs={24} order={2}>
        {children}
      </Col>
    </Row>
  );
};

export default LeftSidebar;
