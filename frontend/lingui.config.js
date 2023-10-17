const { formatter } = require('@lingui/format-po')

const locales = ['en', 'fr', 'es']

if (process.env.NODE_ENV !== 'production') {
  locales.push('pseudo')
}

/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  locales: locales,
  sourceLocale: 'en',
  pseudoLocale: 'pseudo',
  catalogs: [
    {
      path: 'src/translations/locales/{locale}',
      include: ['src/pages', 'src/modules'],
    },
  ],
  format: 'po',
}
