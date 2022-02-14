import React from "react";

import { Link } from "react-router-dom";
import { Button } from "antd";

const KnowledgeExchangeDropdownMenu = () => {
  return (
    <Link to={`/knowledge-library`} className="menu-btn nav-link menu-dropdown">
      <Button type="link" className="">
        Knowledge Exchange
      </Button>
    </Link>
  );
};

export default KnowledgeExchangeDropdownMenu;
