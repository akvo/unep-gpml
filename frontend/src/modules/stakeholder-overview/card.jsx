import React, { useState } from "react";
import { Row, Card, Popover } from "antd";
import { Link } from "react-router-dom";

import { UIStore } from "../../store";
import unionIcon from "../../images/stakeholder-overview/union-icon.svg";
import communityIcon from "../../images/stakeholder-overview/union-2-icon.svg";
import { ReactComponent as GPMLIcon } from "../../images/stakeholder-overview/gpml-logo.svg";
import { ReactComponent as MedalIcon } from "../../images/stakeholder-overview/medal-icon.svg";
import { ReactComponent as AgreementIcon } from "../../images/stakeholder-overview/agreement-icon.svg";
import { TrimText } from "../../utils/string";

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

  const popoverContent = () => {
    return (
      <div className="popover-wrapper">
        <h3>{profile?.type === "organisation" ? "Entity" : "Individual"}</h3>
        <h4
          className="profile-name"
          style={{ color: "#255b87", fontSize: "13px", fontWeight: "700" }}
        >
          {profile.firstName
            ? `${profile?.firstName} ${profile?.lastName}`
            : profile?.name}
        </h4>
      </div>
    );
  };

  return (
    <Popover content={popoverContent()}>
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
                    profile.picture
                      ? profile.picture
                      : `https://ui-avatars.com/api/?background=0D8ABC&size=480&name=${profile?.name}`
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
                        : `https://ui-avatars.com/api/?background=0D8ABC&size=480&name=${profile?.firstName}`
                    }
                    alt={`${profile.firstName} ${profile.lastName}`}
                  />
                  {profile?.affiliation &&
                    profile?.affiliation?.length !== 0 &&
                    profileType !== "suggested-profiles" && (
                      <div className="affiliation-image-wrapper">
                        <img
                          className="affiliation-image"
                          src={
                            profile?.affiliation?.logo
                              ? profile?.affiliation?.logo
                              : `https://ui-avatars.com/api/?background=0D8ABC&color=ffffff&size=480&name=${profile?.affiliation?.name}`
                          }
                          alt={profile?.affiliation?.name}
                        />
                      </div>
                    )}
                </div>
              </div>
            )}
            <div className="profile-details-container">
              <ul className="profile-detail-list">
                <li className="list-item">
                  <h4 className="profile-name">
                    {profile.firstName ? (
                      <div className="trimmed-name">
                        <TrimText
                          text={`${profile.firstName} ${profile.lastName}`}
                          max={30}
                        />
                      </div>
                    ) : (
                      <div className="trimmed-name">
                        <TrimText text={profile.name} max={30} />
                      </div>
                    )}
                  </h4>
                </li>
                <li className="list-item">
                  <span className={country?.name && "location"}>
                    <TrimText text={country?.name} max={15} />
                  </span>
                </li>
                <li className="list-item">
                  {profile?.type === "stakeholder" && profile?.jobTitle && (
                    <span className="entity-name job-title">
                      <TrimText text={profile?.jobTitle} max={20} />
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
            <p className="role-name">
              {findSeeking && findSeeking.length !== 0 && findSeeking[0].tag}
            </p>
          </div>
        </Card>
      </Link>
    </Popover>
  );
};

export default ProfileCard;
