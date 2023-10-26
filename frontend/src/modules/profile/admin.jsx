import { UIStore } from '../../store'
import {
  notification,
  Collapse,
  Space,
  Modal,
  Select,
  Pagination,
  Tooltip,
  Input,
  Tabs,
  Typography,
  Checkbox,
  Spin,
  Form,
} from 'antd'
const { Title } = Typography
import React from 'react'
import { useEffect, useState, useMemo } from 'react'
import api from '../../utils/api'
import { fetchSubmissionData } from './utils'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import invert from 'lodash/invert'
import { DetailCollapse } from './preview'
import {
  userRoles,
  topicNames,
  resourceTypeToTopicType,
  reviewStatusUIText,
  publishStatusUIText,
  submissionReviewStatusUIText,
} from '../../utils/misc'
import {
  LoadingOutlined,
  UserOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import Avatar from 'antd/lib/avatar/avatar'
import Expert from './expert'
import IconExpert from '../../images/expert-icon.svg'
import debouce from 'lodash.debounce'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Button from '../../components/button'

const { Search } = Input
const { TabPane } = Tabs
const { Option } = Select

const ModalReject = ({ visible, close, reject, item, action = 'Decline' }) => {
  return (
    <Modal
      width={600}
      okText="Close"
      visible={visible}
      footer={
        <div>
          <Button onClick={(e) => reject()}>Yes</Button>
          <Button onClick={(e) => close()} type="primary">
            No
          </Button>
        </div>
      }
      closable={false}
    >
      <div className="warning-modal-user">
        <p>Are you sure you want to {action?.toLowerCase()}?</p>
      </div>
    </Modal>
  )
}

const HeaderSearch = ({ placeholder, listOpts, setListOpts }) => {
  return (
    <Search
      className="search"
      placeholder={placeholder ? placeholder : 'Search for a resource'}
      allowClear
      onSearch={(title) => {
        ;(async () => {
          const data = await fetchSubmissionData(
            1,
            10,
            listOpts.type,
            listOpts.reviewStatus,
            title
          )
          setListOpts((opts) => ({
            ...opts,
            data,
            title,
            size: 10,
            current: 1,
          }))
        })()
      }}
    />
  )
}
const reviewStatusOrderedList = ['Published', 'Pending', 'Declined']
const statusDictToHuman = {
  APPROVED: 'Published',
  SUBMITTED: 'Pending',
  REJECTED: 'Declined',
  INVITED: 'Invited',
}
const statusDictToAPI = invert(statusDictToHuman)

const HeaderFilter = ({
  listOpts,
  reviewers,
  setListOpts,
  initialReviewStatus,
  expert,
}) => {
  const [selectedValue, setSelectedValue] = useState(
    (listOpts.reviewStatus && statusDictToHuman[listOpts.reviewStatus]) ||
      initialReviewStatus
  )
  return (
    <Select
      showSearch
      allowClear
      className="filter-by-status"
      value={selectedValue}
      onChange={(x) => {
        setSelectedValue(x)
        if (typeof x === 'undefined') {
          ;(async () => {
            const data = await fetchSubmissionData(
              1,
              10,
              expert ? 'experts' : listOpts.type,
              listOpts.title
            )
            setListOpts((opts) => ({
              ...opts,
              reviewStatus: null,
              data,
              size: 10,
              current: 1,
            }))
          })()
        } else {
          const reviewStatus = statusDictToAPI[x]
          setListOpts((opts) => ({ ...opts, reviewStatus }))
          ;(async () => {
            const data = await fetchSubmissionData(
              1,
              10,
              expert ? 'experts' : listOpts.type,
              reviewStatus,
              listOpts.title
            )
            setListOpts((opts) => ({
              ...opts,
              reviewStatus,
              data,
              current: 1,
              size: 10,
            }))
          })()
        }
      }}
      optionLabelProp="label"
      placeholder={
        <>
          <FilterOutlined className="filter-icon" /> Filter by review status
        </>
      }
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
    >
      {[
        ...reviewStatusOrderedList,
        ...(listOpts.type === 'stakeholders' ? ['Invited'] : []),
      ].map((x, i) => (
        <Option
          key={`${x}-${i}`}
          value={x}
          label={
            <>
              <FilterOutlined className="filter-icon" /> {x}
            </>
          }
        >
          {x}
        </Option>
      ))}
    </Select>
  )
}

const RoleSelect = ({
  stakeholder,
  onChangeRole,
  loading,
  listOpts,
  setListOpts,
}) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <div style={{ width: '100%' }}>User role</div>
      <Select
        style={{ width: '200px' }}
        showSearch={false}
        onChange={(role) =>
          onChangeRole(stakeholder, role, listOpts, setListOpts)
        }
        value={[stakeholder?.role]}
        loading={stakeholder?.id === loading}
        // FIXME: Disallow changing roles of other admins?
        // stakeholder?.role === "ADMIN"
        disabled={stakeholder?.id === loading}
      >
        {userRoles.map((r) => (
          <Select.Option key={r} value={r}>
            {r}
          </Select.Option>
        ))}
      </Select>
    </div>
  )
}

