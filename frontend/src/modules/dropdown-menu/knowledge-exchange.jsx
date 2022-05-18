import React from "react";

import { NavLink } from "react-router-dom";
import { Button } from "antd";

const KnowledgeExchangeDropdownMenu = () => {
  return (
    <NavLink to="/knowledge-library" className="menu-btn nav-link menu-dropdown" activeClassName="selected">
      Knowledge Exchange
    </NavLink>
  );
};

export default KnowledgeExchangeDropdownMenu;
