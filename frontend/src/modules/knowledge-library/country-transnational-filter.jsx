import { UIStore } from "../../store";
import React from "react";
import { Select, Tabs, Popover } from "antd";
import { DownOutlined, InfoCircleOutlined } from "@ant-design/icons";
import isEmpty from "lodash/isEmpty";
import { topicNames, tTypes } from "../../utils/misc";
import { multicountryGroups } from "./multicountry";
import { OptGroup } from "rc-select";

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
        .filter(
          (country) => country.description.toLowerCase() === "member state"
        )
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
          dropdownClassName="multiselection-dropdown"
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
          dropdownClassName="multiselection-dropdown"
          showSearch
          allowClear
          virtual={false}
          mode={multiCountrySelectMode || ""}
          placeholder="Multi-Country"
          optionFilterProp="children"
          filterOption={(input, option) =>
            option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          value={multiCountry}
          onChange={handleChangeMultiCountry}
          onDeselect={handleDeselectMultiCountry}
          dropdownClassName="multiselection-dropdown"
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
          {multicountryGroups
            .sort((a, b) => a.label.localeCompare(b.label))
            .map((transnationalGroup) => (
              <OptGroup
                key={transnationalGroup.label}
                label={transnationalGroup.label}
                isSelectOptGroup={true}
              >
                {transnationalGroup.item
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((transnational) => {
                    return (
                      <Option key={transnational.id} value={transnational.id}>
                        <div>
                          {transnational.name}{" "}
                          {multiCountryLabelCustomIcon &&
                            multiCountry.includes(transnational.id) && (
                              <MultiCountryInfo
                                data={landing}
                                multiCountryCountries={
                                  multiCountryCountries.find(
                                    (x) => x.id === transnational.id
                                  )?.countries
                                }
                              />
                            )}
                        </div>
                      </Option>
                    );
                  })}
              </OptGroup>
            ))}
        </Select>
      </TabPane>
    </Tabs>
  );
};

const ResourcesInfo = (data) => {
  const dataToDisplay = {
    project: data?.data?.counts?.project,
    actionPlan: data?.data?.counts?.actionPlan,
    policy: data?.data?.counts?.policy,
    technicalResource: data?.data?.counts?.technicalResource,
    financingResource: data?.data?.counts?.financingResource,
    event: data?.data?.counts?.event,
    technology: data?.data?.counts?.technology,
  };

  const transantionalResources = {
    project: data?.data?.transnationalCounts?.project,
    actionPlan: data?.data?.transnationalCounts?.actionPlan,
    policy: data?.data?.transnationalCounts?.policy,
    technicalResource: data?.data?.transnationalCounts?.technicalResource,
    financingResource: data?.data?.transnationalCounts?.financingResource,
    event: data?.data?.transnationalCounts?.event,
    technology: data?.data?.transnationalCounts?.technology,
  };

  return (
    <ul className="info-resources">
      {tTypes.map((topic) => {
        return (
          topic !== "organisation" &&
          topic !== "stakeholder" && (
            <li key={topic}>
              <span>{topicNames(topic)}</span>:{" "}
              <b>{dataToDisplay?.[topic] ? dataToDisplay[topic] : 0}</b>
              <b>
                {" "}
                {transantionalResources?.[topic] > 0 &&
                  `(${transantionalResources[topic]})`}
              </b>
            </li>
          )
        );
      })}
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
                <b>{name}</b>
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
