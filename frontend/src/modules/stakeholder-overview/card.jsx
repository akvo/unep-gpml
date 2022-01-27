import React, { useState } from "react";
import { Row, Col, Card } from "antd";

import { UIStore } from "../../store";

import firstPic from "../../images/stakeholder-overview/first-avatar.jpg";
import secondPic from "../../images/stakeholder-overview/second-avatar.jpg";
import badge from "../../images/stakeholder-overview/badge.svg";
import unionIcon from "../../images/stakeholder-overview/union-icon.svg";

const ProfileCard = ({ profile }) => {
  const { entityRoleOptions, countries } = UIStore.useState((s) => ({
    entityRoleOptions: s.entityRoleOptions,
    countries: s.countries,
    tags: s.tags,
    geoCoverageTypeOptions: s.geoCoverageTypeOptions,
    languages: s.languages,
    seeking: s.seeking,
  }));

  const country = countries.find((country) => country.id === profile.country);

  console.log(UIStore.currentState);
  return (
    <Card className="profile-card">
      <div className="profile-icon-container">
        <img src={unionIcon} alt="union-icon" />
      </div>
      <Row type="flex" className="profile-details">
        <div className="image-wrapper">
          <img
            className="profile-image"
            src={profile.photo}
            alt={`${profile.firstName} ${profile.lastName}`}
          />
        </div>
        <div className="profile-details-container">
          <ul className="profile-detail-list">
            <li className="list-item">
              <h4 className="person-name">
                <div>{profile.firstName}</div>
                <div>{profile.lastName}</div>
              </h4>
            </li>
            <li className="list-item">
              <span className="location">{country?.name}</span>
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
              <a href="" className="social-media-link linkedin">
                Linkedin
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
