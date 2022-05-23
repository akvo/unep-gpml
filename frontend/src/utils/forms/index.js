import Auth0Widget from "./form-auth0";
import FileWidget from "./form-file";
import SelectWidget from "./form-select";
import SelectGeoWidget from "./form-select-geo";
import SelectSearchWidget from "./form-select-search";
import CheckboxesWidget from "./form-checkboxes";
import RadioWidget from "./form-radio";
import URLWidget from "./form-url";
import AltDateWidget from "./form-alt-date";
import DateWidget from "./form-date";
import EmailWidget from "./form-email";
import TextIconWidget from "./form-text-icon";
import TextareaWidget from "./form-textarea";
import CheckboxWidget from "./form-checkbox";
import RichWidget from "./richEditor/form-editor";
import CollapseWidget from "./collapseForm/form-collapse";
import TaglistWidget from "./form-taglist";

import difference from "lodash/difference";
import intersection from "lodash/intersection";
import moment from "moment";

const widgets = {
  Auth0Widget: Auth0Widget,
  FileWidget: FileWidget,
  SelectWidget: SelectWidget,
  SelectGeoWidget: SelectGeoWidget,
  SelectSearchWidget: SelectSearchWidget,
  CheckboxesWidget: CheckboxesWidget,
  RadioWidget: RadioWidget,
  URLWidget: URLWidget,
  AltDateWidget: AltDateWidget,
  DateWidget: DateWidget,
  EmailWidget: EmailWidget,
  TextIconWidget: TextIconWidget,
  TextareaWidget: TextareaWidget,
  CheckboxWidget: CheckboxWidget,
  RichWidget: RichWidget,
  CollapseWidget: CollapseWidget,
  TaglistWidget: TaglistWidget,
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
  requiredTmp,
  index = null
) => {
  const { properties, required } = schema;
  if (!properties) {
    return;
  }
  if (required) {
    requiredTmp.push({ key: index, required: required });
  }
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
      collectDependSchema(tmp, formData, properties[key], requiredTmp, key);
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
    if (x.name === "format" && x.params?.format === "url") {
      x.message = "Please enter a valid url";
    }
    if (x.name === "format" && x.params?.format === "email") {
      x.message = "Please enter a valid email";
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
    dependValue.forEach((y) => {
      if (x.property.includes(y) && !x.property.includes(".S4.S4_G1.url")) {
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
    // for non initiative form
    if (typeof item?.group === "undefined" && item?.key) {
      item.required = item.required.map((x) => `${item.key}.${x}`);
    }
    item.required =
      typeof item?.group === "undefined"
        ? difference(item.required, dependFields)
        : item.required;
    // for non initiative form
    if (typeof item?.group === "undefined" && !item.key) {
      item.required.forEach((x) => {
        !formData?.[x] && res.push(x);
      });
    }
    // for non initiative form
    if (
      typeof item?.group === "undefined" &&
      item.key &&
      !dependFields.includes(item.key)
    ) {
      item.required.forEach((x) => {
        let prop = x.includes(".")
          ? x.split(".").find((x) => x !== item.key)
          : x;
        !formData?.[item.key]?.[prop] && res.push(x);
      });
    }

    // for initiative form
    if (item?.group === null && item.key) {
      item.required.forEach((x) => {
        formData?.[item.key] &&
          !formData?.[item.key]?.[x] &&
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
        formData?.[item.group]?.[item.key] &&
          !formData?.[item.group]?.[item.key]?.[x] &&
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

export const handleGeoCoverageValue = (
  data,
  currentValue,
  countries,
  prefix
) => {
  const geoCoverageValueNational = `${
    prefix ? prefix : ""
  }geoCoverageValueNational`;
  const geoCoverageValueTransnational = `${
    prefix ? prefix : ""
  }geoCoverageValueTransnational`;
  const geoCoverageValueRegional = `${
    prefix ? prefix : ""
  }geoCoverageValueRegional`;
  const geoCoverageValueGlobalSpesific = `${
    prefix ? prefix : ""
  }geoCoverageValueGlobalSpesific`;
  const geoCoverageValueSubNational = `${
    prefix ? prefix : ""
  }geoCoverageValueSubNational`;
  const geoCoverageType = `${prefix ? prefix : ""}geoCoverageType`;
  const geoCoverageValue = `${prefix ? prefix : ""}geoCoverageValue`;
  data?.[geoCoverageValueNational] && delete data[geoCoverageValueNational];
  data?.[geoCoverageValueTransnational] &&
    delete data[geoCoverageValueTransnational];
  data?.[geoCoverageValueRegional] && delete data[geoCoverageValueRegional];
  data?.[geoCoverageValueGlobalSpesific] &&
    delete data[geoCoverageValueGlobalSpesific];
  data?.[geoCoverageValueSubNational] &&
    delete data[geoCoverageValueSubNational];
  if (data[geoCoverageType] === "national") {
    if (!Array.isArray(currentValue[geoCoverageValueNational])) {
      data[geoCoverageValue] = [
        parseInt(currentValue[geoCoverageValueNational]),
      ];
    } else {
      data[geoCoverageValue] = currentValue[geoCoverageValueNational].map((x) =>
        parseInt(x)
      );
    }
  }
  if (data[geoCoverageType] === "transnational") {
    if (Array.isArray(currentValue[geoCoverageValueTransnational])) {
      data[geoCoverageValue] = currentValue[
        geoCoverageValueTransnational
      ].map((x) => parseInt(x));
    } else {
      data[geoCoverageValue] = [currentValue[geoCoverageValueTransnational]];
    }
  }
  // if (data[geoCoverageType] === "regional") {
  //   console.log(currentValue);
  //   // data[geoCoverageValue] = currentValue[geoCoverageValueRegional].map((x) =>
  //   //   parseInt(x)
  //   // );
  // }
  if (data[geoCoverageType] === "global with elements in specific areas") {
    data[geoCoverageValue] = currentValue[
      geoCoverageValueGlobalSpesific
    ].map((x) => parseInt(x));
  }
  if (
    data[geoCoverageType] === "sub-national" &&
    !Array.isArray(currentValue[geoCoverageValueSubNational])
  ) {
    data[geoCoverageValue] = [currentValue[geoCoverageValueSubNational]];
  }
  return data;
};

export const checkDependencyAnswer = (
  answer,
  dependentSchema,
  formData = {}
) => {
  answer = typeof answer === "string" ? answer.toLowerCase() : answer;
  let dependValue = dependentSchema?.value;

  const orDependSchema = dependentSchema?.orDepend;
  const andDependSchema = dependentSchema?.andDepend;

  if (Array.isArray(answer)) {
    dependValue = intersection(dependValue, answer).length !== 0;
  }
  if (!Array.isArray(answer)) {
    dependValue = Array.isArray(dependValue)
      ? dependValue.includes(answer)
      : dependValue === answer;
  }

  if (orDependSchema) {
    const orAnswer = formData[orDependSchema?.id];
    if (orDependSchema?.value === "not-filled-in") {
      dependValue = dependValue || !orAnswer;
    }
    if (orDependSchema?.value === "filled-in") {
      dependValue = dependValue || orAnswer;
    }
  }
  if (andDependSchema) {
    const andAnswer = formData[andDependSchema?.id];
    if (andDependSchema?.value === "not-filled-in") {
      dependValue = dependValue && !andAnswer;
    }
    if (andDependSchema?.value === "filled-in") {
      dependValue = dependValue && andAnswer;
    }
  }

  return dependValue;
};

export const revertFormData = (formDataMapping, editData, store = {}) => {
  const formData = {};
  formDataMapping.forEach((item) => {
    const { key, name, group, type } = item;
    let pKey = name;
    let data = null;

    if (!group) {
      data = editData?.[key] ? editData[key] : "";
    }
    if (group) {
      data = editData?.[key] ? editData[key] : "";
    }

    if (pKey === "org") {
      data = data && data.map((x) => x.id);
    }
    if (pKey === "geoCoverageValue") {
      const geoCoverageType = editData["geoCoverageType"];
      if (geoCoverageType === "national") {
        pKey = "geoCoverageValueNational";
        data = data[0];
      }
      if (geoCoverageType === "regional") {
        pKey = "geoCoverageValueRegional";
      }
      if (geoCoverageType === "transnational") {
        pKey = "geoCoverageValueTransnational";
        data = editData.geoCoverageCountryGroups;
      }
      if (geoCoverageType === "global with elements in specific areas") {
        pKey = "geoCoverageValueGlobalSpesific";
      }
      if (geoCoverageType === "sub-national") {
        pKey = "geoCoverageValueSubNational";
        data = data[0];
      }
    }
    if (pKey === "tags") {
      data = data ? data.map((x) => Object.keys(x)[0]) : "";
    }
    if (pKey === "urls") {
      data = data ? data.map((x) => ({ url: x.url, lang: x.isoCode })) : "";
    }
    if (pKey === "implementingMea") {
      const mea = store.meaOptions.find(
        (x) => x.name.toLowerCase() === data.toLowerCase()
      );
      data = mea ? mea.id : null;
    }
    if (pKey === "expertise") {
      if (!Array.isArray(data)) {
        data = data ? JSON.parse(data) : [];
      } else {
        data = data ? data : [];
      }
    }

    if (type === "string") {
      data = String(data);
    }
    if (type === "integer") {
      data = parseInt(data);
    }
    if (type === "year") {
      data = String(data);
    }
    if (type === "date") {
      if (pKey === "validTo") {
        data =
          !data || data === "Ongoing" ? "" : moment(data).format("YYYY-MM-DD");
      } else {
        data = data ? moment(data).format("YYYY-MM-DD") : "";
      }
    }

    if (data && !group) {
      formData[pKey] = data;
    }
    if (data && group) {
      formData[group] = { ...formData[group], [pKey]: data };
    }
  });
  return formData;
};

export const transformPostData = (formDataMapping, formData, countries) => {
  const postData = {};
  formDataMapping.forEach((item) => {
    const { name, group, type } = item;
    let key = name;
    let data = null;
    if (!group) {
      data = formData?.[key];
    }
    if (group) {
      data = formData?.[group]?.[key];
    }
    if (type === "string" || type === "image") {
      data = data ? String(data) : "";
    }
    if (type === "integer") {
      data = data ? parseInt(data) : null;
    }
    if (type === "date") {
      if (key === "validTo") {
        data = data ? data : "Ongoing";
      }
      data = String(data);
    }
    if (key === "org") {
      data = { id: formData[key] };
      if (formData[key] === -1) {
        data = {
          ...formData.newOrg,
          id: formData.org,
        };
        const temp = handleGeoCoverageValue(data, formData.newOrg, countries);
        data["geoCoverageValue"] = temp["geoCoverageValue"];
      }
    }
    if (key === "publishYear") {
      data = parseInt(data);
    }
    if (key === "geoCoverageValue") {
      const temp = handleGeoCoverageValue(postData, formData, countries);
      data = temp[key];
    }
    if (key === "tags" && type === "array") {
      data = data.map((x) => Number(x));
    }
    postData[key] = data;
  });
  return postData;
};

export default widgets;
