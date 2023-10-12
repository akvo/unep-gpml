import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Checkbox, Dropdown, Menu, Table } from 'antd'
import uniqBy from 'lodash/uniqBy'
import { DropDownIcon } from '../../../components/icons'
import api from '../../../utils/api'
import { UIStore } from '../../../store'
import { TEAMS } from './config'

const { Column } = Table

const SetupTeamTable = ({ psItem, members, setMembers }) => {
  const [loading, setLoading] = useState(true)
  const profile = UIStore.useState((s) => s.profile)

  const columns = useMemo(() => {
    const filterOrgs = uniqBy(
      members
        .map((m) => ({ text: m?.org?.name, value: m?.org?.name }))
        .filter((org) => org.value),
      'value'
    )
    const filterNames = uniqBy(
      members.map((m) => ({
        text: `${m?.firstName} ${m?.lastName}`,
        value: `${m?.firstName} ${m?.lastName}`,
      })),
      'value'
    )
    return [
      {
        title: 'Contact',
        dataIndex: 'contact',
        filters: filterNames,
        onFilter: (value, record) => record.contact.indexOf(value) === 0,
        sorter: (a, b) => a.contact.localeCompare(b.contact),
        sortDirections: ['ascend'],
      },
      {
        title: 'Organisation',
        dataIndex: 'organisation',
        filters: filterOrgs,
        onFilter: (value, record) => value === record.organisation,
        sorter: (a, b) => a?.organisation?.localeCompare(b?.organisation),
        sortDirections: ['ascend'],
      },
      {
        title: 'Assigned to',
        dataIndex: 'teams',
        defaultSortOrder: 'ascend',
        sorter: (a, b) => a.teams?.[0]?.localeCompare(b.teams?.[0]),
      },
      {
        title: 'Role',
        dataIndex: 'role',
        sorter: (a, b) => a.role.localeCompare(b.role),
      },
    ]
  }, [members])

  const getTeamMembers = useCallback(async () => {
    try {
      if (profile?.id && psItem?.country?.isoCodeA2) {
        const { data } = await api.get(
          `/plastic-strategy/${psItem.country.isoCodeA2}/team/member`
        )
        const _members = data.map((d) => ({
          ...d,
          key: d?.id,
          contact: `${d?.firstName} ${d?.lastName}`,
          organisation: d?.org?.name,
        }))
        setLoading(false)
        setMembers(_members)
      }
    } catch (error) {
      setLoading(false)
      console.error('unable to fetch team members:', error)
    }
  }, [psItem?.country, profile])

  useEffect(() => {
    getTeamMembers()
  }, [getTeamMembers])

  return (
    <Table dataSource={members} loading={loading}>
      {columns.map((col, cx) => {
        if (col.dataIndex === 'role') {
          return (
            <Column
              {...col}
              key={cx}
              render={(data) => {
                return (
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item>Admin</Menu.Item>
                        <Menu.Item>Editor</Menu.Item>
                      </Menu>
                    }
                  >
                    <Button type="link" icon={<DropDownIcon />}>
                      {data}
                    </Button>
                  </Dropdown>
                )
              }}
            />
          )
        }
        if (col.dataIndex === 'teams') {
          return (
            <Column
              {...col}
              key={cx}
              render={(data) => {
                const teamsValue = data
                  ?.map((d) => d?.replace(/-/g, ' '))
                  .join(' & ')
                return (
                  <Dropdown
                    overlay={<Checkbox.Group options={TEAMS} />}
                    trigger={['click']}
                  >
                    <Button type="link" icon={<DropDownIcon />}>
                      {teamsValue}
                    </Button>
                  </Dropdown>
                )
              }}
            />
          )
        }
        return <Column {...col} key={cx} />
      })}
    </Table>
  )
}

export default SetupTeamTable
