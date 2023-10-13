import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Checkbox,
  Dropdown,
  Form,
  Input,
  List,
  Menu,
  Modal,
  Popover,
  Typography,
  message,
} from 'antd'
import Button from '../../../components/button'
import styles from './setup-team-form.module.scss'
import { DropDownIcon } from '../../../components/icons'
import api from '../../../utils/api'
import { ROLES, TEAMS } from './config'

const { Text } = Typography

const SetupTeamForm = ({ psItem, members, setMembers }) => {
  const [search, setSearch] = useState({
    value: '',
    loading: false,
  })
  const [users, setUsers] = useState([])
  const [openUsers, setOpenUsers] = useState(false)
  const [openInvitation, setOpenInvitation] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [selectedTeams, setSelectedTeams] = useState([])
  const [form] = Form.useForm()
  const teamOptions = TEAMS.map((t) => t.value)

  const roleDescription = useMemo(() => {
    const findRole = ROLES.find((r) => r.key === selectedRole?.key)
    if (findRole) {
      return findRole?.description
    }
    return null
  }, [selectedRole])

  const handleOnSearching = async (e) => {
    setSearch({
      value: e.target.value,
      loading: true,
    })
    try {
      const {
        data: { results },
      } = await api.get('/community', {
        q: e.target.value,
        networkType: 'stakeholder',
        limit: 10,
      })
      setUsers(results)
      setSearch({
        value: e.target.value,
        loading: false,
      })
    } catch (error) {
      console.error('unable to search the users', error)
      setSearch({
        value: e.target.value,
        loading: false,
      })
    }
  }

  const handleOnAddMember = async (newMember) => {
    try {
      const payload = {
        user_id: newMember?.id,
        teams: [],
        role: 'viewer',
      }
      await api.post(
        `/plastic-strategy/${psItem?.country?.isoCodeA2}/team/member`,
        payload
      )
      setMembers([
        {
          ...newMember,
          ...payload,
          contact: newMember?.name,
          organisation: newMember?.affiliation?.name,
        },
        ...members,
      ])
      setOpenUsers(false)
    } catch (error) {
      console.error('Unable to add a member', error)
    }
  }

  const handleOnCheckedTeams = (target) => {
    let items = selectedTeams
    if (target.checked && !items.includes(target.value)) {
      items = [...items, target.value]
    } else {
      items = items.filter((i) => i !== target.value)
    }
    setSelectedTeams(items)
    form.setFieldsValue({ teams: items })
  }

  const handleOnOpenInvitation = () => {
    setOpenInvitation(true)
    setOpenUsers(false)
  }

  const handleOnCloseInvitation = () => {
    setOpenInvitation(false)
    setSelectedRole(null)
    setSelectedTeams([])
  }

  const handleOnSubmit = async (values) => {
    try {
      await api.post(
        `/plastic-strategy/${psItem?.country?.isoCodeA2}/team/member/invite`,
        values
      )
      setSelectedRole(null)
      setSelectedTeams([])
      setOpenInvitation(false)
      message.success('Invitation sent!')
    } catch (error) {
      console.error('Unable to send invitation', error)
      message.error('Unable to send invitation')
    }
  }

  return (
    <>
      <Form>
        <Form.Item>
          <Popover
            placement="bottom"
            showArrow={false}
            visible={openUsers}
            overlayClassName={styles.usersPopover}
            onVisibleChange={setOpenUsers}
            trigger={['click']}
            content={
              <List
                footer={
                  <div>
                    <Button type="link" onClick={handleOnOpenInvitation}>
                      + Invite a New Member
                    </Button>
                  </div>
                }
                loading={search.loading}
                bordered={false}
                dataSource={users}
                renderItem={(item) => (
                  <List.Item
                    key={item?.id}
                    onClick={() => handleOnAddMember(item)}
                  >
                    <Text>{item?.name}</Text>
                    <strong className="w-bold">
                      {item?.affiliation?.name}
                    </strong>
                  </List.Item>
                )}
              />
            }
          >
            <Input
              placeholder="Start typing..."
              value={search.value}
              onChange={handleOnSearching}
            />
          </Popover>
        </Form.Item>
      </Form>
      <Modal
        title="Invite a new member"
        className={styles.invitationModal}
        visible={openInvitation}
        width={576}
        footer={
          <>
            <Button type="link" onClick={handleOnCloseInvitation}>
              Close
            </Button>
            <Button size="small" withArrow="link" onClick={() => form.submit()}>
              Send Invite
            </Button>
          </>
        }
      >
        <Form
          layout="vertical"
          onFinish={handleOnSubmit}
          form={form}
          autoComplete="off"
        >
          <Form.Item label="Email" name="email">
            <Input type="email" placeholder="Text" required />
          </Form.Item>
          <Form.Item label="Name" name="name">
            <Input placeholder="Text" />
          </Form.Item>
          <Form.Item label="Role" name="role">
            <Dropdown
              overlay={
                <Menu>
                  {ROLES.map((role) => (
                    <Menu.Item
                      key={role.key}
                      onClick={() => {
                        setSelectedRole(role)
                        form.setFieldsValue({ role: role.key })
                      }}
                    >
                      {role.label}
                    </Menu.Item>
                  ))}
                </Menu>
              }
              trigger={['click']}
              placement="bottom"
            >
              <Button type="link" icon={<DropDownIcon />}>
                {selectedRole?.label || '-Please select-'}
              </Button>
            </Dropdown>
            <div className="role-description">
              <p>{roleDescription}</p>
            </div>
          </Form.Item>
          <Form.Item label="Assign to" name="teams">
            <Dropdown
              overlay={
                <Menu>
                  {TEAMS.map((team) => (
                    <Menu.Item key={team.value}>
                      <Checkbox
                        value={team.value}
                        onChange={({ target }) => handleOnCheckedTeams(target)}
                        checked={selectedTeams.includes(team.value)}
                      >
                        {team.label}
                      </Checkbox>
                    </Menu.Item>
                  ))}
                </Menu>
              }
              trigger={['click']}
              placement="bottomRight"
            >
              <Button type="link" icon={<DropDownIcon />}>
                {selectedTeams.length
                  ? selectedTeams.map((s) => s?.replace(/-/g, ' ')).join(', ')
                  : '-Please select-'}
              </Button>
            </Dropdown>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default SetupTeamForm
