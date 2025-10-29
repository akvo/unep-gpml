import React, { useState } from 'react'
import './style.module.scss'
import { Col, Popover, Input, Select, Tooltip, Modal, notification } from 'antd'
const { Option } = Select
import { eventTrack, useTopicNames } from '../../utils/misc'
import { PlayCircleTwoTone } from '@ant-design/icons'
import { resourceTypeToTopicType } from '../../utils/misc'
import { languageOptions } from '../flexible-forms/view'
import classNames from 'classnames'
import Button from '../../components/button'
import {
  BookmarkIcon,
  ArrowRight,
  BookmarkIconProper,
  badges,
  Like,
} from '../../components/icons'
import { Trans, t } from '@lingui/macro'
import { AssignedBadges } from '../../components/resource-card/resource-card'
import api from '../../utils/api'
import { useRouter } from 'next/router'
import { AdminBadges } from '../community-hub/detail-view'

const Header = ({
  data,
  profile,
  loading,
  isAuthenticated,
  type,
  id,
  handleRelationChange,
  relation,
  translations,
  selectedLanguage,
  setLanguage,
  bookmark2PS,
  onBookmark2PS,
  UIStore,
  likes,
  setLikes,
}) => {
  const router = useRouter()
  const topicNames = useTopicNames()

  const bookmarked =
    relation &&
    relation.association &&
    relation.association.indexOf('interested in') !== -1

  const handleChangeRelation = (relationType) => {
    let association = relation ? [...relation.association] : []
    if (!association.includes(relationType)) {
      association = [relationType]
    } else {
      association = association.filter((it) => it !== relationType)
    }
    handleRelationChange({
      topicId: parseInt(id),
      association,
      topic: resourceTypeToTopicType(type.replace('-', '_')),
    })
  }

  const handleEditBtn = (type = null) => {
    eventTrack('Resource view', 'Update', 'Button')
    let form = null
    let link = null
    switch (type) {
      case 'initiative':
        form = 'initiative'
        link = 'edit/initiative'
        type = 'initiative'
        break
      case 'project':
        form = 'project'
        link = 'edit/project'
        type = 'project'
        break
      case 'data-catalog':
        form = 'data_catalog'
        link = 'edit/data-catalog'
        type = 'data_catalog'
        break
      case 'action-plan':
        form = 'actionPlan'
        link = 'edit/action-plan'
        type = 'action_plan'
        break
      case 'policy':
        form = 'policy'
        link = 'edit/policy'
        type = 'policy'
        break
      case 'technical-resource':
        form = 'technicalResource'
        link = 'edit/technical-resource'
        type = 'technical_resource'
        break
      case 'financing-resource':
        form = 'financingResource'
        link = 'edit/financing-resource'
        type = 'financing_resource'
        break
      case 'technology':
        form = 'technology'
        link = 'edit/technology'
        type = 'technology'
        break
      case 'event':
        form = 'event'
        link = 'edit/event'
        type = 'event'
        break
      case 'case-study':
        form = 'caseStudy'
        link = 'edit/case-study'
        type = 'case_study'
        break
      default:
        form = 'entity'
        link = 'edit/entity'
        type = 'initiative'
        break
    }
    UIStore.update((e) => {
      e.formEdit = {
        ...e.formEdit,
        flexible: {
          status: 'edit',
          id: id,
        },
      }
      e.formStep = {
        ...e.formStep,
        flexible: 1,
      }
    })
    router.push({
      pathname: '/add-content',
      query: {
        type: type,
        id: id,
      },
    })
  }

  const handleDeleteBtn = () => {
    Modal.error({
      className: 'popup-delete',
      centered: true,
      closable: true,
      maskClosable: true,
      icon: true,
      title: t`Are you sure you want to delete this resource?`,
      content: t`Please be aware this action cannot be undone.`,
      okText: t`Delete`,
      okType: 'danger',
      cancelText: t`Cancel`,
      okButtonProps: { size: 'small' },
      onOk() {
        return api
          .delete(`/detail/${type.replace('-', '_')}/${id}`)
          .then((res) => {
            notification.success({
              message: t`Resource deleted successfully`,
            })
          })
          .catch((err) => {
            console.error(err)
            notification.error({
              message: t`Oops, something went wrong`,
            })
          })
      },
    })
  }
  const isLiked = likes?.findIndex((it) => it.id === profile.id) !== -1
  const handleLike = () => {
    if (!isLiked) {
      api.post('/like', {
        topic: data.topic,
        topicId: id,
      })
      setLikes((_likes) => {
        return [..._likes, profile]
      })
    } else {
      api.delete(`/like/${data.topic}/${id}`)
      setLikes((_likes) => {
        return _likes.filter((it) => it.id !== profile.id)
      })
    }
  }

  const noEditTopics = new Set(['stakeholder'])

  const resourceOwners = data?.stakeholderConnections
    ?.filter((stakeholder) => stakeholder?.role?.toLowerCase() === 'owner')
    .map((stakeholder) => stakeholder?.stakeholderId)

  const find = resourceOwners?.includes(profile?.id)
  const canEdit = () =>
    isAuthenticated &&
    profile.reviewStatus === 'APPROVED' &&
    (profile.role === 'ADMIN' || data?.owners?.includes(profile.id) || find) &&
    ((type !== 'initiative' && !noEditTopics.has(type)) ||
      (type === 'initiative' && id > 10000))

  const canDelete = () =>
    isAuthenticated &&
    ((profile.reviewStatus === 'APPROVED' && profile.role === 'ADMIN') || find)

  const isAdmin = profile?.role === 'ADMIN'
  return (
    <div className="detail-header">
      <h3 className="detail-resource-type content-heading">
        {topicNames(type)}
      </h3>
      <h4 className="detail-resource-title">
        {selectedLanguage ? translations?.title[selectedLanguage] : data?.title}
      </h4>
      {data && !loading && !isAdmin && (
        <div className="meta">
          <AssignedBadges
            assignedBadges={data?.assignedBadges}
            isAdmin={isAdmin}
          />
        </div>
      )}
      {isAdmin && !loading && data && (
        <AdminBadges badgeOpts={['resource-verified']} data={data} />
      )}

      <Col className="tool-buttons">
        {onBookmark2PS != null && (
          <Tooltip
            title={bookmark2PS ? t`Remove from Library` : t`Save to Library`}
          >
            <Button
              size="small"
              type="primary"
              className={classNames('bookmark-to-ps', {
                bookmarked: bookmark2PS,
              })}
              onClick={() => {
                onBookmark2PS(data, !bookmark2PS)
              }}
            >
              <BookmarkIconProper />
            </Button>
          </Tooltip>
        )}
        {data?.url && (
          <Button
            size="small"
            className="view-button"
            onClick={(e) => {
              e.preventDefault()
              eventTrack('Resource view', 'View Url', 'Button')
              window.open(
                `${
                  data?.url && data?.url?.includes('https://')
                    ? data?.url
                    : data?.languages
                    ? data?.languages[0]?.url
                    : data?.url?.includes('http://')
                    ? data?.url
                    : 'https://' + data?.url
                }`,
                '_blank'
              )
            }}
          >
            <Trans>View Source</Trans>
            <ArrowRight />
          </Button>
        )}
        {isAuthenticated && (
          <Button
            ghost
            onClick={handleLike}
            className={classNames('like-btn', { isLiked })}
          >
            {isLiked ? 'Liked' : 'Like'}
            <Like />
          </Button>
        )}
        {data?.recording && (
          <Button
            className="recording-button two-tone-button"
            icon={<PlayCircleTwoTone twoToneColor="#09689a" />}
            size="small"
            ghost
            onClick={() => {
              window.open(
                data?.recording.includes('https://')
                  ? data?.recording
                  : 'https://' + data?.recording,
                '_blank'
              )
            }}
          >
            <Trans>Recording</Trans>
          </Button>
        )}
        {/* <Button
          className={classNames('bookmark-button two-tone-button', {
            bookmarked,
          })}
          size="small"
          ghost
          onClick={() => {
            eventTrack('Resource view', 'Bookmark', 'Button')
            handleChangeRelation('interested in')
          }}
        >
          {bookmarked ? t`Bookmarked` : t`Bookmark`}
          <BookmarkIcon />
        </Button> */}
        <ShareBtn data={data} />
        {canEdit() && (
          <Button
            className="edit-button two-tone-button"
            size="small"
            ghost
            onClick={() => handleEditBtn(type)}
          >
            <Trans>Edit</Trans>
          </Button>
        )}
        {canDelete() && (
          <Button
            className="delete-button two-tone-button"
            size="small"
            ghost
            onClick={handleDeleteBtn}
          >
            <Trans>Delete</Trans>
          </Button>
        )}
        {translations && translations.hasOwnProperty('title') && (
          <div className="language-select">
            <Select
              defaultValue={'en'}
              placeholder="Select language"
              onChange={(v) => {
                if (v === 'en') setLanguage('')
                else setLanguage(v)
              }}
              dropdownClassName="language-select-menu"
            >
              {['en']
                .concat(Object.keys(translations.title))
                .filter((item) => item !== selectedLanguage)
                .map((lang) => (
                  <Select.Option value={lang}>
                    <span>
                      {
                        languageOptions?.find((item) => item.dbValue === lang)
                          ?.value
                      }
                    </span>
                  </Select.Option>
                ))}
            </Select>
          </div>
        )}
      </Col>
    </div>
  )
}

