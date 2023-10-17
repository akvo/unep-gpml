import { i18n } from '@lingui/core'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export async function loadCatalog(locale) {
  const { messages } = await import(`@lingui/loader!./locales/${locale}.po`)

  return messages
}

export function useLinguiInit(messages) {
  const router = useRouter()
  const locale = router.locale || router.defaultLocale
  const isClient = typeof window !== 'undefined'

  if (!isClient && locale !== i18n.locale) {
    i18n.loadAndActivate({ locale, messages })
  }
  if (isClient && i18n.locale === undefined) {
    i18n.loadAndActivate({ locale, messages })
  }

  useEffect(() => {
    const localeDidChange = locale !== i18n.locale
    if (localeDidChange) {
      i18n.loadAndActivate({ locale, messages })
    }
  }, [locale, messages])

  return i18n
}
