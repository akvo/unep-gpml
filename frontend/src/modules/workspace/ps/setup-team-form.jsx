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
  Select,
  Divider,
} from 'antd'
import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons'
import Button from '../../../components/button'
import styles from './setup-team-form.module.scss'
import { DropDownIcon, SearchIcon } from '../../../components/icons'
import api from '../../../utils/api'
import { ROLES, TEAMS } from './config'
import { Trans, t } from '@lingui/macro'
import { UIStore } from '../../../store'

const { Text } = Typography

const SetupTeamForm = ({ psItem, members, setReload }) => {
  const [openInvitation, setOpenInvitation] = useState(false)
  const [sending, setSending] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [form] = Form.useForm()
  const { stakeholders } = UIStore.useState((s) => s.stakeholders) || {}

  const roleDescription = useMemo(() => {
    const findRole = ROLES.find((r) => r.key === selectedRole?.key)
    if (findRole) {
      return findRole?.description
    }
    return null
  }, [selectedRole])

  const handleOnAddMember = async (userID) => {
    const isExist = members.find((m) => m.id === userID)
    if (isExist) {
      message.warning(t`User already added as a member`)
      return
    }
    try {
      const payload = {
        user_id: userID,
        teams: [],
        role: 'viewer',
      }
      await api.post(
        `/plastic-strategy/${psItem?.country?.isoCodeA2}/team/member`,
        payload
      )
      setReload(true)
    } catch (error) {
      console.error('Unable to add a member', error)
    }
  }

  const handleOnCheckedTeams = (items) => {
    form.setFieldsValue({ teams: items })
  }

  const handleOnCloseInvitation = () => {
    setOpenInvitation(false)
    setSelectedRole(null)
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
      setOpenInvitation(false)
      message.success(t`Invitation sent.`)
    } catch (error) {
      console.error('Unable to send invitation', error)
      message.error('Unable to send invitation')
      setSending(false)
    }
  }

  return (
    <>
      <Select
        allowClear
        showSearch
        showArrow
        virtual={false}
        size="small"
        placeholder={t`Start typing...`}
        name="stakeholderName"
        disabled={!stakeholders}
        onSelect={(dataID) => {
          handleOnAddMember(dataID)
        }}
        filterOption={(input, option) => {
          const {
            props: { children: optionText },
          } = option?.children?.[0] || {}
          return optionText?.toLowerCase()?.includes(input.toLowerCase())
        }}
        suffixIcon={<SearchIcon />}
        dropdownRender={(menu) => (
          <div className={styles.addNewDropdown}>
            {menu}
            <>
              <Divider style={{ margin: '4px 0' }} />
              <div className="add-button-container">
                <a
                  onClick={() => setOpenInvitation(!openInvitation)}
                  className="h-xs"
                >
                  <PlusOutlined /> Invite a New Member
                </a>
              </div>
            </>
          </div>
        )}
      >
        {stakeholders?.map((stakeholder) => (
          <Select.Option value={stakeholder.id} key={stakeholder.id}>
            <Text>{`${stakeholder?.firstName} ${stakeholder?.lastName}`}</Text>
            <strong className="w-bold">{stakeholder?.affiliation?.name}</strong>
          </Select.Option>
        ))}
      </Select>
      <Modal
        title={t`Invite a new member`}
        className={styles.invitationModal}
        visible={openInvitation}
        width={576}
        footer={
          <>
            <Button type="link" onClick={handleOnCloseInvitation}>
              <Trans>Close</Trans>
            </Button>
            <Button
              size="small"
              withArrow="link"
              onClick={() => form.submit()}
              disabled={sending}
            >
              {sending ? t`Sending...` : t`Send Invite`}
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
                message: t`Email is required`,
              },
              {
                type: 'email',
                message: t`Invalid Email address`,
              },
            ]}
          >
            <Input type="email" placeholder={t`Text`} />
          </Form.Item>
          <Form.Item label={t`Name`} name="name">
            <Input placeholder="Text" />
          </Form.Item>
          <Form.Item label={t`Role`} name="role">
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
                {selectedRole?.label || t`- Please select -`}
              </Button>
            </Dropdown>
            <div className="role-description">
              <p>{roleDescription}</p>
            </div>
          </Form.Item>
          <Form.Item label={t`Assign to`} name="teams">
            <Checkbox.Group onChange={handleOnCheckedTeams}>
              {TEAMS.map((team) => (
                <Checkbox key={team.value} value={team.value}>
                  {team.label}
                  <Tooltip
                    placement="top"
                    title={team.description}
                    trigger={['hover']}
                  >
                    <InfoCircleOutlined style={{ marginLeft: 10 }} />
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
