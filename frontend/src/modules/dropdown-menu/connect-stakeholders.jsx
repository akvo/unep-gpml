import React from "react";

import { NavLink } from "react-router-dom";

const ConnectStakeholdersDropdownMenu = () => {
  return (
    <NavLink
      to="/events"
      className="menu-btn nav-link"
      activeClassName="selected"
    >
      Connect Stakeholders
    </NavLink>
  );
};

export default ConnectStakeholdersDropdownMenu;
