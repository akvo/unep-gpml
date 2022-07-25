import React, { useState } from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

import "./styles.scss";

const LeftSidebar = ({ sidebar, active = 1 }) => {
  const [activeMenu, setActiveMenu] = useState(active);
  const location = useLocation();

  return (
    <>
      {sidebar != null && (
        <aside id="mainNavigation">
          <ul className="sidebar sidebar-desktop">
            {sidebar?.map((s, sx) => (
              <li
                className={classNames("item-sidebar", {
                  active: s?.url === location.pathname,
                })}
                key={sx}
              >
                {s?.url ? (
                  <Link
                    to={s.url}
                    className="item-menu"
                    onClick={() => setActiveMenu(s?.id)}
                  >
                    {s.icon}
                    <p>{s?.title}</p>
                  </Link>
                ) : s.title.toLowerCase() === "forums" ? (
                  <a
                    href="https://communities.gpmarinelitter.org/"
                    className="item-menu"
                    onClick={() => setActiveMenu(s?.id)}
                  >
                    {s.icon}
                    <p>{s?.title}</p>
                  </a>
                ) : (
                  <div className="item-menu disabled">
                    {s.icon}
                    <p>{s?.title}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
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
                    {s?.icon}
                    <p>{s?.title}</p>
                  </Link>
                ) : (
                  <div className="ant-col ant-col-8 item-menu disabled">
                    {s?.icon}
                    <p>{s?.title}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </aside>
      )}
    </>
  );
};

export default LeftSidebar;
