import React from "react";
import { Row, Col, Card } from "antd";

import { UIStore } from "../../store";

import firstPic from "../../images/stakeholder-overview/first-avatar.jpg";
import secondPic from "../../images/stakeholder-overview/second-avatar.png";
import badge from "../../images/stakeholder-overview/badge.svg";
import unionIcon from "../../images/stakeholder-overview/union-icon.svg";

const ProfileCard = () => {
  return (
    <Card className="profile-card">
      <div className="profile-icon-container">
        <img src={unionIcon} alt="union-icon" />
      </div>
      <Row type="flex" className="profile-details">
        <div className="image-wrapper">
          <img className="profile-image" src={firstPic} alt="" />
        </div>
        <div className="profile-details-container">
          <ul className="profile-detail-list">
            <li className="list-item">
              <h4 className="person-name">Tara McLaugh</h4>
            </li>
            <li className="list-item">
              <span className="location">Kenya</span>
            </li>
            <li className="list-item">
              <span className="entity-name">Entity Name</span>
            </li>
            <li className="list-item">
              <img className="badge" src={badge} alt="" />
            </li>
          </ul>

          <ul className="social-media-list">
            <li className="list-item">
              <a href="" className="social-media-link linkdin">
                Linkdin
              </a>
            </li>
            <li className="list-item">
              <a href="" className="social-media-link twitter">
                Twitter
              </a>
            </li>
          </ul>
        </div>
      </Row>

      <div className="person-role">
        <p className="seeking-text">Seeking:</p>
        <p className="role-name">marine biologists</p>
      </div>
    </Card>
  );
};

export default ProfileCard;
