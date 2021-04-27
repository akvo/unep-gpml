import Auth0Widget from "./form-auth0";
import FileWidget from "./form-file";
import SelectWidget from "./form-select";
import CheckboxesWidget from "./form-checkboxes";
import RadioWidget from "./form-radio";
import difference from "lodash/difference";
import { ConsoleSqlOutlined } from "@ant-design/icons";

const widgets = {
  Auth0Widget: Auth0Widget,
  FileWidget: FileWidget,
  SelectWidget: SelectWidget,
  CheckboxesWidget: CheckboxesWidget,
  RadioWidget: RadioWidget,
};

export const CustomFieldTemplate = (props) => {
  const {
    id,
    classNames,
    label,
    help,
    required,
    errors,
    children,
    displayLabel,
  } = props;
  return (
    <div style={{ marginBottom: "10px" }} className={classNames}>
      <label htmlFor={id} style={{ fontWeight: "bold" }}>
        {displayLabel ? label : ""}
        {displayLabel && !required ? (
          <span
            style={{
              color: "#c2c2c2",
              fontStyle: "italic",
              fontWeight: "normal",
            }}
          >
            {" "}
            - Optional
          </span>
        ) : (
          ""
        )}
      </label>
      {children}
      {errors}
      {help}
    </div>
  );
};

export const collectDependSchema = (
  tmp,
  formData,
  schema,
  required,
  index = null
) => {
  if (!schema?.properties) {
    return;
  }
  if (schema?.required) {
    required.push({ key: index, required: schema.required });
  }
  const { properties } = schema;
  Object.keys(properties).forEach((key) => {
    if (
      !index &&
      properties[key]?.depend &&
      !properties[key]?.depend.value.includes(
        formData[properties[key]?.depend.id]
      )
    ) {
      // add not required value to array
      tmp.push(`.${key}`);
    }
    if (
      index &&
      properties[key]?.depend &&
      !properties[key]?.depend.value.includes(
        formData[index][properties[key]?.depend.id]
      )
    ) {
      // add not required value to array
      tmp.push(`.${index}.${key}`);
    }
    if (properties[key]?.properties) {
      collectDependSchema(tmp, formData, properties[key], required, key);
    }
  });
  return;
};

export const overideValidation = (errors, dependValue) => {
  // overide "is a required property" message
  errors = errors.map((x) => {
    if (x.name === "required") x.message = "Required";
    return x;
  });
  // overide enum "should be equal to one of the allowed values" validation
  // overide enum "uniqueItems" - "should NOT have duplicate items" validation
  // overide enum "minItems" - "should NOT have fewer than 1 items" validation
  let overide = errors.filter(
    (x) =>
      x.name !== "enum" &&
      x.name !== "uniqueItems" &&
      x.name !== "minItems" &&
      x.name !== "type" &&
      !dependValue.includes(x.property)
  );
  // check for nested dependencies validation
  let tmp = [];
  overide.forEach((x) => {
    const check = dependValue.forEach((y) => {
      if (x.property.includes(y)) {
        tmp.push(x);
      }
    });
  });
  overide = difference(overide, tmp);
  return overide;
};

export const checkRequiredFieldFilledIn = (
  formData,
  dependFields,
  requiredFields
) => {
  // check if all required field filled in
  dependFields = dependFields.map((x) => x.replace(".", ""));
  let res = [];
  requiredFields.forEach((item) => {
    item.required = difference(item.required, dependFields);
    if (typeof item?.group === "undefined" && !item.key) {
      item.required.forEach((x) => {
        !(x in formData) && res.push(x);
      });
    }
    if (
      typeof item?.group === "undefined" &&
      item.key &&
      !dependFields.includes(item.key)
    ) {
      item.required.forEach((x) => {
        !(x in formData?.[item.key]) && res.push(x);
      });
    }
    // for initiative form
    if (item?.group === null && item.key) {
      item.required.forEach((x) => {
        !(x in formData?.[item.key]) &&
          dependFields.filter((d) => d.includes(x)).length === 0 &&
          res.push(x);
      });
    }
    // for initiative form
    if (item?.group && item.key) {
      item.required.forEach((x) => {
        let search = x.includes(".")
          ? `${item.group}.${item.key}['${x}']`
          : `${item.group}.${item.key}.${x}`;
        !(x in formData?.[item.group]?.[item.key]) &&
          dependFields.filter((d) => d.includes(search)).length === 0 &&
          res.push(x);
      });
    }
  });
  return res;
};

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

export default widgets;
