import FinalField from "./final-field";
import FinalFieldArray from "./final-field-array";

export const FieldsFromSchema = ({ schema, mutators, ...props }) => {
  return Object.keys(schema)
    .sort((a, b) => schema[a].order - schema[b].order)
    .map((name, i) => {
      const Comp = schema[name].type === "array" ? FinalFieldArray : FinalField;
      if (schema[name].mode === "multiple") {
        return (
          <Comp
            filterOption={(input, option) =>
              option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
            key={`comp-${i}`}
            {...{ name, ...schema[name], mutators, ...props }}
          />
        );
      }
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
    if (!value && schema[itemName]?.required) {
      errors[itemName] = "Required";
    }
  });
  return errors;
};
