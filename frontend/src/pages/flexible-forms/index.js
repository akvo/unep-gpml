import React from "react";
import FlexibleFormsPage from "../../modules/flexible-forms/view";

function FlexibleForms({ isAuthenticated, setLoginVisible }) {
  return (
    <FlexibleFormsPage
      setLoginVisible={setLoginVisible}
      isAuthenticated={isAuthenticated}
    />
  );
}

export default FlexibleForms;
