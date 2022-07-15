import React from "react";
import "./invite-expert-card.scss";
import { Card, Button } from "antd";
import MegaphoneIcon from "../../images/stakeholder-overview/megaphone-icon.svg";

const InviteExpertCard = ({ setIsShownModal }) => {
  return (
    <Card className="invite-expert-card">
      <div className="invite-expert-image-wrapper">
        <img src={MegaphoneIcon} alt="" />
      </div>
      <h3 className="invite-expert-text">Do you know any expert?</h3>
      <Button
        shape="round"
        size="medium"
        className="invite-expert-button"
        onClick={() => setIsShownModal(true)}
      >
        Suggest an expert
      </Button>
    </Card>
  );
};
export default InviteExpertCard;
