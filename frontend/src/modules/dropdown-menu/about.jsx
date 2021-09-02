import React from "react";
import { withRouter } from "react-router";
import { Button } from "antd";

const AboutDropdownMenu = withRouter(({ history }) => {
  return (
    <Button
      type="link"
      className="menu-btn nav-link menu-dropdown"
      onClick={() => history.push("/about-us")}
      style={{ display: "flex", alignItems: "center", height: "50px" }}
    >
      About
    </Button>
  );
  // Unommented, if needed later
  // return (
  //   <Dropdown
  //     overlayClassName="menu-dropdown-wrapper"
  //     overlay={
  //       <Menu className="menu-dropdown">
  //         <Menu.Item className="nav-link">Partnership</Menu.Item>
  //         <Menu.Item
  //           className="nav-link"
  //           onClick={() => history.push("/about-us")}
  //         >
  //           Digital Platform
  //         </Menu.Item>
  //       </Menu>
  //     }
  //     trigger={["click"]}
  //     placement="bottomRight"
  //   >
  //     <Button
  //       type="link"
  //       className="menu-btn nav-link"
  //     >
  //       About <DownOutlined />
  //     </Button>
  //   </Dropdown>
  // );
});

export default AboutDropdownMenu;
