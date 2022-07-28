import React from "react";
import { UserOutlined } from "@ant-design/icons";
import "./unathenticated-page.scss";
import { Link } from "react-router-dom";

const UnathenticatedPage = ({ setLoginVisible }) => {
  return (
    <div className="unathenticated-page">
      <p>
        You can now connect with other members of the GPML Digital Platform.
      </p>
      <p>Get started now!</p>
      <p>
        <img
          className="image"
          src="https://communities.gpmarinelitter.org/images/emoji/twitter/white_check_mark.png?v=12/"
          alt="check"
        />{" "}
        First, create an individual account by directly signing up to the GPML
        Digital Platform (if you don't have one yet)
      </p>
      <p>
        <Link to="/onboarding">https://digital.gpmarinelitter.org/signup</Link>
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
      <a className="login-button" onClick={() => setLoginVisible(true)}>
        <UserOutlined /> <span>Log in</span>
      </a>
    </div>
  );
};

export default UnathenticatedPage;
