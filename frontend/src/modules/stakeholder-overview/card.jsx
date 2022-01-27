import React, { useState } from "react";
import { Row, Col, Card } from "antd";

import { UIStore } from "../../store";

import firstPic from "../../images/stakeholder-overview/first-avatar.jpg";
import secondPic from "../../images/stakeholder-overview/second-avatar.jpg";
import badge from "../../images/stakeholder-overview/badge.svg";
import unionIcon from "../../images/stakeholder-overview/union-icon.svg";

const ProfileCard = ({ profile }) => {
  const { entityRoleOptions, countries, stakeholders } = UIStore.useState(
    (s) => ({
      entityRoleOptions: s.entityRoleOptions,
      countries: s.countries,
      tags: s.tags,
      geoCoverageTypeOptions: s.geoCoverageTypeOptions,
      languages: s.languages,
      seeking: s.seeking,
      stakeholders: s.stakeholders,
    })
  );

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
            src={profile.picture || profile.logo}
            alt=""
          />
        </div>
        <div className="profile-details-container">
          <ul className="profile-detail-list">
            <li className="list-item">
              <h4 className="person-name">
                <div>{profile.first_name}</div>
                <div>{profile.last_name}</div>
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
            {profile.linked_in && (
              <li className="list-item">
                <a href="" className="social-media-link linkedin">
                  Linkedin
                </a>
              </li>
            )}
            {profile.twitter && (
              <li className="list-item">
                <a href="" className="social-media-link twitter">
                  Twitter
                </a>
              </li>
            )}
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
