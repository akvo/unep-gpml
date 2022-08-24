import React, { useState } from "react";
import classNames from "classnames";
import { Link, NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";

import "./styles.scss";

const LeftSidebar = ({ sidebar, active = 1 }) => {
  const [activeMenu, setActiveMenu] = useState(active);
  const location = useLocation();

  console.log(location);

  return (
    <>
      {sidebar != null && (
        <aside id="mainNavigation">
          <ul className="sidebar sidebar-desktop">
            {sidebar?.map((s, sx) => (
              <li className={classNames("item-sidebar")} key={sx}>
                {s?.url ? (
                  <NavLink
                    to={s.url}
                    className="item-menu"
                    onClick={() => setActiveMenu(s?.id)}
                  >
                    {s.icon}
                    <p>{s?.title}</p>
                  </NavLink>
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
                  <NavLink
                    to={s.url}
                    className="item-menu"
                    onClick={() => setActiveMenu(s?.id)}
                  >
                    {s?.icon}
                    <p>{s?.title}</p>
                  </NavLink>
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
