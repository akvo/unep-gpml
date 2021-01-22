import { MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import arrayMutators from 'final-form-arrays'
import { add } from 'lodash'
import { FieldArray } from 'react-final-form-arrays'
import FinalField from './final-field'

const FinalFieldArray = ({ name, addLabel = 'Add another', removeLabel = 'Remove', mutators, ...schema }) => {
  return (
    <div>
      <FieldArray name={name}>
        {({ fields }) =>
        <div>
          {fields.map((arrFieldName, index) => {
            return (
              <div className="array-item">
                {Object.keys(schema.items).map(fieldName =>
                  <FinalField name={`${arrFieldName}${fieldName}`} {...schema.items[fieldName]} />
                )}
              </div>
            )
          })}
          <div className="array-btns">
            <Button onClick={() => mutators?.push(name, {})}><PlusOutlined /> {addLabel}</Button>
            <Button onClick={() => mutators?.pop(name)} disabled={fields.length < 2} type="link"><MinusOutlined /> {removeLabel}</Button>
          </div>
        </div>
        }
      </FieldArray>
    </div>
  )
}

export default FinalFieldArray