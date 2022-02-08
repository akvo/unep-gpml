import React, { useState } from "react";
import { Row, Col, Card } from "antd";
import { Link } from "react-router-dom";

import { UIStore } from "../../store";

import firstPic from "../../images/stakeholder-overview/first-avatar.jpg";
import secondPic from "../../images/stakeholder-overview/second-avatar.jpg";
import { ReactComponent as Badge } from "../../images/stakeholder-overview/badge.svg";
import unionIcon from "../../images/stakeholder-overview/union-icon.svg";
import communityIcon from "../../images/stakeholder-overview/union-2-icon.svg";
import { ReactComponent as GPMLlogo } from "../../images/stakeholder-overview/gpml-logo.svg";

const ProfileCard = ({ profile }) => {
  const { countries } = UIStore.useState((s) => ({
    countries: s.countries,
  }));

  const country = countries.find((country) => country.id === profile.country);

  return (
    <Link
    className='card-wrapper-link'
      to={
        profile.type === "organisation"
          ? `/organisation/${profile?.id}`
          : `/stakeholder/${profile?.id}`
      }
    >
      <Card className="profile-card">
        <div className="profile-icon-container">
          {profile.type === "organisation" ? (
            <img src={communityIcon} alt="union-icon" />
          ) : (
            <img src={unionIcon} alt="union-icon" />
          )}
        </div>
        <Row type="flex" className="profile-details">
          {profile.type === "organisation" ? (
            <div className="image-wrapper organisation-image">
              <img className="profile-image" src={profile.logo} alt="" />
            </div>
          ) : (
            <div className="image-wrapper">
              <img className="profile-image" src={profile.picture} alt="" />
            </div>
          )}
          <div className="profile-details-container">
            <ul className="profile-detail-list">
              <li className="list-item">
                <h4 className="person-name">
                  {profile.firstName ? (
                    <>
                      <div>{profile.firstName}</div>
                      <div>{profile.lastName}</div>
                    </>
                  ) : (
                    <div>{profile.name}</div>
                  )}
                </h4>
              </li>
              <li className="list-item">
                <span className={country?.name && "location"}>
                  {country?.name}
                </span>
              </li>
              <li className="list-item">
                {profile.entity_name && (
                  <span className="entity-name">Entity Name</span>
                )}
              </li>
              {/* <ul className="icons-list" >
              <li className="list-item">
                <Badge />
              </li>
              {profile.is_member && (
                <li className="list-item">
                  <GPMLlogo />
                </li>
              )}
            </ul> */}
            </ul>

            <ul className="social-media-list">
              {profile.linked_in && (
                <li className="list-item">
                  <div role='link' href='' className="social-media-link linkedin">
                    Linkedin
                  </div>
                </li>
              )}
              {profile.twitter && (
                <li className="list-item">
                  <div role='link' href="" className="social-media-link twitter">
                    Twitter
                  </div>
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
    </Link>
  );
};

export default ProfileCard;
