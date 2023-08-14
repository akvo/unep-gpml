import React from "react";
import Landing from "../modules/landing/landing";

function HomePage({ isAuthenticated }) {
  return <Landing isAuthenticated={isAuthenticated} />;
}

export default HomePage;
