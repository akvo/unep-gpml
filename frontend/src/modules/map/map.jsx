import React, { useState, useEffect, Fragment } from 'react'
import styles from './map.module.scss'
import ReactTooltip from 'react-tooltip'
import { LoadingOutlined, DownOutlined } from '@ant-design/icons'
import MapChart from './map-chart'
import { Trans } from '@lingui/macro'

export const KNOWLEDGE_LIBRARY = 'knowledge'
export const STAKEHOLDER_OVERVIEW = 'community'
export const EXPERTS = 'experts'

const Maps = ({
  box,
  query,
  data,
  isLoaded,
  clickEvents,
  countData,
  stakeholderCount,
  multiCountries,
  listVisible,
  isDisplayedList,
  isFilteredCountry,
  multiCountryCountries,
  useVerticalLegend = false,
  countryGroupCounts,
  useTooltips = true,
  showLegend = false,
  zoom,
  path,
}) => {
  const [tooltipContent, setTooltipContent] = useState('')

  return (
    <div className={`${styles.mapLanding} map-landing`}>
      <div className="landing-container map-container">
        {!isLoaded() && (
          <h2 className="loading map-loader">
            <LoadingOutlined spin /> <Trans>Loading</Trans>
          </h2>
        )}
        <div
          style={{
            overflow: 'hidden',
            width: 'auto',
          }}
        >
          <MapChart
            {...{
              useTooltips,
              setTooltipContent,
              countData,
              stakeholderCount,
              box,
              isFilteredCountry,
              data,
              query,
              multiCountries,
              multiCountryCountries,
              clickEvents,
              setTooltipContent,
              listVisible,
              useVerticalLegend,
              isDisplayedList,
              countryGroupCounts,
              showLegend,
              zoom,
              path,
            }}
          />
          {useTooltips && (
            <ReactTooltip
              type="light"
              className={`${styles.mapTooltipWrapper} opaque`}
            >
              {tooltipContent}
            </ReactTooltip>
          )}
        </div>
      </div>
    </div>
  )
}

export default Maps
