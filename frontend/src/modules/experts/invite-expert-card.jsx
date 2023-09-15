import React from "react";
import styles from "./invite-expert-card.module.scss";
import { Card, Button } from "antd";

const InviteExpertCard = ({ setIsShownModal }) => {
  return (
    <Card className={styles.inviteExpertCard}>
      <div className="invite-expert-image-wrapper">
        <img src="/stakeholder-overview/megaphone-icon.svg" alt="" />
      </div>
      <div className="invite-expert-button-wrapper">
        <h3 className="invite-expert-text">Do you know an expert?</h3>
        <Button
          size="small"
          onClick={() => setIsShownModal(true)}
        >
          Suggest an expert
        </Button>
      </div>
    </Card>
  );
};
export default InviteExpertCard;
