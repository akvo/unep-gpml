export const findCountryIsoCode = (value, countries) => {
  const country = countries.find((x) => x.id === value);
  return country?.isoCode;
};

export const handleGeoCoverageValue = (data, currentValue, countries) => {
  delete data.geoCoverageValueNational;
  delete data.geoCoverageValueTransnational;
  delete data.geoCoverageValueRegional;
  delete data.geoCoverageValueGlobalSpesific;
  delete data.geoCoverageValueSubNational;
  if (data.geoCoverageType === "national") {
    data.geoCoverageValue = [
      findCountryIsoCode(currentValue.geoCoverageValueNational, countries),
    ];
  }
  if (data.geoCoverageType === "transnational") {
    data.geoCoverageValue = currentValue.geoCoverageValueTransnational.map(
      (x) => findCountryIsoCode(parseInt(x), countries)
    );
  }
  if (data.geoCoverageType === "regional")
    data.geoCoverageValue = currentValue.geoCoverageValueRegional;
  if (data.geoCoverageType === "global with elements in specific areas")
    data.geoCoverageValue = currentValue.geoCoverageValueGlobalSpesific;
  if (data.geoCoverageType === "sub-national")
    data.geoCoverageValue = currentValue.geoCoverageValueSubNational;

  return data;
};
