import Auth0Widget from "./form-auth0";
import FileWidget from "./form-file";
import SelectWidget from "./form-select";
import CheckboxesWidget from "./form-checkboxes";
import RadioWidget from "./form-radio";
import URLWidget from "./form-url";
import AltDateWidget from "./form-alt-date";
import DateWidget from "./form-date";
import EmailWidget from "./form-email";

import difference from "lodash/difference";
import intersection from "lodash/intersection";

const widgets = {
  Auth0Widget: Auth0Widget,
  FileWidget: FileWidget,
  SelectWidget: SelectWidget,
  CheckboxesWidget: CheckboxesWidget,
  RadioWidget: RadioWidget,
  URLWidget: URLWidget,
  AltDateWidget: AltDateWidget,
  DateWidget: DateWidget,
  EmailWidget: EmailWidget,
};

/**
 * attribution:
 *  - url via: https://stackoverflow.com/a/30970319
 *  - email via: https://stackoverflow.com/a/46181
 */
export const customFormats = {
  url: /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
  email: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
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
    if (x.name === "required") {
      x.message = "Required";
    }
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
    item.required =
      typeof item?.group === "undefined"
        ? difference(item.required, dependFields)
        : item.required;
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
  if (data.geoCoverageType === "regional") {
    data.geoCoverageValue = currentValue.geoCoverageValueRegional;
  }
  if (data.geoCoverageType === "global with elements in specific areas") {
    data.geoCoverageValue = currentValue.geoCoverageValueGlobalSpesific;
  }
  if (data.geoCoverageType === "sub-national") {
    data.geoCoverageValue = currentValue.geoCoverageValueSubNational;
  }

  return data;
};

export const checkDependencyAnswer = (answer, dependentSchema) => {
  answer = typeof answer === "string" ? answer.toLowerCase() : answer;
  let dependValue = dependentSchema.value;
  if (Array.isArray(answer)) {
    dependValue = intersection(dependValue, answer).length !== 0;
  }
  if (!Array.isArray(answer)) {
    dependValue = Array.isArray(dependValue)
      ? dependValue.includes(answer)
      : dependValue === answer;
  }
  return dependValue;
};

export default widgets;
