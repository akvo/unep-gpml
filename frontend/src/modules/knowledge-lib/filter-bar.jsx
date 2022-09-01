import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { useQuery } from "../../utils/misc";
import { Icon } from "../../components/svg-icon/svg-icon";
import { ReactComponent as FilterIcon } from "../../images/knowledge-library/filter-icon.svg";
import { ReactComponent as OverviewIcon } from "../../images/overview.svg";
import CountryTransnationalFilter from "../../components/select/country-transnational-filter";
import LocationDropdown from "../../components/location-dropdown/location-dropdown";
import api from "../../utils/api";
import { LeftOutlined } from "@ant-design/icons";
import { withRouter } from "react-router-dom";

export const resourceTypes = [
  {
    key: "technical-resource",
    label: "Technical Resources",
    title: "technical_resource",
  },
  { key: "event", label: "Events", title: "event" },
  { key: "technology", label: "Technologies", title: "technology" },
  {
    key: "capacity-building",
    label: "Capacity Building",
    title: "capacity building",
  },
  { key: "initiative", label: "Initiatives", title: "initiative" },
  { key: "action-plan", label: "Action Plans", title: "action_plan" },
  { key: "policy", label: "Policies", title: "policy" },
  {
    key: "financing-resource",
    label: "Financing Resources",
    title: "financing_resource",
  },
];

const hideFilterList = [
  "offset",
  "country",
  "transnational",
  "topic",
  "view",
  "orderBy",
  "descending",
];

const FilterBar = ({
  setShowFilterModal,
  filterCountries,
  updateQuery,
  multiCountryCountries,
  setMultiCountryCountries,
  history,
  type,
  view,
  search,
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

  const handleClickOverview = () => {
    history.push({
      pathname: "/knowledge/library/overview",
      search: "",
    });
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
      <Button className="back-btn" onClick={handleClickOverview}>
        {/* <OverviewIcon /> */}
        <LeftOutlined />
        <span>Back to Overview</span>
      </Button>
      <ul>
        {resourceTypes.map((it) => (
          <li
            key={it.key}
            onClick={() => {
              if (type === it.key)
                history.push({
                  pathname: `/knowledge/library/resource/${view ? view : "map"}`,
                  search: search,
                });
              else
                history.push({
                  pathname: `/knowledge/library/resource/${
                    view ? (view === "category" ? "grid" : view) : "map"
                  }/${it.key}/`,
                  search: search,
                  state: { type: it.key },
                });
            }}
            className={type === it.key ? "selected" : ""}
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
      <Button className="adv-src" onClick={() => setShowFilterModal(true)}>
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
        <span>Advanced Search</span>
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

export default withRouter(FilterBar);
