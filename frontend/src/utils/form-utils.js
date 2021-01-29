import FinalField from "./final-field"
import FinalFieldArray from "./final-field-array"

export const FieldsFromSchema = ({ schema, mutators }) => {
  return Object.keys(schema).map((name,i) => {
    const Comp = schema[name].type === 'array' ? FinalFieldArray : FinalField
    return <Comp key={`comp-${i}`} {...{ name, ...schema[name], mutators }} />
  })
}

export const validateSchema = (schema) => (values) => {
  const errors = {}
  Object.keys(schema).filter(it => schema[it].required).forEach(itemName => {
    if (!values[itemName]) {
      errors[itemName] = 'Required'
    }
  })
  return errors
}
