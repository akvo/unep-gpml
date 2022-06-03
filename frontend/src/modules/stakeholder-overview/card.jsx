import React from "react";
import { Row, Card, Avatar } from "antd";
import { Link } from "react-router-dom";

import { UIStore } from "../../store";
import unionIcon from "../../images/stakeholder-overview/union-icon.svg";
import communityIcon from "../../images/stakeholder-overview/union-2-icon.svg";

import { colors } from "../../utils/misc";

const ProfileCard = ({ profile, isValidUser, profileType }) => {
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
          : "/connect/community"
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
              {profile.picture ? (
                <Avatar src={profile.picture} size={150} alt={profile.name}>
                  {profile.name.substring(0, 2)}
                </Avatar>
              ) : (
                <Avatar
                  style={{
                    backgroundColor:
                      colors[Math.floor(Math.random() * colors.length)],
                    verticalAlign: "middle",
                    fontSize: "62px",
                    fontWeight: "bold",
                  }}
                  size={150}
                >
                  {profile?.name?.substring(0, 1)}
                </Avatar>
              )}
            </div>
          ) : (
            <div className="images-wrapper">
              <div className="image-wrapper">
                {profile.picture ? (
                  <Avatar
                    src={profile.picture}
                    size={150}
                    alt={
                      profile?.firstName ? profile?.firstName : profile?.name
                    }
                  >
                    {profile?.firstName?.substring(0, 1)}
                  </Avatar>
                ) : (
                  <Avatar
                    style={{
                      backgroundColor:
                        colors[Math.floor(Math.random() * colors.length)],
                      verticalAlign: "middle",
                      fontSize: "62px",
                      fontWeight: "bold",
                    }}
                    size={150}
                  >
                    {profile?.firstName
                      ? profile?.firstName?.substring(0, 1)
                      : profile?.name?.substring(0, 1)}
                  </Avatar>
                )}
              </div>
              {profile?.affiliation &&
                profile?.affiliation?.length !== 0 &&
                profileType !== "suggested-profiles" && (
                  <div className="affiliation-image-wrapper">
                    {profile?.affiliation?.logo ? (
                      <Avatar src={profile?.affiliation?.logo} size={40} />
                    ) : (
                      <Avatar
                        style={{
                          backgroundColor:
                            colors[Math.floor(Math.random() * colors.length)],
                          verticalAlign: "middle",
                        }}
                        size={40}
                      >
                        {profile?.affiliation?.name?.substring(0, 2)}
                      </Avatar>
                    )}
                  </div>
                )}
            </div>
          )}
          <div className="profile-details-container">
            <ul className="profile-detail-list">
              <li className="list-item">
                <h4 className="profile-name">
                  {profile.firstName ? (
                    <div className="trimmed-name">
                      {`${profile.firstName} ${profile.lastName}`}
                    </div>
                  ) : (
                    <div className="trimmed-name">{profile.name}</div>
                  )}
                </h4>
              </li>
              <li className="list-item">
                <span className={country?.name && "location"}>
                  {country?.name}
                </span>
              </li>
              <li className="list-item">
                {profile?.type === "stakeholder" && profile?.jobTitle && (
                  <span className="entity-name job-title">
                    {profile?.jobTitle}
                  </span>
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
          <ul className="role-name">
            {findSeeking &&
              findSeeking.length !== 0 &&
              findSeeking
                .slice(0, 3)
                .map((seeking, i) => (
                  <li key={`${i}-${seeking?.tag}`}>{seeking?.tag}</li>
                ))}
          </ul>
        </div>
      </Card>
    </Link>
  );
};

export default ProfileCard;
