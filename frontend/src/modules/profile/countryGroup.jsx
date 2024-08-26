import React, { useState } from 'react'
import {
  Button,
  Input,
  Select,
  Card,
  List,
  Form,
  Typography,
  notification,
} from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { UIStore } from '../../store'
import api from '../../utils/api'

const { Title, Text } = Typography
const { Option } = Select

const CountryGroups = ({}) => {
  const { countryGroup, countries } = UIStore.useState((s) => ({
    countryGroup: s?.countryGroup,
    countries: s?.countries,
  }))
  const [groups, setGroups] = useState(countryGroup)
  const [form] = Form.useForm()

  const handleDeleteGroup = (id) => {
    api
      .delete(`/country-group/${id}`)
      .then(() => {
        notification.success({ message: 'Country group deleted!' })
      })
      .catch((err) => {
        notification.error({
          message: err?.response?.data?.errorDetails?.error
            ? err?.response?.data?.errorDetails?.error
            : 'Something went wrong',
        })
      })
    setGroups(groups.filter((group) => group.id !== id))
  }

  const handleAddGroup = (values) => {
    const newGroup = {
      ...values,
      id: Date.now(),
      countries: values.countries.map((id) => ({ id: parseInt(id) })),
    }

    const data = {
      name: values.name,
      type: values.type,
      countries: values.countries.map((id) => ({ id: parseInt(id) })),
    }

    api
      .post(`/country-group`, data)
      .then(() => {
        notification.success({ message: 'Country group added!' })
      })
      .catch((err) => {
        notification.error({
          message: err?.response?.data?.errorDetails?.error
            ? err?.response?.data?.errorDetails?.error
            : 'Something went wrong',
        })
      })
    setGroups([...groups, newGroup])
    form.resetFields()
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Add New Group</Title>
      <Form form={form} onFinish={handleAddGroup} layout="vertical">
        <Form.Item
          name="name"
          label="Group Name"
          rules={[{ required: true, message: 'Please input the group name!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="type"
          label="Group Type"
          rules={[{ required: true, message: 'Please input the group type!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="countries"
          label="Countries"
          rules={[
            { required: true, message: 'Please select at least one country!' },
          ]}
        >
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select countries"
          >
            {countries?.map((country) => (
              <Option key={country.id} value={country.id}>
                {country.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Add Group
          </Button>
        </Form.Item>
      </Form>
      {/* Existing Groups */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3}>Existing Groups</Title>
        <List
          dataSource={groups}
          renderItem={(group) => (
            <List.Item>
              <Card
                title={group.name}
                extra={
                  <Button
                    size="small"
                    danger
                    onClick={() => handleDeleteGroup(group.id)}
                  >
                    Delete
                  </Button>
                }
                style={{ width: '100%' }}
              >
                <Text>Type: {group.type}</Text>
                <br />
                <Text>Countries: {group.countries.length}</Text>
              </Card>
            </List.Item>
          )}
        />
      </div>
    </div>
  )
}

export default CountryGroups
