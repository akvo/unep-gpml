import React from "react";

import { Link } from "react-router-dom";
import { Button } from "antd";

const KnowledgeExchangeDropdownMenu = () => {
  return (
    <Link to="/knowledge-library">
      <Button type="link" className="menu-btn nav-link">
        Knowledge Exchange
      </Button>
    </Link>
  );
};

export default KnowledgeExchangeDropdownMenu;
