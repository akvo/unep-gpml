module.exports = [
  'strapi::errors',
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "script-src": ["'self'", "*.tinymce.com", "*.tiny.cloud", "https:"],
          "connect-src": ["'self'", "*.tinymce.com", "*.tiny.cloud", "blob:", "*.strapi.io"],
          "img-src": [
            "'self'",
            "*.tinymce.com",
            "*.tiny.cloud",
            "data:",
            "blob:",
            "dl.airtable.com",
            "strapi.io",
            "s3.amazonaws.com",
            "cdn.jsdelivr.net",
            "storage.googleapis.com",
          ],
          "style-src": [
            "'self'",
            "'unsafe-inline'",
            "*.tinymce.com",
            "*.tiny.cloud",
          ],
          "font-src": ["'self'", "*.tinymce.com", "*.tiny.cloud"],
          "media-src": ["'self'", "data:", "blob:", "storage.googleapis.com"],
        },
        upgradeInsecureRequests: null,
      },
    },
  },
  {
    name: "strapi::cors",
    config: {
      enabled: false,
      origin: ["*"], 
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
      headers: [
        "Content-Type",
        "Authorization",
        "baggage", 
        "sentry-trace", 
      ],
      credentials: false,
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      jsonLimit: '10mb', 
      formLimit: '10mb', 
      textLimit: '10mb', 
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
