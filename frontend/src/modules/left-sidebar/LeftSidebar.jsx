import React, { useState } from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";

import "./styles.scss";

const LeftSidebar = ({ children, active = 1, sidebar }) => {
  const [activeMenu, setActiveMenu] = useState(active);

  return (
    <div id="siteWrapper">
      <aside id="mainNavigation">
        <ul className="sidebar">
          {sidebar?.map((s, sx) => (
            <li
              className={classNames("item-sidebar", {
                active: activeMenu === s?.id,
              })}
              key={sx}
            >
              {s?.url ? (
                <Link
                  to={s.url}
                  className="item-menu"
                  onClick={() => setActiveMenu(s?.id)}
                >
                  {/* <img src={s?.icon} alt={s?.title} /> */}
                  {s.icon}
                  <p>{s?.title}</p>
                </Link>
              ) : s.title.toLowerCase() === "forums" ? (
                <a
                  href="https://communities.gpmarinelitter.org/"
                  className="item-menu"
                  onClick={() => setActiveMenu(s?.id)}
                >
                  {/* <img src={s?.icon} alt={s?.title} /> */}
                  {s.icon}
                  <p>{s?.title}</p>
                </a>
              ) : (
                <div className="item-menu disabled">
                  {/* <img src={s?.icon} alt={s?.title} /> */}
                  {s.icon}
                  <p>{s?.title}</p>
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
              {sidebar?.map((s, sx) => (
                <li
                  className={classNames("ant-col ant-col-8 item-sidebar", {
                    active: activeMenu === s?.id,
                  })}
                  key={sx}
                >
                  {s?.url ? (
                    <Link
                      to={s.url}
                      className="item-menu"
                      onClick={() => setActiveMenu(s?.id)}
                    >
                      <img src={s?.icon} alt={s?.title} />
                      <p>{s?.title}</p>
                    </Link>
                  ) : (
                    <div className="ant-col ant-col-8 item-menu disabled">
                      <img src={s?.icon} alt={s?.title} />
                      <p>{s?.title}</p>
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
