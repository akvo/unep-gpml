import { MOBILE_BREAKPOINT } from './constants'

/**
 * Filter layer data by country code or country name.
 * Used across all chart components to extract country-specific values.
 */
export function filterByCountry(valuePerCountry, countryCode, country) {
  if (!valuePerCountry) return []
  const decodedCountry = decodeURIComponent(country)
  return valuePerCountry.filter((item) =>
    item.CountryCode
      ? item.CountryCode === countryCode
      : item.CountryName === decodedCountry
  )
}

/**
 * Deduplicate filtered country data by CountryCode-Year key.
 */
export function deduplicateByYear(items) {
  return [
    ...new Map(
      items.map((item) => [`${item.CountryCode}-${item.Year}`, item])
    ).values(),
  ]
}

/**
 * Get the latest year entry from an array of country data items.
 */
export function getLatestYearData(data) {
  if (!data || data.length === 0) return null
  return data.reduce((latest, current) =>
    !latest || current.Year > latest.Year ? current : latest
  , null)
}

/**
 * Find a layer by its arcgislayerId.
 */
export function findLayer(layers, arcgislayerId) {
  return layers?.find(
    (layer) => layer.attributes.arcgislayerId === arcgislayerId
  )
}

/**
 * Split text into two lines at the midpoint (for chart titles).
 * On mobile or when split=true, always splits.
 */
export function splitIntoTwoLines(text, split = false) {
  if (typeof window !== 'undefined' && (window.innerWidth < MOBILE_BREAKPOINT || split)) {
    const words = text.split(' ')
    const mid = Math.floor(words.length / 2)
    return `${words.slice(0, mid).join(' ')}\n${words.slice(mid).join(' ')}`
  }
  return text
}

/**
 * Check if the current viewport is mobile.
 */
export function isMobileViewport() {
  return typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT
}
