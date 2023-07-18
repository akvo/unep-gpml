import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <link rel="icon" href="/favicon.ico" />
          <meta
            name="abstract"
            content="A multi-stakeholder partnership which brings together all the actors working on marine litter prevention and reduction."
          />
          <meta
            name="google-site-verification"
            content="RXyUT_0q_mUGWf-PPJlArc9gPyo_axbLOI446F7o0z0"
          />
          <link rel="apple-touch-icon" href="/logo192.png" />
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
          <NextScript />
          <script src="/env.js"></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
              (function(window, document, dataLayerName, id) {
                window[dataLayerName]=window[dataLayerName]||[],window[dataLayerName].push({start:(new Date).getTime(),event:"stg.start"});var scripts=document.getElementsByTagName('script')[0],tags=document.createElement('script');
                function stgCreateCookie(a,b,c){var d="";if(c){var e=new Date;e.setTime(e.getTime()+24*c*60*60*1e3),d="; expires="+e.toUTCString()}document.cookie=a+"="+b+d+"; path=/"}
                var isStgDebug=(window.location.href.match("stg_debug")||document.cookie.match("stg_debug"))&&!window.location.href.match("stg_disable_debug");stgCreateCookie("stg_debug",isStgDebug?1:"",isStgDebug?14:-1);
                var qP=[];dataLayerName!=="dataLayer"&&qP.push("data_layer_name="+dataLayerName),isStgDebug&&qP.push("stg_debug");var qPString=qP.length>0?("?"+qP.join("&")):"";
                tags.async=!0,tags.src="https://analytics.akvo.org/containers/"+id+".js"+qPString,scripts.parentNode.insertBefore(tags,scripts);
                !function(a,n,i){a[n]=a[n]||{};for(var c=0;c<i.length;c++)!function(i){a[n][i]=a[n][i]||{},a[n][i].api=a[n][i].api||function(){var a=[].slice.call(arguments,0);"string"==typeof a[0]&&window[dataLayerName].push({event:n+"."+i+":"+a[0],parameters:[].slice.call(arguments,1)})}}(i[c])}(window,"ppms",["tm","cm"]);
              })(window, document, 'dataLayer', '1331070d-ea07-4a42-8b50-07e5e6e303b5');
            `,
            }}
          />
          <noscript>
            <iframe
              src="https://analytics.akvo.org/containers/1331070d-ea07-4a42-8b50-07e5e6e303b5/noscript.html"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            ></iframe>
          </noscript>
        </body>
      </Html>
    );
  }
}

export default MyDocument;
