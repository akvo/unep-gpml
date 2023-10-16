import { msg } from '@lingui/macro'

const languages = [
  {
    locale: 'en',
    msg: msg`English`,
    territory: 'US',
    rtl: false,
  },
  {
    locale: 'fr',
    msg: msg`Frech`,
    territory: 'FR',
    rtl: false,
  },
]

if (process.env.NODE_ENV !== 'production') {
  languages.push({
    locale: 'pseudo',
    msg: msg`Pseudo`,
    rtl: false,
  })
}

export default languages