const OwnerSelect = ({
  item,
  onChangeOwner,
  loading,
  reviewers,
  listOpts,
  setListOpts,
  showLabel,
}) => {
  return (
    <div
      className="review-status-container"
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      {showLabel && <div style={{ width: '100%' }}>Owners</div>}
      <Select
        size="small"
        style={{ width: '100%' }}
        showSearch={true}
        mode="multiple"
        placeholder="Assign owner"
        onChange={(data) => {
          onChangeOwner(item, data, listOpts, setListOpts)
        }}
        value={item?.owners ? item?.owners.map((item) => item.id) : []}
        loading={item?.id === loading}
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        filterSort={(optionA, optionB) =>
          optionA.children
            .toLowerCase()
            .localeCompare(optionB.children.toLowerCase())
        }
        // FIXME: Disallow changing roles of other admins?
        // stakeholder?.role === "ADMIN"
        disabled={item?.id === loading}
      >
        {reviewers.map((r) => (
          <Select.Option key={r.email} value={r.id}>
            {r.email}
          </Select.Option>
        ))}
      </Select>
    </div>
  )
}

const FocalPoint = ({
  item,
  onChangeFocalPoint,
  loading,
  reviewers,
  listOpts,
  setListOpts,
  debouncedResults,
  fetching,
  focalPoints,
}) => {
  return (
    <div className="review-status-container">
      <Select
        style={{ width: '100%' }}
        allowClear
        showSearch={true}
        mode="multiple"
        placeholder="Assign focal point"
        onChange={(data) => {
          onChangeFocalPoint(item, data, listOpts, setListOpts)
        }}
        value={
          item?.focalPoints ? item?.focalPoints.map((item) => item.id) : []
        }
        filterOption={false}
        onSearch={debouncedResults}
        notFoundContent={fetching ? <Spin size="small" /> : null}
      >
        {[
          ...focalPoints,
          ...(item?.focalPoints.length > 0 ? item.focalPoints : []),
        ]?.map((r) => (
          <Select.Option key={r.id} value={r.id}>
            {r.email}
          </Select.Option>
        ))}
      </Select>
    </div>
  )
}

const resourceBadges = [{ name: 'resource-verified', img: '/verified.svg' }]
const orgBadges = [
  { name: 'org-verified', img: '/verified.svg' },
  { name: 'org-partner-verified', img: '/partner-verified.svg' },
  { name: 'org-coe-verified', img: '/coe-verified.svg' },
]
const userBadges = [
  { name: 'user-verified', img: '/verified.svg' },
  { name: 'user-focal-point-verified', img: '/focal-verified.svg' },
]

