import React, { useState } from "react";
import { Button, Dropdown, Menu } from "antd";
import { UIStore } from "../../store";
import catTags from "../../utils/cat-tags.json";
import { ReactComponent as GlobeIcon } from "../../images/transnational.svg";
import { Icon } from "../../components/svg-icon/svg-icon";
import { useQuery } from "./common";
import CountryTransnationalFilter from "../../components/select/country-transnational-filter";

function slug(text) {
  return text.toLowerCase().replaceAll("&", "n").replaceAll(" ", "-");
}

const FilterBar = ({
  filter,
  setFilter,
  filterCountries,
  setFilterCountries,
}) => {
  const query = useQuery();
  const [multiCountryCountries, setMultiCountryCountries] = useState([]);
  const { countries } = UIStore.useState((s) => ({
    countries: s.countries,
  }));

  const handleClick0 = (catIndex) => () => {
    setFilter([catIndex]);
  };
  const handleBack = () => {
    setFilter([]);
  };

  const handleClick1 = (tag) => () => {
    let tagfilters = [...(filter[1] || [])];
    if (tagfilters.findIndex((it) => it === tag) > -1) {
      tagfilters = tagfilters.filter((it) => it !== tag);
    } else {
      tagfilters = [...tagfilters, tag];
    }
    setFilter([filter[0], tagfilters]);
  };

  const updateQuery = (param, value, paramValueArr) => {
    console.log("hello");
  };

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
    />
  );

  return (
    <div className="filter-bar">
      {filter.length === 0 && (
        <div className="level-0">
          <div>
            <small>Choose an expert category</small>
          </div>
          <div className="filter-tools">
            <ul>
              {catTags.map((cat, index) => {
                return (
                  <li onClick={handleClick0(index)}>
                    <Icon name={slug(cat.title)} fill="#67BEA1" />
                    <span>{cat.title}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
      {filter.length > 0 && (
        <div className="level-1">
          <div className={`selected-btn s${filter[0]}`} onClick={handleBack}>
            <small>&lt; Back to categories</small>
            <Icon name={slug(catTags[filter[0]].title)} fill="#67BEA1" />
            <div>
              <strong>{catTags[filter[0]].title}</strong>
              <small>Sub-topics</small>
            </div>
          </div>
          <ul>
            {catTags[filter[0]].topics.map((tag) => (
              <li
                onClick={handleClick1(tag)}
                className={
                  filter[1] && filter[1].indexOf(tag) > -1 && "selected"
                }
              >
                <div className="img-container">
                  <Icon name={slug(tag)} fill="#67BEA1" />
                </div>
                <div className="label-container">
                  <span>{tag}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Dropdown
        className="location-filter"
        overlayClassName="location-filter-dropdown"
        overlay={countryList}
        placement="bottomLeft"
        trigger={["click"]}
      >
        <Button>
          <GlobeIcon />
          <span>Location</span>
        </Button>
      </Dropdown>
    </div>
  );
};

export default FilterBar;
