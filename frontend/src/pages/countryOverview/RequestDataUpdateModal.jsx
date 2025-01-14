import React, { useState } from 'react'
import { Modal, Form, Input, Button, Select, Checkbox, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { isEmpty } from 'lodash'
import { UIStore } from '../../store'

const { Option } = Select

const RequestDataUpdateModal = ({ visible, onClose }) => {
  const [form] = Form.useForm()

  const { countries } = UIStore.useState((s) => ({ countries: s.countries }))

  const isLoaded = () => !isEmpty(countries)
  console.log('Trigger build')

  const countryOpts = isLoaded()
    ? countries
        .filter((country) => country.description === 'Member State')
        .map((it) => ({ value: it.id, label: it.name }))
        .sort((a, b) => a.label.localeCompare(b.label))
    : []

  const handleSubmit = (values) => {
    console.log('Form values: ', values)
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title="Request Data Update"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item label="Select category" name="category" required>
          <Checkbox.Group>
            <Checkbox value="Waste Management">Waste Management</Checkbox>
            <Checkbox value="Plastic Trade">Trade</Checkbox>
            <Checkbox value="Plastic Governance">Governance</Checkbox>
            <Checkbox value="Plastic in the Environment">
              Legacy Plastics
            </Checkbox>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item
          label="Country"
          name="country"
          rules={[{ required: true, message: 'Please select a country!' }]}
        >
          <Select
            showSearch
            placeholder="Country for which data update is requested"
            options={countryOpts}
            filterOption={(input, option) =>
              option?.label?.toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item label="Source of the updated dataset" name="source">
          <Input.TextArea
            placeholder="Please indicate organization and website with links where possible"
            rows={4}
          />
        </Form.Item>

        <Form.Item
          label="Indicator for which update is requested"
          name="indicator"
        >
          <Input.TextArea
            placeholder="Please indicate indicator name or indicator topic for which data update is requested"
            rows={3}
          />
        </Form.Item>

        <Form.Item label="Personal details">
          <Form.Item
            name="firstName"
            rules={[{ required: true, message: 'Please enter your name!' }]}
            style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}
          >
            <Input placeholder="First name" />
          </Form.Item>
          <Form.Item
            name="lastName"
            rules={[{ required: true, message: 'Please enter your surname!' }]}
            style={{
              display: 'inline-block',
              width: 'calc(50% - 8px)',
              marginLeft: '16px',
            }}
          >
            <Input placeholder="Surname" />
          </Form.Item>
        </Form.Item>

        <Form.Item label="Organisational affiliation" name="organization">
          <Input placeholder="Please insert the name of organisation you are affiliated with." />
        </Form.Item>

        <Form.Item label="Title/Position" name="position">
          <Input placeholder="Please enter your job title/position" />
        </Form.Item>

        <Form.Item
          label="E-mail address"
          name="email"
          rules={[
            {
              required: true,
              type: 'email',
              message: 'Please enter a valid email!',
            },
          ]}
        >
          <Input placeholder="Please enter e-mail address" />
        </Form.Item>

        <Form.Item label="Phone number" name="phone">
          <Input placeholder="Phone number" />
        </Form.Item>

        <Form.Item
          label="Additional remarks to the update request"
          name="comments"
        >
          <Input.TextArea
            placeholder="Please include any other information relevant to the data update request here"
            rows={4}
          />
        </Form.Item>

       <Form.Item label="Attach updated indicator dataset" name="dataset">
          <Upload>
            <Button icon={<UploadOutlined />}>Upload Dataset</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              backgroundColor: '#00C49A',
              borderRadius: '30px',
              height: '40px',
              fontSize: '14px',
              fontWeight: 'bold',
              border: 'none',
            }}
          >
            Request Data Update
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default RequestDataUpdateModal
