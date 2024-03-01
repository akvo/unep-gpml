// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://42e4971ab9224be0a5f4babba207e6f4@o65834.ingest.sentry.io/5732892",

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
