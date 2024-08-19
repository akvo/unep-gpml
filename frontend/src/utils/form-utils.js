import FinalField from "./final-field";
import FinalFieldArray from "./final-field-array";
import { customFormats } from "./forms";

export const FieldsFromSchema = ({ schema, mutators, ...props }) => {
  return Object.keys(schema)
    .sort((a, b) => schema[a].order - schema[b].order)
    .map((name, i) => {
      const Comp = schema[name].type === "array" ? FinalFieldArray : FinalField;
      return (
        <Comp
          key={`comp-${i}`}
          {...{ name, ...schema[name], mutators, ...props }}
        />
      );
    });
};

export const validateSchema = (schema) => (values) => {
  const errors = {};
  Object.keys(schema).forEach((itemName) => {
    const value = values[itemName];
    // validate url on array item field
    if (value && Array.isArray(value) && value.length > 0) {
      const urlErrors = [];
      value.forEach((x, i) => {
        if (x?.url && typeof x?.url !== "undefined") {
          if (!x.url.match(customFormats.url)) {
            urlErrors[i] = { url: "Please enter a valid url" };
          } else {
            delete urlErrors[i];
          }
        }
      });
      if (urlErrors.length > 0) {
        errors[itemName] = urlErrors;
      }
    }
    // eol validate url on array item field

    if (!value && schema[itemName]?.required) {
      errors[itemName] = "Required";
    }
  });
  return errors;
};

export const transformObjectToArray = (inputObject) => {
  const outputArray = [];

  for (const key in inputObject) {
    if (inputObject.hasOwnProperty(key)) {
      const element = inputObject[key];
      outputArray.push({
        label: element.label,
        symbol: element.symbol,
        value: element.value
      });
    }
  }

  return outputArray;
};