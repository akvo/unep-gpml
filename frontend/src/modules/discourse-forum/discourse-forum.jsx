import { useEffect } from "react";

const DiscourseForum = () => {
  useEffect(() => {
    window.DiscourseEmbed = {
      discourseUrl: "https://unepdevtest.discoursehosting.net/",
      discourseEmbedUrl: "https://fb43-182-253-132-174.ngrok.io",
    };

    const d = document.createElement("script");
    d.type = "text/javascript";
    d.async = true;
    d.src = window.DiscourseEmbed.discourseUrl + "javascripts/embed.js";
    (
      document.getElementsByTagName("head")[0] ||
      document.getElementsByTagName("body")[0]
    ).appendChild(d);
  }, []);

  return (
    <div>
      <div id="discourse-comments"></div>
    </div>
  );
};

export default DiscourseForum;
