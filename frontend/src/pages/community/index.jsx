import React from "react";
import StakeholderOverview from "../../modules/stakeholder-overview/view";

function Community({ setLoginVisible, isAuthenticated, loadingProfile }) {
  return (
    <StakeholderOverview
      setLoginVisible={setLoginVisible}
      isAuthenticated={isAuthenticated}
      loadingProfile={loadingProfile}
    />
  );
}

export default Community;
