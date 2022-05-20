import React from "react";
import { Button } from "antd";
import { NavLink } from "react-router-dom";

const AboutDropdownMenu = () => {
  return (
    <NavLink
      to="/about-us"
      className="menu-btn nav-link menu-dropdown"
      activeClassName="selected"
    >
      About
    </NavLink>
  );
};

export default AboutDropdownMenu;
