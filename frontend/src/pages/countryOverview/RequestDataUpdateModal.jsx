import React, { useState } from 'react'
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  Checkbox,
  Upload,
  Tooltip,
} from 'antd'
import { UploadOutlined, InfoCircleOutlined } from '@ant-design/icons'

const { Option } = Select

const RequestDataUpdateModal = ({ visible, onClose }) => {
  const [form] = Form.useForm()

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
        <Form.Item label="Select category" name="indicator" required>
          <Checkbox.Group>
            <Checkbox value="Waste Management">Waste Management</Checkbox>
            <Checkbox value="Plastic Trade">Plastic Trade</Checkbox>
            <Checkbox value="Plastic Governance">Plastic Governance</Checkbox>
            <Checkbox value="Plastic in the Environment">
              Plastic in the Environment
            </Checkbox>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item label="Source of updated dataset" name="source">
          <Input placeholder="Source of updated dataset..." />
        </Form.Item>

        <Form.Item
          label="Location and Information"
          name="country"
          rules={[{ required: true, message: 'Please select a country!' }]}
        >
          <Select placeholder="Select country for data update...">
            <Option value="Senegal">Senegal</Option>
            <Option value="Albania">Albania</Option>
            {/* Add more countries as needed */}
          </Select>
        </Form.Item>

        <Form.Item label="Enter organization" name="organization">
          <Input placeholder="Enter organization..." />
        </Form.Item>

        <Form.Item label="Enter a position" name="position">
          <Input placeholder="Enter a position..." />
        </Form.Item>

        <Form.Item label="Contact Information">
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
          <Input placeholder="Enter e-mail address..." />
        </Form.Item>

        <Form.Item label="Phone number" name="phone">
          <Input placeholder="Phone number" />
        </Form.Item>

        <Form.Item label="Additional information" name="comments">
          <Input.TextArea placeholder="Comments for request..." rows={4} />
        </Form.Item>

        <Form.Item label="Additional links" name="additionalLinks">
          <Input placeholder="Additional link..." />
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
