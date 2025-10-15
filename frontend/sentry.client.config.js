import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn:
    'https://42e4971ab9224be0a5f4babba207e6f4@o65834.ingest.sentry.io/5732892',

  tracesSampleRate: 1,

  debug: false,

  replaysOnErrorSampleRate: 1.0,

  replaysSessionSampleRate: 0.1,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
})
