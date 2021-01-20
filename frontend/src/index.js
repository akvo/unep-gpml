import { Auth0Provider } from '@auth0/auth0-react';
import React from 'react';
import ReactDOM from 'react-dom';
import './main.scss';
import reportWebVitals from './reportWebVitals';
import Root from './root';

ReactDOM.render(
    <Auth0Provider
        domain="unep-gpml-test.eu.auth0.com"
        clientId="dxfYNPO4D9ovQr5NHFkOU3jwJzXhcq5J"
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
