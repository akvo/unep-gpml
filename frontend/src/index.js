import { Auth0Provider } from '@auth0/auth0-react';
import React from 'react';
import ReactDOM from 'react-dom';
import './main.scss';
import reportWebVitals from './reportWebVitals';
import Root from './root';

// hack to reuse the same `issuer` value
// auth0-react wants the `domain` value only
const domain = window.__ENV__.auth0.domain.replaceAll(/(https:\/\/|\/)/ig, "");

ReactDOM.render(
    <Auth0Provider
        domain={domain}
        clientId={window.__ENV__.auth0.clientId}
        redirectUri={window.location.origin}
        >
      <Root />
    </Auth0Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
