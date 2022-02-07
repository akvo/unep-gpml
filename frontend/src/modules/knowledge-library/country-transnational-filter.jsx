import { UIStore } from "../../store";
import React from "react";
import { Select, Tabs, Popover } from "antd";
import { DownOutlined, InfoCircleOutlined } from "@ant-design/icons";
import isEmpty from "lodash/isEmpty";

const { TabPane } = Tabs;
const { Option } = Select;

const CountryTransnationalFilter = ({
  handleChangeTab,
  country,
  handleChangeCountry,
  handleDeselectCountry,
  multiCountry,
  handleChangeMultiCountry,
  handleDeselectMultiCountry,
  multiCountryCountries,
  multiCountryLabelCustomIcon,
  countrySelectMode,
  multiCountrySelectMode,
}) => {
  const { countries, transnationalOptions, landing } = UIStore.useState(
    (s) => ({
      countries: s.countries,
      transnationalOptions: s.transnationalOptions,
      landing: s.landing,
    })
  );

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
          mode={countrySelectMode || ""}
          placeholder="Countries"
          options={countryOpts}
          optionFilterProp="children"
          filterOption={(input, option) =>
            option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          value={country}
          onChange={handleChangeCountry}
          onDeselect={handleDeselectCountry}
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
          mode={multiCountrySelectMode || ""}
          placeholder="Multi-Country"
          optionFilterProp="children"
          filterOption={(input, option) =>
            option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          value={multiCountry}
          onChange={handleChangeMultiCountry}
          onDeselect={handleDeselectMultiCountry}
          dropdownClassName="country-filter-dropdown"
          dropdownMatchSelectWidth={325}
          suffixIcon={
            !multiCountryLabelCustomIcon && multiCountry ? (
              <MultiCountryInfo
                multiCountryCountries={
                  multiCountryCountries.find((x) => x.id === multiCountry)
                    ?.countries
                }
              />
            ) : (
              <DownOutlined />
            )
          }
        >
          {multiCountryOpts.map(({ value, label }) => (
            <Option key={`${value}-${label}`} value={value} label={label}>
              <div>
                {label}{" "}
                {multiCountryLabelCustomIcon &&
                  multiCountry.includes(value) && (
                    <MultiCountryInfo
                      data={landing}
                      multiCountryCountries={
                        multiCountryCountries.find((x) => x.id === value)
                          ?.countries
                      }
                    />
                  )}
              </div>
            </Option>
          ))}
        </Select>
      </TabPane>
    </Tabs>
  );
};

const ResourcesInfo = (data) => {
  const resource = data?.data;
  return (
    <ul className="info-resources">
      <li>
        actionPlan: <b>{resource?.actionPlan}</b>
      </li>
      <li>
        event: <b>{resource?.event}</b>
      </li>
      <li>
        financingResource: <b>{resource?.financingResource}</b>
      </li>
      <li>
        organisation: <b>{resource?.organisation}</b>
      </li>
      <li>
        policy: <b>{resource?.policy}</b>
      </li>
      <li>
        project: <b>{resource?.project}</b>
      </li>
      <li>
        stakeholder: <b>{resource?.stakeholder}</b>
      </li>
      <li>
        technicalResource: <b>{resource?.technicalResource}</b>
      </li>
    </ul>
  );
};

const MultiCountryInfo = ({ multiCountryCountries, data }) => {
  const renderContent = () => {
    return (
      <div className="popover-content-wrapper">
        {multiCountryCountries &&
          multiCountryCountries.map(({ id, name }) => {
            const curr = data?.map?.find((i) => i?.countryId === id);

            return (
              <div
                key={`popover-${name}-${id}`}
                className="popover-content-item"
              >
                {name}
                <ResourcesInfo data={curr} />
              </div>
            );
          })}
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
