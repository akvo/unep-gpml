import React, { useEffect, useState } from 'react'
import {
  Button,
  Input,
  Select,
  Card,
  Typography,
  notification,
  Spin,
} from 'antd'
import { DeleteOutlined, CheckOutlined, PlusOutlined } from '@ant-design/icons'
import { UIStore } from '../../store'
import api from '../../utils/api'
import { CheckedIcon, DeleteIcon } from '../../components/icons'

const { Title } = Typography
const { Option } = Select

const CountryGroups = () => {
  const { countryGroup, countries } = UIStore.useState((s) => ({
    countryGroup: s?.countryGroup,
    countries: s?.countries,
  }))

  const [groups, setGroups] = useState([])
  const [editedGroups, setEditedGroups] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setGroups(countryGroup)
  }, [countryGroup])

  const handleAddGroup = () => {
    const newGroup = {
      id: `temp-${Date.now()}`,
      name: '',
      type: 'Transnational',
      countries: [],
    }
    setGroups([...groups, newGroup])
    setEditedGroups([...editedGroups, newGroup.id])
  }

  const handleSaveGroup = (group) => {
    setLoading(true)
    if (!group.name || group.countries.length === 0) {
      notification.error({ message: 'Group name and countries are required!' })
      setLoading(false)
      return
    }

    const data = {
      name: group.name,
      type: group.type.toLowerCase(),
      countries: group.countries.map((country) => {
        return { id: country.id }
      }),
    }

    const request = group.id.toString().startsWith('temp-')
      ? api.post(`/country-group`, data)
      : api.patch(`/country-group/${group.id}`, data)

    request
      .then((response) => {
        notification.success({
          message: group.id.toString().startsWith('temp-')
            ? 'Country group added!'
            : 'Country group updated!',
        })

        if (group.id.toString().startsWith('temp-')) {
          setGroups((prevGroups) =>
            prevGroups.map((g) =>
              g.id === group.id ? { ...g, id: response.data.id } : g
            )
          )
        }

        setEditedGroups((prevEditedGroups) =>
          prevEditedGroups.filter((id) => id !== group.id)
        )
      })
      .catch((err) => {
        notification.error({
          message:
            err?.response?.data?.errorDetails?.error || 'Something went wrong',
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleDeleteGroup = (id) => {
    api
      .delete(`/country-group/${id}`)
      .then(() => {
        notification.success({ message: 'Country group deleted!' })
        setGroups(groups.filter((group) => group.id !== id))
      })
      .catch((err) => {
        notification.error({
          message:
            err?.response?.data?.errorDetails?.error || 'Something went wrong',
        })
      })
  }

  const countryMap = React.useMemo(
    () =>
      countries.reduce((acc, country) => {
        acc[country.id] = country
        return acc
      }, {}),
    [countries]
  )

  const handleGroupChange = (id, field, value) => {
    setGroups(
      groups.map((group) => {
        if (group.id === id) {
          if (field === 'countries') {
            const selectedCountries = value.map((id) => countryMap[id])
            return { ...group, countries: selectedCountries }
          }
          return { ...group, [field]: value }
        }
        return group
      })
    )
    if (!editedGroups.includes(id)) {
      setEditedGroups([...editedGroups, id])
    }
  }

  const countryOptions = React.useMemo(
    () =>
      countries?.map((country) => (
        <Option key={`${country.id}-${Math.random()}`} value={country.id}>
          {country.name}
        </Option>
      )),
    [countries]
  )

  return (
    <div className="geography">
      <Title level={2}>Country Groups</Title>
      <Spin spinning={countryGroup.length === 0}>
        {groups.map((group) => (
          <Card key={group.id}>
            <div className="group-header">
              <Input
                size="small"
                value={group.name}
                placeholder="Enter group name..."
                bordered={false}
                onChange={(e) =>
                  handleGroupChange(group.id, 'name', e.target.value)
                }
              />
              <Select
                size="small"
                allowClear
                showArrow
                style={{ width: 300 }}
                value={group.type}
                onChange={(value) => handleGroupChange(group.id, 'type', value)}
              >
                <Option value="transnational">Transnational</Option>
                <Option value="regional">Regional</Option>
                <Option value="mea">MEA</Option>
                <Option value="featured">Featured</Option>
              </Select>

              <Button
                icon={<CheckedIcon />}
                onClick={() => handleSaveGroup(group)}
                disabled={!editedGroups.includes(group.id) || loading}
                className="delete-button"
              />
              <Button
                className="delete-button"
                icon={<DeleteIcon />}
                onClick={() => handleDeleteGroup(group.id)}
                disabled={loading}
              />
            </div>
            <Select
              style={{ width: '100%' }}
              mode="multiple"
              placeholder="Add countries..."
              value={group.countries ? group.countries.map((c) => c.id) : []}
              bordered={false}
              virtual={false}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              onChange={(value) =>
                handleGroupChange(group.id, 'countries', value)
              }
            >
              {countryOptions}
            </Select>
          </Card>
        ))}
      </Spin>
      <Button
        type="link"
        className="add-btn"
        icon={<PlusOutlined />}
        onClick={handleAddGroup}
      >
        Add Another
      </Button>
    </div>
  )
}

export default CountryGroups
