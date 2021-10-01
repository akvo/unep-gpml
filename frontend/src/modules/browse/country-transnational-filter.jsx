import { UIStore } from "../../store";
import React from "react";
import { Select, Tabs, Popover } from "antd";
import { DownOutlined, InfoCircleOutlined } from "@ant-design/icons";
import isEmpty from "lodash/isEmpty";

const { TabPane } = Tabs;

const CountryTransnationalFilter = ({
  handleChangeTab,
  country,
  handleChangeCountry,
  multiCountry,
  handleChangeMultiCountry,
  multiCountryCountries,
}) => {
  const { countries, transnationalOptions } = UIStore.useState((s) => ({
    countries: s.countries,
    transnationalOptions: s.transnationalOptions,
  }));

  const isLoaded = () => !isEmpty(countries) && !isEmpty(transnationalOptions);

  const countryOpts = isLoaded()
    ? countries
        .map((it) => ({ value: it.id, label: it.name }))
        .sort((a, b) => a.label.localeCompare(b.label))
    : [];

  const multiCountryOpts = isLoaded()
    ? transnationalOptions
        .map((it) => ({ value: it.id, label: it.name }))
        .sort((a, b) => a.label.localeCompare(b.label))
    : [];

  return (
    <Tabs type="card" className="country-filter-tab" onChange={handleChangeTab}>
      <TabPane
        tab="Countries"
        key="country"
        className="country-filter-tab-pane country"
      >
        <Select
          showSearch
          allowClear
          placeholder="Countries"
          options={countryOpts}
          optionFilterProp="children"
          filterOption={(input, option) =>
            option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          value={country}
          onChange={handleChangeCountry}
          virtual={false}
        />
      </TabPane>
      <TabPane
        tab="Multi-Country"
        key="multi-country"
        className={`country-filter-tab-pane ${
          multiCountry ? "multi-country-info" : "multi-country"
        }`}
      >
        <Select
          showSearch
          allowClear
          placeholder="Multi-Country"
          options={multiCountryOpts}
          optionFilterProp="children"
          filterOption={(input, option) =>
            option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          value={multiCountry}
          onChange={handleChangeMultiCountry}
          dropdownClassName="country-filter-dropdown"
          dropdownMatchSelectWidth={325}
          suffixIcon={
            multiCountry ? (
              <MultiCountryInfo multiCountryCountries={multiCountryCountries} />
            ) : (
              <DownOutlined />
            )
          }
        />
      </TabPane>
    </Tabs>
  );
};

const MultiCountryInfo = ({ multiCountryCountries }) => {
  const renderContent = () => {
    return (
      <div className="popover-content-wrapper">
        {multiCountryCountries &&
          multiCountryCountries.map(({ id, name }) => (
            <div key={`popover-${name}-${id}`} className="popover-content-item">
              {name}
            </div>
          ))}
      </div>
    );
  };

  if (!multiCountryCountries || isEmpty(multiCountryCountries)) {
    return "";
  }
  return (
    <Popover
      className="popover-multi-country"
      title={""}
      content={renderContent}
      placement="right"
      arrowPointAtCenter
    >
      <InfoCircleOutlined />
    </Popover>
  );
};

export default CountryTransnationalFilter;
