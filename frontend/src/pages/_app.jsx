import React, { useState } from "react";
import { Auth0Provider } from "@auth0/auth0-react";
import Head from "next/head";
import "../main.scss";
import withLayout from "../layouts/withLayout";

function MyApp({ Component, pageProps }) {
  const [setStakeholderSignupModalVisible] = useState(false);

  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [filters, setFilters] = useState(null);
  const [filterMenu, setFilterMenu] = useState(null);
  const [showResponsiveMenu, setShowResponsiveMenu] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [_expiresAt, setExpiresAt] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [authResult, setAuthResult] = useState(null);

  const Layout = withLayout(Component);

  return (
    <div id="root">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="GPML Digital Platform" />
        <title>UNEP GPML Digital Platform</title>
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </div>
  );
}

export default MyApp;
