import React, { useEffect, useState, memo, useCallback } from 'react'
import {
  Button,
  Input,
  Select,
  Card,
  Typography,
  notification,
  Spin,
} from 'antd'
import { UIStore } from '../../store'
import { PlusOutlined } from '@ant-design/icons'
import api from '../../utils/api'

const { Title } = Typography
const { Option } = Select
import { CheckedIcon, DeleteIcon } from '../../components/icons'

// Memoized individual group component
const CountryGroupCard = memo(
  ({
    group,
    onSave,
    onDelete,
    onChange,
    isEdited,
    loading,
    countryOptions,
    countryMap,
  }) => {
    const handleGroupChange = useCallback(
      (field, value) => {
        if (field === 'countries') {
          const selectedCountries = value.map((id) => countryMap[id])
          onChange(group.id, field, selectedCountries)
        } else {
          onChange(group.id, field, value)
        }
      },
      [group.id, onChange, countryMap]
    )

    return (
      <Card>
        <div className="group-header">
          <Input
            size="small"
            value={group.name}
            placeholder="Enter group name..."
            bordered={false}
            onChange={(e) => handleGroupChange('name', e.target.value)}
          />
          <Select
            size="small"
            allowClear
            showArrow
            className="w-72"
            value={group.type}
            onChange={(value) => handleGroupChange('type', value)}
            style={{ width: 200 }}
          >
            <Option value="transnational">Transnational</Option>
            <Option value="regional">Regional</Option>
            <Option value="mea">MEA</Option>
            <Option value="featured">Featured</Option>
          </Select>

          <Button
            onClick={() => onSave(group)}
            disabled={!isEdited || loading}
            className="delete-button"
            icon={<CheckedIcon />}
          />
          <Button
            className="delete-button"
            onClick={() => onDelete(group.id)}
            disabled={loading}
            icon={<DeleteIcon />}
          />
        </div>
        <Select
          className="w-full"
          mode="multiple"
          placeholder="Add countries..."
          value={group.countries ? group.countries.map((c) => c.id) : []}
          bordered={false}
          virtual={false}
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
          onChange={(value) => handleGroupChange('countries', value)}
        >
          {countryOptions}
        </Select>
      </Card>
    )
  }
)

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

  const countryMap = React.useMemo(
    () =>
      countries.reduce((acc, country) => {
        acc[country.id] = country
        return acc
      }, {}),
    [countries]
  )

  const countryOptions = React.useMemo(
    () =>
      countries?.map((country) => (
        <Option key={`${country.id}`} value={country.id}>
          {country.name}
        </Option>
      )),
    [countries]
  )

  const handleAddGroup = useCallback(() => {
    const newGroup = {
      id: `temp-${Date.now()}`,
      name: '',
      type: 'Transnational',
      countries: [],
    }
    setGroups((prev) => [...prev, newGroup])
    setEditedGroups((prev) => [...prev, newGroup.id])
  }, [])

  const handleSaveGroup = useCallback(async (group) => {
    if (!group.name || group.countries.length === 0) {
      notification.error({ message: 'Group name and countries are required!' })
      return
    }

    setLoading(true)
    const data = {
      name: group.name,
      type: group.type.toLowerCase(),
      countries: group.countries.map((country) => ({ id: country.id })),
    }

    try {
      const isNew = group.id.toString().startsWith('temp-')
      const response = await (isNew
        ? api.post('/country-group', data)
        : api.patch(`/country-group/${group.id}`, data))

      notification.success({
        message: isNew ? 'Country group added!' : 'Country group updated!',
      })

      if (isNew) {
        setGroups((prev) =>
          prev.map((g) =>
            g.id === group.id ? { ...g, id: response.data.id } : g
          )
        )
      }

      setEditedGroups((prev) => prev.filter((id) => id !== group.id))
    } catch (err) {
      console.log('Error:', err)
      notification.error({
        message:
          err?.response?.data?.errorDetails?.error || 'Something went wrong',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDeleteGroup = useCallback(async (id) => {
    try {
      await api.delete(`/country-group/${id}`)
      notification.success({ message: 'Country group deleted!' })
      setGroups((prev) => prev.filter((group) => group.id !== id))
    } catch (err) {
      notification.error({
        message:
          err?.response?.data?.errorDetails?.error || 'Something went wrong',
      })
    }
  }, [])

  const handleGroupChange = useCallback((id, field, value) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === id ? { ...group, [field]: value } : group
      )
    )
    setEditedGroups((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  return (
    <div className="geography">
      <Title level={2}>Country Groups</Title>
      <Spin spinning={countryGroup.length === 0}>
        {groups.map((group) => (
          <CountryGroupCard
            key={group.id}
            group={group}
            onSave={handleSaveGroup}
            onDelete={handleDeleteGroup}
            onChange={handleGroupChange}
            isEdited={editedGroups.includes(group.id)}
            loading={loading}
            countryOptions={countryOptions}
            countryMap={countryMap}
          />
        ))}
      </Spin>
      <Button type="link" className="add-btn" onClick={handleAddGroup}>
        <PlusOutlined /> Add Another
      </Button>
    </div>
  )
}

export default CountryGroups
