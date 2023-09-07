import React from "react";
import EntityDetail from "../../modules/entity-detail/view";

function Organisation({ isAuthenticated }) {
  return <EntityDetail isAuthenticated={isAuthenticated} />;
}

export default Organisation;
