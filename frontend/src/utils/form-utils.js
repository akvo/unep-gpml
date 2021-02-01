import FinalField from "./final-field"
import FinalFieldArray from "./final-field-array"

const checkFileSize = (base64, maxFileSize) => {
    const base64str = base64.split(',')[1];
    const decoded = atob(base64str);
    return decoded.length >= (maxFileSize * 1000000);
}

export const FieldsFromSchema = ({ schema, mutators }) => {
  return Object.keys(schema).map((name,i) => {
    const Comp = schema[name].type === 'array' ? FinalFieldArray : FinalField
    return <Comp key={`comp-${i}`} {...{ name, ...schema[name], mutators }} />
  })
}

export const validateSchema = (schema) => (values) => {
  const errors = {}
  Object.keys(schema).forEach(itemName => {
    const value = values[itemName]
    if (value && schema[itemName]?.maxFileSize) {
      const invalidSize = checkFileSize(value, schema[itemName].maxFileSize);
      if (invalidSize) {
        errors[itemName] = 'Allowed file size: ' + schema[itemName].maxFileSize + 'mb';
      }
    }
    if (!value && schema[itemName]?.required) {
      errors[itemName] = 'Required'
    }
  })
  return errors
}
