import React from 'react'
import { Select, Tabs, Popover } from 'antd'
import { DownOutlined, InfoCircleOutlined } from '@ant-design/icons'
import isEmpty from 'lodash/isEmpty'
import { UIStore } from '../../store'
import { TrimText } from '../../utils/string'
import { multicountryGroups } from '../../modules/knowledge-library/multicountry'
import { OptGroup } from 'rc-select'
import './style.module.scss'
import api from '../../utils/api'
import { Trans, t } from '@lingui/macro'
import { SearchIcon } from '../icons'
const { TabPane } = Tabs
const { Option } = Select

const CountryTransnationalFilter = ({
  query,
  updateQuery,
  country,
  multiCountry,
  multiCountryCountries,
  multiCountryLabelCustomIcon,
  countrySelectMode,
  multiCountrySelectMode,
  setMultiCountryCountries,
  isExpert,
  disable,
  setDisable,
  fetch,
  history,
  isCommunity,
}) => {
  const { countries, transnationalOptions, landing } = UIStore.useState(
    (s) => ({
      countries: s.countries,
      transnationalOptions: s.transnationalOptions,
      landing: s.landing,
    })
  )

  const isLoaded = () => !isEmpty(countries) && !isEmpty(transnationalOptions)

  const countryOpts = isLoaded()
    ? countries
        .filter(
          (country) => country.description.toLowerCase() === 'member state'
        )
        .map((it) => ({ value: it.id, label: it.name }))
        .sort((a, b) => a.label.localeCompare(b.label))
    : []

  const handleChangeLocationTab = (key) => {
    const param = key === 'country' ? 'transnational' : 'country'
  }

  const handleChangeCountry = (val) => {
    if (isExpert) {
      updateQuery('country', val)
      return
    }
    if (setDisable) {
      setDisable({
        ...disable,
        ...(val.length > 0 ? { multiCountry: true } : { multiCountry: false }),
      })
    }

    if (isCommunity) {
      updateQuery('country', val, false)
      return
    }

    let updatedQuery = { ...history.query }
    delete updatedQuery.totalCount

    if (val && val.length > 0) {
      updatedQuery.country = val.toString()
    } else {
      delete updatedQuery.country
    }
    history.push({
      pathname: history.pathname,
      query: updatedQuery,
    })
  }

  const handleChangeMultiCountry = (val) => {
    if (isExpert) {
      updateQuery('transnational', val)
      return
    }

    if (setDisable) {
      setDisable({
        ...disable,
        ...(val.length > 0 ? { country: true } : { country: false }),
      })
    }

    updateQuery('transnational', val, fetch)

    let updatedQuery = { ...history.query }
    delete updatedQuery.totalCount

    if (val && val.length > 0) {
      updatedQuery.transnational = val.toString()
    } else {
      delete updatedQuery.transnational
    }

    history.push({
      pathname: history.pathname,
      query: updatedQuery,
    })

    val.forEach((id) => {
      const check = multiCountryCountries.find((x) => x.id === id)
      !check &&
        api.get(`/country-group/${id}`).then((resp) => {
          setMultiCountryCountries([
            ...multiCountryCountries,
            { id: id, countries: resp.data?.[0]?.countries },
          ])
        })
    })
  }

  const countryInfoData = multicountryGroups
    .map((transnationalGroup) => transnationalGroup.item)
    .flat()

  return (
    <Tabs
      type="card"
      className="country-filter-tab"
      onChange={handleChangeLocationTab}
    >
      <TabPane
        tab={<Trans>Countries</Trans>}
        key="country"
        className="country-filter-tab-pane country"
        disabled={disable?.country}
      >
        <Select
          size="small"
          showSearch
          allowClear
          dropdownClassName="multiselection-dropdown"
          dropdownMatchSelectWidth={false}
          mode={countrySelectMode || ''}
          placeholder={t`Countries`}
          options={countryOpts}
          optionFilterProp="children"
          filterOption={(input, option) =>
            option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          value={country}
          onChange={handleChangeCountry}
          showArrow
          suffixIcon={<SearchIcon />}
          virtual={false}
        />
      </TabPane>
      <TabPane
        tab={<Trans>Multi-Country</Trans>}
        key="multi-country"
        className={`country-filter-tab-pane ${
          multiCountry ? 'multi-country-info' : 'multi-country'
        }`}
        disabled={disable?.multiCountry}
      >
        <Select
          size="small"
          dropdownClassName="multiselection-dropdown multiselection-filter"
          showSearch
          allowClear
          virtual={false}
          mode={multiCountrySelectMode || ''}
          dropdownMatchSelectWidth={false}
          placeholder={t`Multi-Country`}
          optionFilterProp="children"
          filterOption={(input, option) => {
            return (
              option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
            )
          }}
          value={multiCountry}
          onChange={handleChangeMultiCountry}
          showArrow
          suffixIcon={<SearchIcon />}
        >
          {multicountryGroups
            .sort((a, b) => a.label.localeCompare(b.label))
            .map((transnationalGroup) => (
              <OptGroup
                key={transnationalGroup.label}
                label={transnationalGroup.label}
                isSelectOptGroup={true}
                filterLabel={transnationalGroup.item
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((transnational) => transnational.name)}
              >
                {transnationalGroup.item
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((transnational) => {
                    return (
                      <Option
                        key={transnational.id}
                        value={transnational.id}
                        label={transnational.name}
                      >
                        <div className="dropdown-content">
                          {transnational.name}
                          <MultiCountryInfo
                            data={landing}
                            multiCountryCountries={
                              countryInfoData.find(
                                (x) => x.id === transnational.id
                              )?.countries
                            }
                          />
                        </div>
                      </Option>
                    )
                  })}
              </OptGroup>
            ))}
        </Select>
      </TabPane>
    </Tabs>
  )
}

const MultiCountryInfo = ({ data, multiCountryCountries }) => {
  const renderContent = () => {
    return (
      <div className="popover-content-wrapper">
        {multiCountryCountries &&
          multiCountryCountries.map(({ id, name }) => {
            const curr = data?.map?.find((i) => i?.countryId === id)

            return (
              <div
                key={`popover-${name}-${id}`}
                className="popover-content-item"
              >
                {name}
              </div>
            )
          })}
      </div>
    )
  }

  if (!multiCountryCountries || isEmpty(multiCountryCountries)) {
    return ''
  }
  return (
    <Popover
      overlayClassName="country-info-popover"
      className="popover-multi-country"
      title={''}
      content={renderContent}
      placement="right"
      arrowPointAtCenter
    >
      <InfoCircleOutlined />
    </Popover>
  )
}

export default CountryTransnationalFilter
