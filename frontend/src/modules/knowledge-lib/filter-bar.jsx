import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { useQuery } from "../../utils/misc";
import { Icon } from "../../components/svg-icon/svg-icon";
import { ReactComponent as FilterIcon } from "../../images/knowledge-library/filter-icon.svg";
import { ReactComponent as OverviewIcon } from "../../images/overview.svg";
import CountryTransnationalFilter from "../../components/select/country-transnational-filter";
import LocationDropdown from "../../components/location-dropdown/location-dropdown";
import api from "../../utils/api";

export const resourceTypes = [
  { key: "technical-resource", label: "Technical Resources" },
  { key: "event", label: "Events" },
  { key: "technology", label: "Technology" },
  { key: "capacity-building", label: "Capacity Building" },
  { key: "project", label: "Initiatives" },
  { key: "action-plan", label: "Action Plan" },
  { key: "policy", label: "Policy" },
  { key: "financing-resource", label: "Financing Resources" },
];

const hideFilterList = ["offset", "country", "transnational", "topic", "view"];

const FilterBar = ({
  view,
  setView,
  filter,
  setFilter,
  setIsShownModal,
  filterCountries,
  setFilterCountries,
  updateQuery,
  multiCountryCountries,
  setMultiCountryCountries,
}) => {
  const query = useQuery();
  const [country, setCountry] = useState([]);
  const [multiCountry, setMultiCountry] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [disable, setDisable] = useState({
    country: false,
    multiCountry: false,
  });

  const isEmpty = Object.values(query).every(
    (x) => x === null || x === undefined || x?.length === 0
  );

  const handleClickFilter = (key) => () => {
    if (query?.topic?.includes(key)) {
      updateQuery(
        "topic",
        query?.topic?.filter((it) => it !== key),
        true
      );
    } else {
      updateQuery("topic", key, true);
    }
    if (view === "overview") {
      setView("map");
    }
  };

  const handleClickOverview = () => {
    setView("overview");
    setFilter([]);
  };

  useEffect(() => {
    if (
      filterCountries &&
      filterCountries.length > 0 &&
      multiCountry.length === 0
    ) {
      setCountry(filterCountries.map((item) => parseInt(item)));
    } else {
      setCountry([]);
    }
  }, [filterCountries, multiCountry]);

  const countryList = (
    <CountryTransnationalFilter
      {...{
        query,
        updateQuery,
        multiCountryCountries,
        setMultiCountryCountries,
      }}
      country={query?.country?.map((x) => parseInt(x)) || []}
      multiCountry={query?.transnational?.map((x) => parseInt(x)) || []}
      multiCountryLabelCustomIcon={true}
      countrySelectMode="multiple"
      multiCountrySelectMode="multiple"
      fetch={true}
      disable={disable}
      setDisable={setDisable}
    />
  );

  return (
    <div className="filter-bar">
      <Button
        className={view === "overview" && "selected"}
        onClick={handleClickOverview}
      >
        <OverviewIcon />
        <span>Overview</span>
      </Button>
      <ul>
        {resourceTypes.map((it) => (
          <li
            key={it.key}
            onClick={handleClickFilter(it.key.replace(/-/g, "_"))}
            className={
              query?.topic?.includes(it.key.replace(/-/g, "_"))
                ? "selected"
                : ""
            }
          >
            <div className="img-container">
              <Icon name={`resource-types/${it.key}`} fill="#FFF" />
            </div>
            <div className="label-container">
              <span>{it.label}</span>
            </div>
          </li>
        ))}
      </ul>
      <Button onClick={() => setIsShownModal(true)}>
        {!isEmpty &&
          Object.keys(query).filter((item) => !hideFilterList.includes(item))
            .length > 0 && (
            <div class="filter-status">
              {Object.keys(query).filter(
                (item) => !hideFilterList.includes(item)
              ).length > 0 &&
                Object.keys(query).filter(
                  (item) => !hideFilterList.includes(item)
                ).length}
            </div>
          )}
        <FilterIcon />
        <span>More Filters</span>
      </Button>
      <LocationDropdown
        {...{
          country,
          multiCountry,
          countryList,
          dropdownVisible,
          setDropdownVisible,
          query,
        }}
      />
    </div>
  );
};

export default FilterBar;
