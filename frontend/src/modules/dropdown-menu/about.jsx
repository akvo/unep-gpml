import React from "react";
import { withRouter } from "react-router";
import { Button } from "antd";

const AboutDropdownMenu = withRouter(({ history }) => {
  return (
    <Button
      type="link"
      className="menu-btn nav-link menu-dropdown"
      onClick={() => history.push("/about-us")}
    >
      About
    </Button>
  );
});

export default AboutDropdownMenu;
