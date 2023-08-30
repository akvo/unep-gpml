import React from "react";
import ExpertsPage from "../../modules/experts/view";

function Experts({ setLoginVisible, isAuthenticated }) {
  return (
    <ExpertsPage
      setLoginVisible={setLoginVisible}
      isAuthenticated={isAuthenticated}
    />
  );
}

export default Experts;
