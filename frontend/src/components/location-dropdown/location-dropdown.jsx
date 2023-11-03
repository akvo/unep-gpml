import React from 'react'
import GlobeIcon from '../../images/transnational.svg'
import { Button, Dropdown, Menu } from 'antd'
import styles from './style.module.scss'
import { Trans } from '@lingui/macro'

function LocationDropdown({
  countryList,
  dropdownVisible,
  setDropdownVisible,
  query,
  value,
  placeholder,
}) {
  return (
    <Dropdown
      className={`location-filter ${
        query?.country?.length > 0 || query?.transnational?.length > 0
          ? 'selected'
          : ''
      }`}
      overlayClassName={`${styles.locationFilterDropdown} location-filter-dropdown`}
      overlay={countryList}
      placement="bottomLeft"
      trigger={['click']}
      visible={dropdownVisible}
      onVisibleChange={(visible) => {
        setDropdownVisible(visible)
      }}
    >
      <Button>
        <GlobeIcon />
        <span>
          {(query?.country?.length > 0 || query?.transnational?.length > 0) &&
            (query?.transnational?.length ||
              0 + query?.country?.length ||
              0)}{' '}
          {value ? value : placeholder ? placeholder : <Trans>Location</Trans>}
        </span>
      </Button>
    </Dropdown>
  )
}

export default LocationDropdown
