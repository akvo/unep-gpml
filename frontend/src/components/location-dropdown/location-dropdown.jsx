import React from "react";
import GlobeIcon from "../../images/transnational.svg";
import { Button, Dropdown, Menu } from "antd";
import styles from './style.module.scss';

function LocationDropdown({
  countryList,
  dropdownVisible,
  setDropdownVisible,
  query,
}) {
  return (
    <Dropdown
      className={`location-filter ${
        query?.country?.length > 0 || query?.transnational?.length > 0
          ? "selected"
          : ""
      }`}
      overlayClassName={styles.locationFilterDropdown}
      overlay={countryList}
      placement="bottomLeft"
      trigger={["click"]}
      visible={dropdownVisible}
      onVisibleChange={(visible) => {
        setDropdownVisible(visible);
      }}
    >
      <Button size="small" ghost>
        <span>
          {(query?.country?.length > 0 || query?.transnational?.length > 0) &&
            (query?.transnational?.length ||
              0 + query?.country?.length ||
              0)}{" "}
          Location
        </span>
        <GlobeIcon />
      </Button>
    </Dropdown>
  );
}

export default LocationDropdown;
