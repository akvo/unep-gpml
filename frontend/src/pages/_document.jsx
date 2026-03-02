import Document, { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head>
          <meta charSet="utf-8" />
          <link rel="icon" href="/favicon.ico?v=2" />
          <meta
            name="description"
            content="The Global Plastics Hub is the largest global platform for technical resources, integrated data, and collaborative action on plastic pollution."
          />
          <meta
            name="google-site-verification"
            content="XxQZUvt514ZZramOg-RgwEV3Qa2qrUV04qMUSC-quz8"
          />
          <meta name="og:image" content="/apple-touch-icon.png" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link
            href="https://fonts.googleapis.com/css2?family=Jost:wght@200..900&display=swap"
            rel="stylesheet"
          />

          <style>{`
            #map-area {
              display:none;
            }
          `}</style>
        </Head>
        <body>
          <Main />
          <Script strategy='beforeInteractive' src="/env.js" />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
