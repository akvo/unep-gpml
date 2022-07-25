import React from "react";
import { Card, Avatar } from "antd";
import { Link } from "react-router-dom";
import { randomColor } from "../../utils/misc";
import { ReactComponent as LocationIcon } from "../../images/location.svg";
import { ReactComponent as ExpertBadge } from "../../images/stakeholder-overview/expert-badge.svg";
import { ReactComponent as CircledUserIcon } from "../../images/stakeholder-overview/union-outlined.svg";
import { titleCase } from "../../utils/string";

const ExpertCard = ({ expert, countries, organisations }) => {
  const country = countries.find((country) => country.id === expert.country)
    ?.name;

  const entity = organisations.find(
    (organisation) => organisation.id === expert.affiliation
  );
  return (
    <Link to={`/stakeholder/${expert?.id}`}>
      <Card key={expert?.id} className="expert-card">
        <div className="expert-detail-list">
          <div className="list-item expert-image-wrapper">
            {expert?.affiliation && (
              <Avatar
                className="entity-logo"
                style={{
                  backgroundColor: randomColor(entity?.name?.substring(0, 1)),
                  verticalAlign: "middle",
                }}
                size={32}
              >
                {entity?.name?.substring(0, 2)}
              </Avatar>
            )}
            <div className="expert-badge">
              <ExpertBadge />
            </div>
            <Avatar
              className={`expert-image ${!expert.picture && "no-image"}`}
              src={expert.picture}
              style={{
                backgroundColor: randomColor(
                  expert?.firstName?.substring(0, 1)
                ),
              }}
              alt={expert?.firstName ? expert?.firstName : expert?.name}
            >
              {!expert.picture && <CircledUserIcon />}
              <span>
                {`${expert?.firstName
                  ?.substring(0, 1)
                  ?.toUpperCase()}${expert?.lastName
                  ?.substring(0, 1)
                  ?.toUpperCase()}`}
              </span>
            </Avatar>
          </div>
          <ul>
            <li className="expert-name">
              {`${titleCase(expert?.firstName)} ${titleCase(expert?.lastName)}`}
            </li>
            {expert?.country && (
              <li className="expert-location">
                <LocationIcon />
                <span>{country}</span>
              </li>
            )}
            <li className="expert-activity">{expert?.expertise?.join(", ")}</li>
          </ul>
        </div>
      </Card>
    </Link>
  );
};

export default ExpertCard;
