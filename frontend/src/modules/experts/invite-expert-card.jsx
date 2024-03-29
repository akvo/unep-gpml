import React from 'react'
import styles from './invite-expert-card.module.scss'
import { Card } from 'antd'
import Button from '../../components/button'

const InviteExpertCard = ({ setIsShownModal }) => {
  return (
    <Card className={styles.inviteExpertCard}>
      <div className="invite-expert-image-wrapper">
        <img src="/stakeholder-overview/megaphone-icon.svg" alt="" />
      </div>
      <div>
        <h3 className="invite-expert-text">Do you know an expert?</h3>
        <Button
          className="invite-expert-button"
          onClick={() => setIsShownModal(true)}
        >
          Suggest an expert
        </Button>
      </div>
    </Card>
  )
}
export default InviteExpertCard
