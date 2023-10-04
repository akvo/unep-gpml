import React from 'react'
import StakeholderOverview from '../../modules/stakeholder-overview/view'

function Community({ setLoginVisible, isAuthenticated, loadingProfile }) {
  return (
    <StakeholderOverview
      {...{ loadingProfile, setLoginVisible, isAuthenticated }}
    />
  )
}

export default Community
