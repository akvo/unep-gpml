import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
  Spin,
} from 'antd'
import {
  InfoCircleOutlined,
  LoadingOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import Button from '../../../components/button'
import styles from './setup-team-form.module.scss'
import { DropDownIcon, SearchIcon } from '../../../components/icons'
import api from '../../../utils/api'
import { ROLES, TEAMS } from './config'
import { Trans, t } from '@lingui/macro'
import classNames from 'classnames'

const { Text } = Typography
const MIN_SEARCH_CHAR = 3
const LIMIT_SEARCH_RES = 5

const SetupTeamForm = ({ psItem, members, setReload }) => {
  const [openInvitation, setOpenInvitation] = useState(false)
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(false)
  const [selectedRole, setSelectedRole] = useState(ROLES[2])
  const [stakeholders, setStakeholders] = useState([])
  const [search, setSearch] = useState('')
  const [form] = Form.useForm()

  const roleDescription = useMemo(() => {
    const findRole = ROLES.find((r) => r.key === selectedRole?.key)
    if (findRole) {
      return findRole?.description
    }
    return null
  }, [selectedRole])

  const handleOnAddMember = async (userID) => {
    message.loading({ content: 'Adding...' })
    setOpenDropdown(false)
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
      message.error('Unable to add the user to the channel')
    }
  }

  const handleOnCheckedTeams = (items) => {
    form.setFieldsValue({ teams: items })
  }

  const handleOnCloseInvitation = () => {
    setOpenInvitation(false)
    setSelectedRole(ROLES[2])
  }

  const handleOnSubmit = async (values) => {
    setSending(true)
    try {
      await api.post(
        `/plastic-strategy/${psItem?.country?.isoCodeA2}/team/member/invite`,
        values
      )
      form.resetFields()
      setReload(true)
      setSending(false)
      setSelectedRole(ROLES[2])
      setOpenInvitation(false)
      message.success(t`Invitation sent.`)
    } catch (error) {
      console.error('Unable to send invitation', error)
      message.error('Unable to send invitation')
      setSending(false)
    }
  }

  const searchingApi = useCallback(async () => {
    if (search?.trim()?.length < MIN_SEARCH_CHAR) {
      if (openDropdown) {
        setOpenDropdown(false)
      }
      if (stakeholders.length) {
        setStakeholders([])
      }
      return
    }
    setLoading(true)
    setOpenDropdown(true)
    try {
      const {
        data: { results },
      } = await api.get(`/community?networkType=stakeholder`, {
        q: search,
        limit: LIMIT_SEARCH_RES,
      })
      setStakeholders(results)
      setLoading(false)
    } catch (error) {
      console.error('Unable to fetch by keyword', error)
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => {
      searchingApi()
    }, 500)

    return () => clearTimeout(timer)
  }, [searchingApi])

  return (
    <>
      <Select
        allowClear
        showSearch
        showArrow
        open={openDropdown}
        virtual={false}
        size="small"
        placeholder={t`Start typing...`}
        name="stakeholderName"
        disabled={!stakeholders}
        value={null}
        onSelect={(dataID) => {
          handleOnAddMember(dataID)
        }}
        filterOption={(input, option) => {
          const {
            props: { children: optionText },
          } = option?.children?.[0] || {}
          return optionText?.toLowerCase()?.includes(input.toLowerCase())
        }}
        onSearch={setSearch}
        suffixIcon={<SearchIcon />}
        dropdownClassName={styles.addMemberDropdown}
        dropdownRender={(menu) => (
          <div className={classNames(styles.addNewDropdown, { loading })}>
            <Spin spinning={loading} indicator={<LoadingOutlined />}>
              {menu}
            </Spin>
            <>
              <Divider style={{ margin: '4px 0' }} />
              <div className="add-button-container">
                <a
                  onClick={() => {
                    setOpenDropdown(false)
                    setOpenInvitation(!openInvitation)
                  }}
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
            <Text>{stakeholder?.name}</Text>
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
          initialValues={{
            role: 'viewer'
          }}
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
          <Form.Item
            label={t`Name`}
            name="name"
            rules={[
              {
                required: true,
                message: t`Name is required`,
              },
            ]}
          >
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
