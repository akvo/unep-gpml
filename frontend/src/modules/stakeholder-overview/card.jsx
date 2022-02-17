import React from "react";
import { Row, Card } from "antd";
import { Link } from "react-router-dom";

import { UIStore } from "../../store";
import unionIcon from "../../images/stakeholder-overview/union-icon.svg";
import communityIcon from "../../images/stakeholder-overview/union-2-icon.svg";

const ProfileCard = ({ profile, isValidUser }) => {
  const { countries, seeking } = UIStore.useState((s) => ({
    countries: s.countries,
    seeking: s?.tags?.seeking,
  }));

  const country = countries.find((country) => country.id === profile.country);

  const findSeeking =
    profile.type !== "organisation" &&
    seeking?.filter((seek) => {
      return profile?.seeking?.includes(seek?.id);
    });

  return (
    <Link
      className="card-wrapper-link"
      to={
        isValidUser
          ? profile.type === "organisation"
            ? `/organisation/${profile?.id}`
            : `/stakeholder/${profile?.id}`
          : "/stakeholder-overview"
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
              <img
                className="profile-image"
                src={
                  profile.logo
                    ? profile.logo
                    : `https://ui-avatars.com/api/?size=480&name=${profile.name}`
                }
                alt=""
              />
            </div>
          ) : (
            <div className="image-wrapper">
              <img
                className="profile-image"
                src={
                  profile.picture
                    ? profile.picture
                    : `https://ui-avatars.com/api/?size=480&name=${profile.firstName}`
                }
                alt=""
              />
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
            </ul>

            <ul className="social-media-list">
              {profile.linkedIn && (
                <li className="list-item">
                  <div
                    role="link"
                    data-href={profile.linkedIn}
                    className="social-media-link linkedin"
                  >
                    Linkedin
                  </div>
                </li>
              )}
              {profile.twitter && (
                <li className="list-item">
                  <div
                    role="link"
                    data-href={profile.twitter}
                    className="social-media-link twitter"
                  >
                    Twitter
                  </div>
                </li>
              )}
              <li className="list-item"></li>
            </ul>
          </div>
        </Row>

        <div className="person-role">
          <p className="seeking-text">Seeking:</p>
          <p className="role-name">
            {findSeeking && findSeeking.length !== 0 && findSeeking[0].tag}
          </p>
        </div>
      </Card>
    </Link>
  );
};

export default ProfileCard;
