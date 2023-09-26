import React, { useState, useEffect } from 'react'
import { UIStore } from '../../store'
import { Divider, Typography, Input, Select } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { Field } from 'react-final-form'
const { Title, Link } = Typography
import ModalAddEntity from '../flexible-forms/entity-modal/add-entity-modal'
import { SearchIcon } from '../../components/icons'

function FormOne({ validate, error, setEntity }) {
  const [showModal, setShowModal] = useState(false)
  const [data, setData] = useState([])
  const storeData = UIStore.useState((s) => ({
    organisations: s.organisations,
    nonMemberOrganisations: s.nonMemberOrganisations,
  }))

  const { organisations, nonMemberOrganisations } = storeData

  useEffect(() => {
    setData([...organisations, ...nonMemberOrganisations])
  }, [organisations, nonMemberOrganisations])

  const setOrg = (res) => {
    setEntity(res)
    setData([...data, { id: res.id, name: res.name }])
  }

  return (
    <>
      <div className="text-wrapper">
        <Title level={2}>Enter your entity and job title</Title>
      </div>
      <div className="ant-form ant-form-vertical">
        <div className="field-wrapper">
          <Field name="jobTitle" validate={validate}>
            {({ input, meta }) => {
              return (
                <>
                  <Input
                    size="small"
                    onChange={(e) => input.onChange(e.target.value)}
                    placeholder="Enter job title"
                    className={`${
                      error && !meta.valid ? 'ant-input-status-error' : ''
                    }`}
                  />
                </>
              )
            }}
          </Field>
        </div>
        <Field name="orgName" style={{ width: '100%' }} validate={validate}>
          {({ input, meta }) => {
            return (
              <>
                <Select
                  size="small"
                  placeholder="Enter the name of your entity"
                  allowClear
                  showSearch
                  name="orgName"
                  virtual={false}
                  showArrow
                  onChange={(value) => input.onChange(value)}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  value={input.value ? input.value : undefined}
                  className={`ant-select-suffix ${
                    error && !meta.valid ? 'ant-input-status-error' : ''
                  }`}
                  suffixIcon={<SearchIcon />}
                  dropdownRender={(menu) => (
                    <div>
                      {menu}
                      <>
                        <Divider style={{ margin: '4px 0' }} />
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'nowrap',
                            padding: 8,
                          }}
                        >
                          <a onClick={() => setShowModal(!showModal)}>
                            <PlusOutlined /> Add new entity
                          </a>
                        </div>
                      </>
                    </div>
                  )}
                >
                  {data?.map((item) => (
                    <Select.Option value={item.id} key={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </>
            )
          }}
        </Field>
      </div>
      {showModal && (
        <ModalAddEntity
          visible={showModal}
          close={() => setShowModal(!showModal)}
          setEntity={setOrg}
        />
      )}
    </>
  )
}

export default FormOne
