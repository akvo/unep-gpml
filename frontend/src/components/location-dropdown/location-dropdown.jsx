import React from "react";
import { ReactComponent as GlobeIcon } from "../../images/transnational.svg";
import { Button, Dropdown, Menu } from "antd";

function LocationDropdown({
  country,
  multiCountry,
  countryList,
  dropdownVisible,
  setDropdownVisible,
}) {
  return (
    <Dropdown
      className={`location-filter ${
        country.length > 0 || multiCountry.length > 0 ? "selected" : ""
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
          {(country.length > 0 || multiCountry.length > 0) &&
            multiCountry?.length + country?.length}{" "}
          Location
        </span>
      </Button>
    </Dropdown>
  );
}

export default LocationDropdown;
