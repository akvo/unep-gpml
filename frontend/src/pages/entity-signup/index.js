import React from "react";
import SignupView from "../../modules/signup/view";

function EntitySignUp() {
  return <SignupView formType="entity" match={{ params: {} }} />;
}

export default EntitySignUp;
