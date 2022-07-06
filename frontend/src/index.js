import "core-js/stable";
import "regenerator-runtime/runtime";
import { Auth0Provider } from "@auth0/auth0-react";
import { Auth0Client } from "@auth0/auth0-spa-js";
import React from "react";
import ReactDOM from "react-dom";
import "./main.scss";
import reportWebVitals from "./reportWebVitals";
import Root from "./root";
import { StateProvider } from "./store.js";
import api from "./utils/api";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Link,
  Switch,
  withRouter,
  useLocation,
} from "react-router-dom";

// HACK to reuse the same Sentry DSN & environment values as the backend
const { environment, dsn } = window.__ENV__.sentry;

Sentry.init({
  dsn,
  environment,
  integrations: [new Integrations.BrowserTracing()],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.1,
});

// hack to reuse the same `issuer` value
// auth0-react wants the `domain` value only
const domain = window.__ENV__.auth0.domain.replace(/(https:\/\/|\/)/gi, "");

ReactDOM.render(
  <Auth0Provider
    domain={domain}
    clientId={window.__ENV__.auth0.clientId}
    redirectUri={window.location.origin}
  >
    <Router>
      <Root />
    </Router>
  </Auth0Provider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
