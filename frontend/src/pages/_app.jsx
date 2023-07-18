import React from "react";
import Head from "next/head";
import "../main.scss";

function MyApp({ Component, pageProps }) {
  return (
    <div className="app">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="GPML Digital Platform" />
        <title>UNEP GPML Digital Platform</title>
      </Head>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