const AdminSection = ({
  resourcesData,
  setResourcesData,
  stakeholdersData,
  setStakeholdersData,
  entitiesData,
  nonMemberEntitiesData,
  setEntitiesData,
  tagsData,
}) => {
  const router = useRouter()
  const { user_id, channel_id, email, channel_name } = router.query
  const profile = UIStore.useState((s) => s.profile)
  const [modalRejectVisible, setModalRejectVisible] = useState(false)
  // TODO:: refactor modalRejectAction and modalRejectFunction
  const [modalRejectAction, setModalRejectAction] = useState('decline')
  const [modalRejectFunction, setModalRejectFunction] = useState(false)

  //TODO :: improve detail preview
  const [previewContent, storePreviewContent] = useState({})

  const [approveLoading, setApproveLoading] = useState({})
  const [loadingAssignReviewer, setLoadingAssignReviewer] = useState(false)
  const [loading, setLoading] = useState(false)
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestButtonText, setRequestButtonText] = useState('Approve')
  const [exportLoading, setExportLoading] = useState(false)
  const [expert, setExpert] = useState(false)

  const [tab, setTab] = useState('stakeholders')
  const [stakeholdersListOpts, setStakeholdersListOpts] = useState({
    titleFilter: null,
    reviewStatus: 'SUBMITTED',
    data: stakeholdersData,
    type: 'stakeholders',
    current: 1,
    size: 10,
  })
  const [entitiesListOpts, setEntitiesListOpts] = useState({
    titleFilter: null,
    reviewStatus: 'SUBMITTED',
    data: entitiesData,
    type: 'entities',
    current: 1,
    size: 10,
  })
  const [nonMemberEantitiesListOpts, setNonMemberEantitiesListOpts] = useState({
    titleFilter: null,
    reviewStatus: 'SUBMITTED',
    data: nonMemberEntitiesData,
    type: 'non-member-entities',
    current: 1,
    size: 10,
  })
  const [resourcesListOpts, setResourcesListOpts] = useState({
    titleFilter: null,
    reviewStatus: 'SUBMITTED',
    data: resourcesData,
    type: 'resources',
    current: 1,
    size: 10,
  })
  const [tagsListOpts, setTagsListOpts] = useState({
    titleFilter: null,
    reviewStatus: 'SUBMITTED',
    data: tagsData,
    type: 'tags',
    current: 1,
    size: 10,
  })

  const [reviewers, setReviewers] = useState([])
  const [focalPoints, setFocalPoints] = useState([])
  const [fetching, setFetching] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    api.get(`/reviewer`).then((res) => {
      setReviewers(res?.data?.reviewers)
    })
  }, [])

  useEffect(() => {
    if (user_id) {
      setTab('privateChat')
    }
  }, [user_id])

  const handleChatRequest = () => {
    setRequestLoading(true)
    const data = {
      channel_id: channel_id,
      channel_name: channel_name,
      user_id: Number(user_id),
    }
    api
      .post(`/chat/channel/private/add-user`, data)
      .then(() => {
        notification.success({
          message: `Your request to join the ${channel_name} has been approved!`,
        })
        setRequestButtonText('Approved')
        setRequestLoading(false)
      })
      .catch((err) => {
        setRequestLoading(false)
        notification.error({
          message: err?.response?.data?.errorDetails?.error
            ? err?.response?.data?.errorDetails?.error
            : 'Something went wrong',
        })
      })
  }

  const onFinish = (values) => {
    const data = {
      tag_category: 'general',
      tag: values.tag,
      review_status: 'APPROVED',
      private: true,
    }
    api
      .post(`/tag`, data)
      .then(() => {
        form.resetFields()
        notification.success({ message: 'Tag added!' })
      })
      .catch((err) => {
        notification.error({
          message: err?.response?.data?.errorDetails?.error
            ? err?.response?.data?.errorDetails?.error
            : 'Something went wrong',
        })
      })
  }

  const handleSearch = (newValue) => {
    setFetching(true)
    api.get(`/reviewer?q=${newValue}`).then((res) => {
      setFocalPoints(res?.data?.reviewers)
      setFetching(false)
    })
  }

  const debouncedResults = useMemo(() => {
    return debouce(handleSearch, 300)
  }, [])

  const changeRole = (stakeholder, role, listOpts, setListOpts) => {
    setLoading(stakeholder.id)
    api
      .patch(`/stakeholder/${stakeholder.id}`, { role })
      .then((resp) => {
        notification.success({ message: 'User role changed' })
        // FIXME: Add error handling in case the PATCH fails!
        setLoading(false)
      })
      .then(() =>
        fetchSubmissionData(
          listOpts.current,
          listOpts.size,
          listOpts.type,
          listOpts.reviewStatus,
          listOpts.title
        )
      )
      .then((data) => setListOpts((opts) => ({ ...opts, data })))
      .catch((err) => {
        notification.error({ message: 'Something went wrong' })
      })
  }

  const changeOwner = (item, owners, listOpts, setListOpts) => {
    setLoading(item.id)
    const stakeholders = owners.map((x) => ({ id: x, roles: ['owner'] }))
    const focalPoints = item?.focalPoints?.map((x) => ({
      id: x.id,
      roles: ['focal-point'],
    }))
    api
      .post(`/auth/${item.type}/${item.id}`, {
        stakeholders: [...stakeholders, ...focalPoints],
      })
      .then((resp) => {
        notification.success({ message: 'Ownerships changed' })
        setLoading(false)
      })
      .then(() =>
        fetchSubmissionData(
          listOpts.current,
          listOpts.size,
          listOpts.type,
          listOpts.reviewStatus,
          listOpts.title
        )
      )
      .then((data) => setListOpts((opts) => ({ ...opts, data })))
      .catch((err) => {
        notification.error({
          message: err?.response?.data?.errorDetails?.error
            ? err?.response?.data?.errorDetails?.error
            : 'Something went wrong',
        })
        setLoading(false)
      })
  }

  const changeFocalPoint = (item, owners, listOpts, setListOpts) => {
    setLoading(item.id)
    const focalPoints = owners?.map((x) => ({ id: x, roles: ['focal-point'] }))
    const stakeholders = item?.owners?.map((x) => ({
      id: x.id,
      roles: ['owner'],
    }))
    api
      .post(`/auth/${item.type}/${item.id}`, {
        stakeholders: [...stakeholders, ...focalPoints],
      })
      .then((resp) => {
        notification.success({ message: 'Focal point changed' })
        setLoading(false)
      })
      .then(() =>
        fetchSubmissionData(
          listOpts.current,
          listOpts.size,
          listOpts.type,
          listOpts.reviewStatus,
          listOpts.title
        )
      )
      .then((data) => setListOpts((opts) => ({ ...opts, data })))
      .catch((err) => {
        setLoading(false)
        notification.error({
          message: err?.response?.data?.errorDetails?.error
            ? err?.response?.data?.errorDetails?.error
            : 'Something went wrong',
        })
      })
  }

  const review = (item, reviewStatus, listOpts, setListOpts) => () => {
    setApproveLoading({ ...item, button: reviewStatus })
    const itemType =
      item.type === 'initiative'
        ? 'initiative'
        : resourceTypeToTopicType(item.type)
    api
      .put('submission', {
        id: item.id,
        itemType: itemType,
        reviewStatus: reviewStatus,
      })
      .then((res) => {
        ;(async () => {
          const data = await fetchSubmissionData(
            listOpts.current,
            listOpts.size,
            listOpts.type,
            listOpts.reviewStatus,
            listOpts.title
          )
          notification.success({
            message: res?.data?.message
              ? res?.data?.message
              : 'Something went wrong',
          })
          setListOpts((opts) => ({ ...opts, data }))
          setApproveLoading({})
        })()
        setModalRejectVisible(false)
      })
  }

  const reject = (item, reviewStatus, action, listOpts, setListOpts) => () => {
    setModalRejectFunction(() =>
      review(item, reviewStatus, listOpts, setListOpts)
    )
    setModalRejectAction(action)
    setModalRejectVisible(true)
  }

  const getPreviewContent = (urls, update) => {
    if (urls.length > 0 || update) {
      urls.forEach((url) => {
        if (!previewContent[url] || update) {
          api.get(url).then((res) => {
            storePreviewContent({ ...previewContent, [url]: res.data })
          })
        }
      })
    }
  }

  const downloadCSV = async (data, name) => {
    const blob = new Blob([data], { type: 'data:text/csv;charset=utf-8,' })
    const blobURL = window.URL.createObjectURL(blob)

    const anchor = document.createElement('a')
    anchor.download = name
    anchor.href = blobURL
    anchor.dataset.downloadurl = [
      'text/csv',
      anchor.download,
      anchor.href,
    ].join(':')
    anchor.click()

    setTimeout(() => {
      URL.revokeObjectURL(blobURL)
    }, 100)
  }

  const exportList = (type, status) => {
    setExportLoading(true)
    api
      .get(`/export/${type}?review_status=${status}`)
      .then((res) => {
        downloadCSV(res.data, `${type}.csv`)
        setExportLoading(false)
      })
      .catch((err) => {
        console.log(err)
        setExportLoading(false)
      })
  }

  const assignReviewer = (item, reviewers, listOpts, setListOpts) => {
    setLoadingAssignReviewer(item)
    const apiCall = isEmpty(item?.reviewers) ? api.post : api.patch
    apiCall(`/review/${item.type}/${item.id}`, { reviewers }).then((res) => {
      setLoadingAssignReviewer(false)
      ;(async () => {
        const data = await fetchSubmissionData(
          listOpts.current,
          listOpts.size,
          listOpts.type,
          listOpts.reviewStatus,
          listOpts.title
        )
        setListOpts((opts) => ({ ...opts, data }))
      })()
    })
  }

  const ReviewStatus = ({ item, listOpts, setListOpts }) => {
    return (
      <div
        className="review-status-container"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div style={{ width: '100%' }}>Reviewers</div>
        <Select
          style={{ width: '100%' }}
          mode="multiple"
          showSearch={true}
          className="select-reviewer"
          placeholder="Assign reviewers"
          onChange={(data) => assignReviewer(item, data, listOpts, setListOpts)}
          value={item?.reviewers.map((x) => x.id)}
          loading={item?.id === loading}
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          filterSort={(optionA, optionB) =>
            optionA.children
              .toLowerCase()
              .localeCompare(optionB.children.toLowerCase())
          }
          // FIXME: Disallow changing roles of other admins?
          // stakeholder?.role === "ADMIN"
          disabled={item?.id === loading}
        >
          {reviewers.map((r) => (
            <Select.Option key={r.email} value={r.id}>
              {r.email}
            </Select.Option>
          ))}
        </Select>
      </div>
    )
  }

  const handleVerify = async (
    e,
    item,
    badgeName,
    assign,
    listOpts,
    setListOpts,
    entityName
  ) => {
    e.stopPropagation()

    const data = {
      assign: assign,
      entity_id: item.id,
      entity_type: entityName,
    }

    api
      .post(`/badge/${badgeName}/assign`, data)
      .then((resp) => {
        notification.success({
          message: `Your request to ${
            assign ? 'add' : 'remove'
          } ${badgeName} has been approved!`,
        })
        const updatedState = {
          ...listOpts,
          data: {
            ...listOpts.data,
            data: listOpts.data.data.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    assignedBadges: assign
                      ? [
                          ...i.assignedBadges,
                          {
                            badgeName: badgeName,
                          },
                        ]
                      : i.assignedBadges.filter(
                          (b) => b.badgeName !== badgeName
                        ),
                  }
                : i
            ),
          },
        }

        setListOpts(updatedState)
      })
      .catch((err) => {
        notification.error({
          message: err?.response?.data?.errorDetails?.error
            ? err?.response?.data?.errorDetails?.error
            : 'Something went wrong',
        })
      })
  }

  const PublishButton = ({
    item,
    type,
    className = '',
    disabled = false,
    listOpts,
    setListOpts,
  }) => (
    <Button
      size="small"
      ghost
      className={className}
      disabled={disabled}
      onClick={review(item, 'APPROVED', listOpts, setListOpts)}
      loading={
        !isEmpty(approveLoading) &&
        approveLoading?.button === 'APPROVED' &&
        item?.id === approveLoading?.id &&
        item?.type === approveLoading?.type
      }
    >
      {publishStatusUIText['APPROVE']}
    </Button>
  )

  const UnpublishButton = ({
    item,
    type,
    className = '',
    disabled = false,
    uiTitle = 'REJECT',
    action = 'REJECTED',
    listOpts,
    setListOpts,
  }) => (
    <Button
      size="small"
      danger
      className={className}
      disabled={disabled}
      onClick={reject(
        item,
        'REJECTED',
        publishStatusUIText[uiTitle],
        listOpts,
        setListOpts
      )}
      loading={
        !isEmpty(approveLoading) &&
        approveLoading?.button === action &&
        item?.id === approveLoading?.id &&
        item?.type === approveLoading?.type
      }
    >
      {publishStatusUIText[uiTitle]}
    </Button>
  )

  const ExportButton = ({
    item,
    type,
    className = '',
    disabled = false,
    listOpts,
    setListOpts,
  }) => (
    <Button
      ghost
      className={className}
      disabled={disabled}
      loading={exportLoading}
      size="small"
      onClick={() =>
        exportList(
          listOpts.type === 'stakeholders'
            ? 'users'
            : listOpts.type === 'resources'
            ? 'topics'
            : listOpts.type,
          listOpts.reviewStatus
        )
      }
    >
      Export
    </Button>
  )

  const renderList = (listOpts, setListOpts, title) => {
    const itemList = listOpts.data || []
    const onChangePage = (current, pageSize) => {
      ;(async () => {
        const size = pageSize ? pageSize : itemList.limit
        const data = await fetchSubmissionData(
          current,
          size,
          listOpts.type,
          listOpts.reviewStatus,
          listOpts.title
        )
        setListOpts((opts) => ({ ...opts, data, size, current }))
      })()
    }

    const ResourceApprovedActions = ({ item }) => (
      <div
        className="col action"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <Space size="small">
          <UnpublishButton
            item={item}
            type="ghost"
            className="black"
            uiTitle="UNAPPROVE"
            action="UNAPPROVED"
            listOpts={listOpts}
            setListOpts={setListOpts}
          />
        </Space>
      </div>
    )

    const RenderRow = ({ item, setListOpts, listOpts }) => {
      const ResourceAvatar = () => (
        <div className="col content">
          <Avatar
            className="content-img"
            size={50}
            src={item.image}
            icon={item.picture || <UserOutlined />}
          />
          <div className="content-body">
            <div className="title">{item.title || 'No Title'}</div>
            <div className="topic">{topicNames(item.type)}</div>
          </div>
        </div>
      )
      const ResourceSubmittedActions = () => (
        <div
          className="col action"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <Space size="small">
            {item.type === 'profile' ? (
              item.emailVerified ? (
                <PublishButton
                  item={item}
                  type="ghost"
                  listOpts={listOpts}
                  setListOpts={setListOpts}
                />
              ) : (
                <Tooltip title="Profile cannot be approved since email is not verified">
                  <PublishButton
                    item={item}
                    type="secondary"
                    disabled={true}
                    listOpts={listOpts}
                    setListOpts={setListOpts}
                  />
                </Tooltip>
              )
            ) : item.type === 'policy' ? (
              <Tooltip title="Policies are imported from Law division system">
                <PublishButton
                  item={item}
                  type="secondary"
                  disabled={true}
                  listOpts={listOpts}
                  setListOpts={setListOpts}
                />
              </Tooltip>
            ) : (
              <PublishButton
                item={item}
                type="ghost"
                listOpts={listOpts}
                setListOpts={setListOpts}
              />
            )}
            <UnpublishButton
              item={item}
              type="link"
              className="black"
              uiTitle="REJECT"
              action="REJECTED"
              listOpts={listOpts}
              setListOpts={setListOpts}
            />
          </Space>
        </div>
      )

      return (
        <>
          {item.type !== 'tag' ? (
            <div className="row">
              <ResourceAvatar />
              <div className="actions-container">
                {item.reviewStatus === 'SUBMITTED' && (
                  <ReviewStatus
                    item={item}
                    listOpts={listOpts}
                    setListOpts={setListOpts}
                  />
                )}
                {item.type === 'stakeholder' && item?.expertise?.length > 0 && (
                  <div className="expert-icon">
                    <IconExpert />
                  </div>
                )}
                {item.type !== 'stakeholder' && item.type !== 'organisation' && (
                  <div className="badge-wrapper">
                    {resourceBadges.map((b) => {
                      const find = item?.assignedBadges?.find(
                        (bName) => bName.badgeName === b.name
                      )
                      return (
                        <Tooltip
                          placement="top"
                          title={find ? `Remove ${b.name}` : `Add ${b.name}`}
                          color="#020A5B"
                        >
                          <div
                            key={b.name}
                            className={`badge-icon ${find ? 'verified' : ''}`}
                            onClick={(e) =>
                              handleVerify(
                                e,
                                item,
                                b.name,
                                find ? false : true,
                                listOpts,
                                setListOpts,
                                'resource'
                              )
                            }
                          >
                            <img src={b.img} />
                          </div>
                        </Tooltip>
                      )
                    })}
                  </div>
                )}
                {item.type === 'organisation' && (
                  <div className="badge-wrapper">
                    {orgBadges.map((b) => {
                      const find = item?.assignedBadges?.find(
                        (bName) => bName.badgeName === b.name
                      )
                      return (
                        <Tooltip
                          placement="top"
                          title={find ? `Remove ${b.name}` : `Add ${b.name}`}
                          color="#020A5B"
                        >
                          <div
                            key={b.name}
                            className={`badge-icon ${find ? 'verified' : ''}`}
                            onClick={(e) =>
                              handleVerify(
                                e,
                                item,
                                b.name,
                                find ? false : true,
                                listOpts,
                                setListOpts,
                                'organisation'
                              )
                            }
                          >
                            <img src={b.img} />
                          </div>
                        </Tooltip>
                      )
                    })}
                  </div>
                )}
                {item.type === 'stakeholder' && (
                  <div className="badge-wrapper">
                    {userBadges.map((b) => {
                      const find = item?.assignedBadges?.find(
                        (bName) => bName.badgeName === b.name
                      )
                      return (
                        <Tooltip
                          placement="top"
                          title={find ? `Remove ${b.name}` : `Add ${b.name}`}
                          color="#020A5B"
                        >
                          <div
                            key={b.name}
                            className={`badge-icon ${find ? 'verified' : ''}`}
                            onClick={(e) =>
                              handleVerify(
                                e,
                                item,
                                b.name,
                                find ? false : true,
                                listOpts,
                                setListOpts,
                                'stakeholder'
                              )
                            }
                          >
                            <img src={b.img} />
                          </div>
                        </Tooltip>
                      )
                    })}
                  </div>
                )}
                {item.reviewStatus === 'APPROVED' &&
                  item.type === 'stakeholder' && (
                    <RoleSelect
                      stakeholder={item}
                      onChangeRole={changeRole}
                      loading={loading}
                      listOpts={listOpts}
                      setListOpts={setListOpts}
                    />
                  )}
                <>
                  {item.reviewStatus === 'APPROVED' &&
                    item.type !== 'stakeholder' &&
                    item.type !== 'organisation' && (
                      <OwnerSelect
                        item={item}
                        reviewers={reviewers}
                        setListOpts={setListOpts}
                        listOpts={listOpts}
                        resource={item}
                        onChangeOwner={changeOwner}
                        loading={loading}
                        showLabel={true}
                      />
                    )}
                </>
                {item.reviewStatus === 'SUBMITTED' && (
                  <ResourceSubmittedActions />
                )}
              </div>
              {/* {item.reviewStatus === "APPROVED" && <ResourceApprovedActions />} */}
            </div>
          ) : (
            <div className="row">
              <ResourceAvatar />
              {item.reviewStatus === 'SUBMITTED' && (
                <ResourceSubmittedActions />
              )}
              {item.reviewStatus === 'APPROVED' && (
                <ResourceApprovedActions item={item} />
              )}
            </div>
          )}
        </>
      )
    }

    return (
      <div key={`new-approval-${title ? title : ''}`} className="approval">
        {title && <Title className="tab-label" level={4}>{`${title}`}</Title>}
        <div>
          <b className="approval-bold-text">Total:</b> {itemList.count || 0}
        </div>
        {(listOpts.reviewStatus || listOpts.title) && (
          <div>
            <div className="export-wrapper">
              <div>
                <b className="approval-bold-text">Filtering by:</b>
                {listOpts.type === 'stakeholders' && (
                  <Checkbox
                    className="expert-checkbox"
                    onChange={(e) => {
                      setExpert(e.target.checked)
                      const reviewStatus = listOpts.reviewStatus
                      setListOpts((opts) => ({ ...opts, reviewStatus }))
                      ;(async () => {
                        const data = await fetchSubmissionData(
                          1,
                          10,
                          e.target.checked ? 'experts' : 'stakeholders',
                          reviewStatus,
                          listOpts.title
                        )
                        setListOpts((opts) => ({
                          ...opts,
                          reviewStatus,
                          data,
                          current: 1,
                          size: 10,
                        }))
                      })()
                    }}
                  >
                    Experts
                  </Checkbox>
                )}
              </div>
              {title !== 'Tags' && (
                <div>
                  <ExportButton listOpts={listOpts} />
                </div>
              )}
            </div>
            <hr />
            {listOpts.reviewStatus && (
              <div className="review-status-wrapper">
                <b className="approval-bold-text">Review status:</b>{' '}
                {statusDictToHuman[listOpts.reviewStatus]}
              </div>
            )}
            {listOpts.title && (
              <div>
                <b className="approval-bold-text">Title:</b> {listOpts.title}
              </div>
            )}
          </div>
        )}
        <div className="table-wrapper">
          <div className="row head">
            <HeaderSearch setListOpts={setListOpts} listOpts={listOpts} />
            <HeaderFilter
              setListOpts={setListOpts}
              listOpts={listOpts}
              initialReviewStatus="Pending"
              expert={expert}
            />
          </div>
          <Collapse onChange={getPreviewContent}>
            {itemList?.data && itemList?.data?.length > 0 ? (
              itemList.data.map((item, index) => (
                <Collapse.Panel
                  key={item.preview}
                  className={`request-collapse-panel-item ${
                    item?.reviewer?.id ? 'status-show' : 'status-none'
                  }`}
                  header={
                    <>
                      <div className="content-status">
                        {loadingAssignReviewer.id === item?.id &&
                          loadingAssignReviewer.type === item?.type && (
                            <span className="status">
                              <LoadingOutlined spin /> Loading
                            </span>
                          )}
                        {listOpts.reviewStatus === null && (
                          <span
                            className={`status review-status ${item.reviewStatus.toLowerCase()}`}
                          >
                            {submissionReviewStatusUIText[item.reviewStatus]}
                          </span>
                        )}
                        {listOpts.reviewStatus !== null &&
                          !isEmpty(item.reviewers) && (
                            <span>Status of the review: </span>
                          )}
                        {listOpts.reviewStatus !== null &&
                          item.reviewers.map((x) => (
                            <span
                              className={`status review-status ${x.reviewStatus.toLowerCase()}`}
                            >
                              {reviewStatusUIText[x.reviewStatus]}
                            </span>
                          ))}
                      </div>
                      <RenderRow
                        item={item}
                        listOpts={listOpts}
                        setListOpts={setListOpts}
                      />
                    </>
                  }
                >
                  <DetailCollapse
                    data={previewContent?.[item.preview] || {}}
                    item={item}
                    getPreviewContent={getPreviewContent}
                    unpublishButton={<ResourceApprovedActions item={item} />}
                    focalPoint={
                      <FocalPoint
                        item={item}
                        reviewers={reviewers}
                        listOpts={listOpts}
                        setListOpts={setListOpts}
                        onChangeFocalPoint={changeFocalPoint}
                        debouncedResults={debouncedResults}
                        fetching={fetching}
                        focalPoints={focalPoints}
                      />
                    }
                    ownerSelect={
                      <OwnerSelect
                        item={item}
                        reviewers={reviewers}
                        setListOpts={setListOpts}
                        listOpts={listOpts}
                        resource={item}
                        onChangeOwner={changeOwner}
                        loading={loading}
                        showLabel={false}
                      />
                    }
                  />
                </Collapse.Panel>
              ))
            ) : (
              <Collapse.Panel
                showArrow={false}
                key="collapse-pending-no-data"
                header={<div className="row">No data to display</div>}
              />
            )}
          </Collapse>
        </div>
        <div className="pagination-wrapper">
          <Pagination
            defaultCurrent={1}
            onChange={onChangePage}
            current={itemList.page || 1}
            pageSize={itemList.limit || 10}
            total={itemList.count || 0}
            defaultPageSize={itemList.limit || 10}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="admin-view">
      {/* <div className="download-container">
        <p>Download the data</p>
        <Select showSearch style={{ width: 350 }} placeholder="Select data">
          <Select.Option value="demo">Demo</Select.Option>
        </Select>
        <div className="btn-download">
          <Button type="primary">Download as .csv</Button>
        </div>
      </div> */}
      <Tabs
        onChange={(key) => setTab(key)}
        size="large"
        className="profile-tab-menu"
        activeKey={tab}
      >
        <TabPane
          tab="Individuals"
          key="stakeholders"
          className="profile-tab-pane"
        >
          {renderList(stakeholdersListOpts, setStakeholdersListOpts)}
        </TabPane>
        <TabPane tab="Experts" key="experts" className="profile-tab-pane">
          <Expert />
        </TabPane>
        <TabPane tab="Entities" key="entities" className="profile-tab-pane">
          <>
            {renderList(
              entitiesListOpts,
              setEntitiesListOpts,
              'Member Entities'
            )}
            {renderList(
              nonMemberEantitiesListOpts,
              setNonMemberEantitiesListOpts,
              'Non-Member Entities'
            )}
          </>
        </TabPane>
        <TabPane tab="Resources" key="resources" className="profile-tab-pane">
          {renderList(resourcesListOpts, setResourcesListOpts)}
        </TabPane>
        <TabPane tab="Tags" key="tags" className="profile-tab-pane">
          <Form
            name="basic"
            initialValues={{
              remember: true,
            }}
            form={form}
            onFinish={onFinish}
            autoComplete="off"
            className="tag-form"
          >
            <Form.Item
              label="Tag Name"
              name="tag"
              rules={[
                {
                  required: true,
                  message: 'Please input your tag!',
                },
              ]}
            >
              <Input placeholder="Please input your tag!" />
            </Form.Item>
            <Form.Item>
              <Button ghost size="small">
                Submit
              </Button>
            </Form.Item>
          </Form>
          {renderList(tagsListOpts, setTagsListOpts)}
        </TabPane>
        {user_id && (
          <TabPane
            tab="Requests"
            key="privateChat"
            className="profile-tab-pane"
          >
            <div className="private-chat-wrapper">
              <p className="title">Request to Join {channel_name}</p>
              <p>
                <Link href={`/stakeholder/${user_id}`}>{email}</Link> wants to
                join {channel_name}{' '}
                <Button
                  type="ghost"
                  className="black"
                  disabled={requestLoading}
                  onClick={() => handleChatRequest()}
                >
                  {requestButtonText}
                </Button>
              </p>
            </div>
          </TabPane>
        )}
      </Tabs>

      <ModalReject
        visible={modalRejectVisible}
        reject={modalRejectFunction}
        close={() => setModalRejectVisible(false)}
        action={modalRejectAction}
      />
    </div>
  )
}

export { AdminSection, HeaderSearch, HeaderFilter }
