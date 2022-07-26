import React, { useState } from "react";
import { Button } from "antd";
import { useQuery } from "../../utils/misc";
import { Icon } from "../../components/svg-icon/svg-icon";
import { ReactComponent as FilterIcon } from "../../images/knowledge-library/filter-icon.svg";
import { ReactComponent as OverviewIcon } from "../../images/overview.svg";
import CountryTransnationalFilter from "../../components/select/country-transnational-filter";
import LocationDropdown from "../../components/location-dropdown/location-dropdown";
import api from "../../utils/api";

const resourceTypes = [
  { key: "technical-resource", label: "Technical Resources" },
  { key: "event", label: "Events" },
  { key: "technology", label: "Technology" },
  { key: "capacity-building", label: "Capacity Building" },
  { key: "initiative", label: "Initiatives" },
  { key: "action-plan", label: "Policy" },
  { key: "policy", label: "Policy" },
  { key: "financing-resource", label: "Financing Resources" },
];

const FilterBar = ({
  view,
  setView,
  filter,
  setFilter,
  setIsShownModal,
  filterCountries,
  setFilterCountries,
}) => {
  const query = useQuery();
  const [country, setCountry] = useState([]);
  const [multiCountry, setMultiCountry] = useState([]);
  const [multiCountryCountries, setMultiCountryCountries] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [disable, setDisable] = useState({
    country: false,
    multiCountry: false,
  });

  const handleClickFilter = (key) => () => {
    if (filter.indexOf(key) === -1) {
      setFilter([...filter, key]);
    } else {
      setFilter(filter.filter((it) => it !== key));
    }
    if (view === "overview") {
      setView("map");
    }
  };

  const handleClickOverview = () => {
    setView("overview");
    setFilter([]);
  };

  const updateQuery = (param, value) => {
    if (param === "country") {
      setDisable({
        ...disable,
        ...(value.length > 0
          ? { multiCountry: true }
          : { multiCountry: false }),
      });
      setCountry(value);
      setFilterCountries(value.map((item) => item.toString()));
    }
    if (param === "transnational") {
      setDisable({
        ...disable,
        ...(value.length > 0 ? { country: true } : { country: false }),
      });
      if (value.length === 0) {
        setFilterCountries([]);
      }
      setMultiCountry(value);

      value.forEach((id) => {
        const check = filterCountries.find((x) => x === id.toString());
        !check &&
          api.get(`/country-group/${id}`).then((resp) => {
            setFilterCountries([
              ...filterCountries,
              ...resp.data?.[0]?.countries.map((item) => item.id.toString()),
            ]);
          });
      });
    }
  };

  const countryList = (
    <CountryTransnationalFilter
      {...{
        query,
        updateQuery,
        multiCountryCountries,
        setMultiCountryCountries,
      }}
      country={country || []}
      multiCountry={multiCountry || []}
      multiCountryLabelCustomIcon={true}
      countrySelectMode="multiple"
      multiCountrySelectMode="multiple"
      isExpert={true}
      disable={disable}
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
            onClick={handleClickFilter(it.key)}
            className={filter.indexOf(it.key) !== -1 && "selected"}
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
        }}
      />
    </div>
  );
};

export default FilterBar;
