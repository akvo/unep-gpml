import React, { useState } from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";

import IconLibrary from "../../images/capacity-building/ic-knowledge-library.svg";
import IconLearning from "../../images/capacity-building/ic-capacity-building.svg";
import IconExchange from "../../images/capacity-building/ic-exchange.svg";
import IconCaseStudies from "../../images/capacity-building/ic-case-studies.svg";
import "./styles.scss";

const LeftSidebar = ({ children, active = 1 }) => {
  const [activeMenu, setActiveMenu] = useState(active);
  const sidebar = [
    {
      id: 1,
      title: "LIBRARY",
      url: "/knowledge-library",
      icon: IconLibrary,
    },
    {
      id: 2,
      title: "LEARNING",
      url: "/capacity-building",
      icon: IconLearning,
    },
    {
      id: 4,
      title: "Case studies",
      url: "/case-studies",
      icon: IconCaseStudies,
    },
  ];
  return (
    <div id="siteWrapper">
      <aside id="mainNavigation">
        <ul className="sidebar">
          {sidebar.map((s, sx) => (
            <li
              className={classNames("item-sidebar", {
                active: activeMenu === s.id,
              })}
              key={sx}
            >
              {s.url ? (
                <Link
                  to={s.url}
                  className="item-menu"
                  onClick={() => setActiveMenu(s.id)}
                >
                  <img src={s.icon} alt={s.title} />
                  <p>{s.title}</p>
                </Link>
              ) : (
                <div className="item-menu disabled">
                  <img src={s.icon} alt={s.title} />
                  <p>{s.title}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </aside>
      <div id="appWrapper">
        <div id="appInnerWrapper">
          <div id="bodyContent">
            <ul className="ant-row ant-row-center sidebar-mobile">
              {sidebar.map((s, sx) => (
                <li
                  className={classNames("ant-col ant-col-8 item-sidebar", {
                    active: activeMenu === s.id,
                  })}
                  key={sx}
                >
                  {s.url ? (
                    <Link
                      to={s.url}
                      className="item-menu"
                      onClick={() => setActiveMenu(s.id)}
                    >
                      <img src={s.icon} alt={s.title} />
                      <p>{s.title}</p>
                    </Link>
                  ) : (
                    <div className="ant-col ant-col-8 item-menu disabled">
                      <img src={s.icon} alt={s.title} />
                      <p>{s.title}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
