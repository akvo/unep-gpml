import React, { useEffect, useState } from 'react'
import api from '../../utils/api'
import catTags from '../../utils/cat-tags.json'
// import { Icon } from "../../components/svg-icon/svg-icon";
import { useQuery } from '../../utils/misc'
import CountryTransnationalFilter from '../../components/select/country-transnational-filter'
import LocationDropdown from '../../components/location-dropdown/location-dropdown'
import { Trans, t } from '@lingui/macro'

function slug(text) {
  return text.toLowerCase().replaceAll('&', 'n').replaceAll(' ', '-')
}

const FilterBar = ({
  filter,
  setFilter,
  filterCountries,
  setFilterCountries,
}) => {
  const query = useQuery()
  const [country, setCountry] = useState([])
  const [multiCountry, setMultiCountry] = useState([])
  const [multiCountryCountries, setMultiCountryCountries] = useState([])
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const [disable, setDisable] = useState({
    country: false,
    multiCountry: false,
  })

  const handleClick0 = (catIndex) => () => {
    setFilter([catIndex])
  }
  const handleBack = () => {
    setFilter([])
  }

  const handleClick1 = (tag) => () => {
    let tagfilters = [...(filter[1] || [])]
    if (tagfilters.findIndex((it) => it === tag) > -1) {
      tagfilters = tagfilters.filter((it) => it !== tag)
    } else {
      tagfilters = [...tagfilters, tag]
    }
    setFilter([filter[0], tagfilters])
  }

  const updateQuery = (param, value) => {
    if (param === 'country') {
      setDisable({
        ...disable,
        ...(value.length > 0
          ? { multiCountry: true }
          : { multiCountry: false }),
      })
      setCountry(value)
      setFilterCountries(value.map((item) => item.toString()))
    }
    if (param === 'transnational') {
      setDisable({
        ...disable,
        ...(value.length > 0 ? { country: true } : { country: false }),
      })
      if (value.length === 0) {
        setFilterCountries([])
      }
      setMultiCountry(value)

      value.forEach((id) => {
        const check = filterCountries.find((x) => x === id.toString())
        !check &&
          api.get(`/country-group/${id}`).then((resp) => {
            setFilterCountries([
              ...filterCountries,
              ...resp.data?.[0]?.countries.map((item) => item.id.toString()),
            ])
          })
      })
    }
  }

  useEffect(() => {
    if (
      filterCountries &&
      filterCountries.length > 0 &&
      multiCountry.length === 0
    ) {
      setCountry(filterCountries.map((item) => parseInt(item)))
    } else {
      setCountry([])
    }
  }, [filterCountries, multiCountry])

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
  )

  const title = (title) =>
    title?.toLowerCase() === 'capacity building'
      ? 'Capacity Development'
      : title

  return (
    <div className="filter-bar">
      {filter.length === 0 && (
        <div className="level-0">
          <div>
            <small>
              <Trans>Choose an expert category</Trans>
            </small>
          </div>
          <div className="filter-tools">
            <ul>
              {catTags.map((cat, index) => {
                return (
                  <li onClick={handleClick0(index)}>
                    <DynamicSVG
                      type={`/${slug(cat.title)}`}
                      fillColor={`'#fff'}`}
                    />
                    <span>{title(cat.title)}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
      {filter.length > 0 && (
        <div className="level-1">
          <div className={`selected-btn s${filter[0]}`} onClick={handleBack}>
            <small>
              &lt; <Trans>Back to categories</Trans>
            </small>
            <DynamicSVG
              type={`/${slug(catTags[filter[0]].title)}`}
              fillColor={`'#fff'}`}
            />
            <div>
              <strong>{title(catTags[filter[0]].title)}</strong>
              <small>
                <Trans>Sub-topics</Trans>
              </small>
            </div>
          </div>
          <ul>
            {catTags[filter[0]].topics.map((tag) => (
              <li
                onClick={handleClick1(tag)}
                className={
                  filter[1] && filter[1].indexOf(tag) > -1 && 'selected'
                }
              >
                <div className="img-container">
                  <DynamicSVG type={`/${slug(tag)}`} fillColor={`'#67BEA1'}`} />
                </div>
                <div className="label-container">
                  <span>{tag}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
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
  )
}

const DynamicSVG = ({ type, fillColor }) => {
  const [svgContent, setSvgContent] = useState(null)

  useEffect(() => {
    fetch(`/cat-tags/${type}.svg`)
      .then((response) => response.text())
      .then((content) => setSvgContent(content))
  }, [type])

  if (!svgContent) return null

  const updatedContent = svgContent.replace(
    'fill="#06496c"',
    `fill="${fillColor}"`
  )

  return <div dangerouslySetInnerHTML={{ __html: updatedContent }} />
}

export default FilterBar