const ShareBtn = ({ data }) => {
  const [visible, setVisible] = useState(false)
  if (data?.url) {
    return (
      <Popover
        placement="top"
        overlayStyle={{
          width: '22vw',
        }}
        overlayClassName="popover-share"
        content={
          <Input.Group compact>
            <Input
              size="small"
              style={{ width: 'calc(100% - 20%)' }}
              defaultValue={`${
                data?.url && data?.url?.includes('https://')
                  ? data?.url
                  : data?.languages
                  ? data?.languages[0]?.url
                  : data?.url && data?.url?.includes('http://')
                  ? data?.url
                  : data?.url
                  ? 'https://' + data?.url
                  : 'https://'
              }`}
              disabled
            />
            <Button
              size="small"
              disabled={!data?.url}
              onClick={() => {
                navigator.clipboard.writeText(
                  data?.url && data?.url?.includes('https://')
                    ? data?.languages
                      ? data?.languages[0]?.url
                      : data?.url
                    : 'https://' + data?.url
                )
                setVisible(false)
              }}
            >
              <Trans>Copy</Trans>
            </Button>
          </Input.Group>
        }
        trigger="click"
        visible={visible}
        onVisibleChange={() => {
          setVisible(!visible)
        }}
      >
        <Button
          className="share-button two-tone-button"
          ghost
          size="small"
          onClick={() => {
            navigator.clipboard.writeText(
              data?.url && data?.url?.includes('https://')
                ? data?.languages
                  ? data?.languages[0]?.url
                  : data?.url
                : 'https://' + data?.url
            )
            eventTrack('Resource view', 'Share', 'Button')
          }}
        >
          <Trans>Share</Trans>
        </Button>
      </Popover>
    )
  }
  return null
}

export default Header
