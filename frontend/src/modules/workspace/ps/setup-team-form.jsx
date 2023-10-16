import React, { useMemo, useState } from 'react'
import {
  Checkbox,
  Dropdown,
  Form,
  Input,
  Menu,
  Modal,
  Tooltip,
  Typography,
  message,
} from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import Button from '../../../components/button'
import styles from './setup-team-form.module.scss'
import { DropDownIcon } from '../../../components/icons'
import api from '../../../utils/api'
import { ROLES, TEAMS } from './config'
import AutocompleteForm from '../../../components/autocomplete-form/autocomplete-form'

const { Text } = Typography

const SetupTeamForm = ({ psItem, members, setMembers }) => {
  const [openInvitation, setOpenInvitation] = useState(false)
  const [sending, setSending] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [selectedTeams, setSelectedTeams] = useState([])
  const [form] = Form.useForm()

  const roleDescription = useMemo(() => {
    const findRole = ROLES.find((r) => r.key === selectedRole?.key)
    if (findRole) {
      return findRole?.description
    }
    return null
  }, [selectedRole])

  const handleOnAddMember = async (newMember) => {
    const isExist = members.find((m) => m.id === newMember?.id)
    if (isExist) {
      message.warning('User already added as a member')
      return
    }
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
    } catch (error) {
      console.error('Unable to add a member', error)
    }
  }

  const handleOnCheckedTeams = (items) => {
    setSelectedTeams(items)
    form.setFieldsValue({ teams: items })
  }

  const handleOnOpenInvitation = () => {
    setOpenInvitation(true)
  }

  const handleOnCloseInvitation = () => {
    setOpenInvitation(false)
    setSelectedRole(null)
    setSelectedTeams([])
  }

  const handleOnSubmit = async (values) => {
    setSending(true)
    try {
      await api.post(
        `/plastic-strategy/${psItem?.country?.isoCodeA2}/team/member/invite`,
        values
      )
      setSending(false)
      setSelectedRole(null)
      setSelectedTeams([])
      setOpenInvitation(false)
      message.success('Invitation sent!')
    } catch (error) {
      console.error('Unable to send invitation', error)
      message.error('Unable to send invitation')
      setSending(false)
    }
  }

  const renderItem = (item) => {
    if (item?.onClick) {
      return (
        <Button type={item.type} onClick={item.onClick}>
          {item.text}
        </Button>
      )
    }
    return (
      <>
        <Text>{item?.name}</Text>
        <strong className="w-bold">{item?.affiliation?.name}</strong>
      </>
    )
  }

  return (
    <>
      <AutocompleteForm
        apiParams={{ networkType: 'stakeholder', limit: 10 }}
        extraButton={{
          text: '+ Invite a New Member',
          type: 'link',
          onClick: handleOnOpenInvitation,
        }}
        onSelect={handleOnAddMember}
        renderItem={renderItem}
      />
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
            <Button
              size="small"
              withArrow="link"
              onClick={() => form.submit()}
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send Invite'}
            </Button>
          </>
        }
      >
        <Form
          layout="vertical"
          onFinish={handleOnSubmit}
          form={form}
          autoComplete="off"
          requiredMark="required"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: 'Email is required',
              },
              {
                type: 'email',
                message: 'Invalid Email address',
              },
            ]}
          >
            <Input type="email" placeholder="Text" />
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
            <Checkbox.Group onChange={handleOnCheckedTeams}>
              {TEAMS.map((team) => (
                <Checkbox key={team.value} value={team.value}>
                  {team.label}
                  <Tooltip
                    placement="top"
                    title={team.description}
                    trigger={['click']}
                  >
                    {' '}
                    <InfoCircleOutlined />
                  </Tooltip>
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default SetupTeamForm
