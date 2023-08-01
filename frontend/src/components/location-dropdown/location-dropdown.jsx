import React from "react";
import GlobeIcon from "../../images/transnational.svg";
import { Button, Dropdown, Menu } from "antd";

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
      overlayClassName="location-filter-dropdown"
      overlay={countryList}
      placement="bottomLeft"
      trigger={["click"]}
      visible={dropdownVisible}
      onVisibleChange={(visible) => {
        setDropdownVisible(visible);
      }}
    >
      <Button>
        <GlobeIcon />
        <span>
          {(query?.country?.length > 0 || query?.transnational?.length > 0) &&
            (query?.transnational?.length ||
              0 + query?.country?.length ||
              0)}{" "}
          Location
        </span>
      </Button>
    </Dropdown>
  );
}

export default LocationDropdown;
