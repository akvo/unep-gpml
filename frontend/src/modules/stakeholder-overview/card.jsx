import React from "react";
import { Row, Card } from "antd";
import { Link } from "react-router-dom";

import { UIStore } from "../../store";
import unionIcon from "../../images/stakeholder-overview/union-icon.svg";
import communityIcon from "../../images/stakeholder-overview/union-2-icon.svg";
import { ReactComponent as GPMLIcon } from "../../images/stakeholder-overview/gpml-logo.svg";
import { ReactComponent as MedalIcon } from "../../images/stakeholder-overview/medal-icon.svg";
import { ReactComponent as AgreementIcon } from "../../images/stakeholder-overview/agreement-icon.svg";

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
                    : `https://ui-avatars.com/api/?size=480&name=${profile?.name}`
                }
                alt={profile?.name}
              />
            </div>
          ) : (
            <div className="images-wrapper">
              <div className="image-wrapper">
                <img
                  className="profile-image"
                  src={
                    profile?.picture
                      ? profile?.picture
                      : `https://ui-avatars.com/api/?size=480&name=${profile?.firstName}`
                  }
                  alt={`${profile.firstName} ${profile.lastName}`}
                />
              </div>
              {profile?.affiliation &&
                profile?.affiliation?.length !== 0 &&
                profileType !== "suggested-profiles" && (
                  <div className="affiliation-image-wrapper">
                    <img
                      className="affiliation-image"
                      src={
                        profile?.affiliation?.logo
                          ? profile?.affiliation?.logo
                          : `https://ui-avatars.com/api/?size=480&name=${profile?.affiliation?.name}`
                      }
                      alt={profile?.affiliation?.name}
                    />
                  </div>
                )}
            </div>
          )}
          <div className="profile-details-container">
            <ul className="profile-detail-list">
              <li className="list-item">
                <h4 className="profile-name">
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
                {profile?.type === "stakeholder"
                  ? profile?.affiliation && (
                      <span className="entity-name">
                        {profile?.affiliation?.name}
                      </span>
                    )
                  : profile?.representativeGroupCivilSociety && (
                      <span className="organisation-type">
                        {profile?.representativeGroupCivilSociety}
                      </span>
                    )}
              </li>
            </ul>
            {/* <ul className="icons-list">
              {profile?.isMember && (
                <li>
                  <GPMLIcon />
                </li>
              )}
            </ul> */}
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
