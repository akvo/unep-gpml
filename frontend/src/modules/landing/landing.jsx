import React from 'react'
import { Input, Button, Menu, Dropdown, Layout } from "antd";
import logo from "../../images/gpml.svg";

const Landing = () => {
  return (
    <div className="landing">
      <Layout.Header className="nav-header-container">
        <div className="ui container">
          <div className="logo-wrapper">
            {/* <Link to="/"> */}
              <img src={logo} className="logo" alt="GPML" />
            {/* </Link> */}
          </div>
        </div>
      </Layout.Header>
    </div>
  )
}

export default Landing
