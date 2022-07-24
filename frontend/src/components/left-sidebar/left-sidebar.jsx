import React, { useState } from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

import { ReactComponent as IconEvent } from "../../images/events/event-icon.svg";
import { ReactComponent as IconForum } from "../../images/events/forum-icon.svg";
import { ReactComponent as IconCommunity } from "../../images/events/community-icon.svg";
import { ReactComponent as IconPartner } from "../../images/stakeholder-overview/partner-icon.svg";
import { ReactComponent as ExpertIcon } from "../../images/stakeholder-overview/expert-icon.svg";

import "./styles.scss";

const sidebar = [
  { id: 1, title: "Events", url: "/connect/events", icon: <IconEvent /> },
  {
    id: 2,
    title: "Community",
    url: "/connect/community",
    icon: <IconCommunity />,
  },
  { id: 3, title: "Forums", url: null, icon: <IconForum /> },
  {
    id: 4,
    title: "Partners",
    url: "/connect/partners",
    icon: <IconPartner />,
  },
  {
    id: 5,
    title: "Experts",
    url: "/connect/experts",
    icon: <ExpertIcon />,
  },
];

const LeftSidebar = ({ children, active = 1 }) => {
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
