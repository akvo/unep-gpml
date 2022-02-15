import React from "react";
import { UserOutlined } from "@ant-design/icons";
import "./unathenticated-page.scss";

const UnathenticatedPage = ({ loginWithPopup }) => {
  return (
    <div className="unathenticated-page">
      <h2 className="heading">
        Welcome to GPML Digital Platform - Communities
      </h2>

      <p>
        You can now connect with other members of the GPML Digital Platform
        using communities forums. Here you can exchange feedback and learn from
        other GPML members.
      </p>
      <p>Get started now!</p>
      <p>
        <img
          className="image"
          src="https://communities.gpmarinelitter.org/images/emoji/twitter/white_check_mark.png?v=12/"
          alt="check"
        />{" "}
        First, create an individual account by directly signing up to the GPML
        Digital Platform (if you don?t have one yet)
      </p>
      <p>
        <a href="https://digital.gpmarinelitter.org/signup">
          https://digital.gpmarinelitter.org/signup
        </a>
      </p>
      <p>
        {" "}
        <img
          className="image"
          src="https://communities.gpmarinelitter.org/images/emoji/twitter/point_down.png?v=12"
          alt="pointing"
        />
        Once you are successfully registered log in below.
      </p>
      <a className="login-button" onClick={loginWithPopup}>
        <UserOutlined /> <span>Log in</span>
      </a>
    </div>
  );
};

export default UnathenticatedPage;
