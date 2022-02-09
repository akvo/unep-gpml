import React from "react";

import { Link } from "react-router-dom";
import { Button } from "antd";

const KnowledgeExchangeDropdownMenu = () => {
  const topic = [
    "action_plan",
    "project",
    "policy",
    "technical_resource",
    "technology",
    "event",
    "financing_resource",
  ];
  return (
    <Link
      to={`/knowledge-library?topic=${topic}`}
      className="menu-btn nav-link menu-dropdown"
    >
      <Button type="link" className="">
        Knowledge Exchange
      </Button>
    </Link>
  );
};

export default KnowledgeExchangeDropdownMenu;
