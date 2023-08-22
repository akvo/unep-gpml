import React from "react";
import EventPage from "../../modules/event-page/view";

function Events({ setLoginVisible, isAuthenticated }) {
  return (
    <EventPage
      setLoginVisible={setLoginVisible}
      isAuthenticated={isAuthenticated}
    />
  );
}

export default Events;
