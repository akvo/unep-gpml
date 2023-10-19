import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Dropdown,
  Menu,
  Modal,
  Table,
  Tooltip,
  Typography,
  message,
} from 'antd'
import uniqBy from 'lodash/uniqBy'
import { DropDownIcon } from '../../../components/icons'
import api from '../../../utils/api'
import { UIStore } from '../../../store'
import { ROLES, TEAMS } from './config'
import styles from './setup-team-table.module.scss'
import { InfoCircleOutlined } from '@ant-design/icons'

const { Column } = Table
const { Text } = Typography

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
        sorter: (a, b) => a.teams?.[0]?.localeCompare(b.teams?.[0]),
      },
      {
        title: 'Role',
        dataIndex: 'role',
        sorter: (a, b) => a.role.localeCompare(b.role),
      },
    ]
  }, [members])

  const handleOnUpdateMember = (field, id, value) => {
    const _members = members.map((m) => {
      if (m?.id === id) {
        return {
          ...m,
          [field]: value,
        }
      }
      return m
    })
    setMembers(_members)
  }

  const handleOnTeamsChange = async (teams, recordID) => {
    try {
      handleOnUpdateMember('teams', recordID, teams)
      const payload = {
        user_id: recordID,
        teams,
      }
      await api.put(
        `/plastic-strategy/${psItem?.country?.isoCodeA2}/team/member`,
        payload
      )
    } catch (error) {
      console.error('Unable to update `Assigned to`', error)
      message.error('Unable to update assignment')
    }
  }

  const handleOnRoleChange = async (role, recordID) => {
    try {
      handleOnUpdateMember('role', recordID, role)
      const payload = {
        user_id: recordID,
        role,
      }
      await api.put(
        `/plastic-strategy/${psItem?.country?.isoCodeA2}/team/member`,
        payload
      )
    } catch (error) {
      console.error('Unable to update `role`', error)
      message.error('Unable to update role')
    }
  }

  const handleOnDeleteMember = (record) => {
    Modal.confirm({
      title: `${record?.firstName} ${record?.lastName}`,
      content: 'Are you sure you want to delete this member?',
      onOk: async () => {
        try {
          await api.delete(
            `/plastic-strategy/${psItem.country.isoCodeA2}/team/member`,
            {
              user_id: record?.id,
            }
          )
          const _members = members.filter((m) => m?.id !== record?.id)
          setMembers(_members)
        } catch (error) {
          message.error('Unable to delete a member')
        }
      },
      okButtonProps: {
        size: 'small',
        type: 'default',
        danger: true,
      },
      okText: 'Delete',
      cancelButtonProps: {
        type: 'link',
      },
    })
  }

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
    <Table
      dataSource={members}
      loading={loading}
      pagination={false}
    >
      {columns.map((col, cx) => {
        if (col.dataIndex === 'role') {
          return (
            <Column
              {...col}
              key={cx}
              render={(data, record) => {
                return (
                  <Dropdown
                    overlay={
                      <Menu>
                        {ROLES.map((r, rx) => (
                          <Menu.Item
                            key={rx}
                            onClick={() =>
                              handleOnRoleChange(r.key, record?.id)
                            }
                          >
                            {r.label}
                          </Menu.Item>
                        ))}
                        <Divider className={styles.roleDivider} />
                        <Menu.Item onClick={() => handleOnDeleteMember(record)}>
                          <Text type="danger">Delete</Text>
                        </Menu.Item>
                      </Menu>
                    }
                    trigger={['click']}
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
              render={(data, record) => {
                const teamsValue = data?.length
                  ? data.map((d) => d?.replace(/-/g, ' ')).join(' & ')
                  : 'Not Assigned'
                return (
                  <Dropdown
                    overlay={
                      <Checkbox.Group
                        className={styles.teamsCheckbox}
                        options={TEAMS.map((t) => ({
                          ...t,
                          label: (
                            <span key={t.value}>
                              {t.label}
                              <Tooltip
                                placement="top"
                                title={t.description}
                                trigger={['hover']}
                              >
                                <InfoCircleOutlined style={{ marginLeft: 10 }} />
                              </Tooltip>
                            </span>
                          ),
                        }))}
                        value={data}
                        onChange={(checkItems) =>
                          handleOnTeamsChange(checkItems, record?.id)
                        }
                      />
                    }
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
