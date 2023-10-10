import React from 'react'
import StakeholderDetailPage from '../../modules/stakeholder-detail/view'

function StakeholderDetail({
  setLoginVisible,
  isAuthenticated,
  loadingProfile,
}) {
  return (
    <StakeholderDetailPage
      {...{ setLoginVisible, isAuthenticated, loadingProfile }}
    />
  )
}

export default StakeholderDetail
