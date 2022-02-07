import React from "react";

import { Link } from "react-router-dom";
import { Button } from "antd";

const ConnectStakeholdersDropdownMenu = () => {
  return (
    <Link to="/events">
      <Button type="link" className="menu-btn nav-link">
        Connect Stakeholders
      </Button>
    </Link>
  );
};

export default ConnectStakeholdersDropdownMenu;
