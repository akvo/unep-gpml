import Auth0Widget from "./form-auth0";
import FileWidget from "./form-file";
import SelectWidget from "./form-select";
import difference from "lodash/difference";

const widgets = {
  Auth0Widget: Auth0Widget,
  FileWidget: FileWidget,
  SelectWidget: SelectWidget,
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

export const collectDependSchema = (tmp, formData, schema, index = null) => {
  if (!schema?.properties) {
    return;
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
      collectDependSchema(tmp, formData, properties[key], key);
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

export default widgets;
