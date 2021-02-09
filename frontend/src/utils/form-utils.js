import FinalField from "./final-field"
import FinalFieldArray from "./final-field-array"

export const FieldsFromSchema = ({schema, mutators, ...props}) => {
  return Object.keys(schema).map((name,i) => {
    const Comp = schema[name].type === 'array' ? FinalFieldArray : FinalField
    return <Comp key={`comp-${i}`} {...{ name, ...schema[name], mutators, ...props }} />
  })
}

export const validateSchema = (schema) => (values) => {
  const errors = {}
  Object.keys(schema).forEach(itemName => {
    const value = values[itemName]
    if (!value && schema[itemName]?.required) {
      errors[itemName] = 'Required'
    }
  })
  return errors
}
