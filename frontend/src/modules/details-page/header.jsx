import React, { useState } from 'react'
import './style.module.scss'
import { Col, Popover, Input, Select, Tooltip } from 'antd'
const { Option } = Select
import { eventTrack } from '../../utils/misc'
import {
  EyeFilled,
  HeartTwoTone,
  MailTwoTone,
  PlayCircleTwoTone,
} from '@ant-design/icons'
import { resourceTypeToTopicType, topicNames } from '../../utils/misc'
import { languageOptions } from '../flexible-forms/view'
import classNames from 'classnames'
import Button from '../../components/button'
import {
  BookmarkIcon,
  ArrowRight,
  BookmarkIconProper,
} from '../../components/icons'
import { Trans, t } from '@lingui/macro'

export const HeaderButtons = ({
  data,
  type,
  id,
  handleEditBtn,
  handleDeleteBtn,
  canEdit,
  canDelete,
  relation,
  handleRelationChange,
  visible,
  handleVisible,
  translations,
  selectedLanguage,
  setLanguage,
  bookmark2PS,
  onBookmark2PS,
}) => {
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

  const handleVisibleChange = () => {
    handleVisible()
  }

  return (
    <Col className="tool-buttons">
      {onBookmark2PS != null && (
        <Tooltip
          title={bookmark2PS ? 'Remove from Library' : 'Save to Library'}
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
      <Button
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
      </Button>
      {data?.url && (
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
                  handleVisibleChange()
                }}
              >
                <Trans>Copy</Trans>
              </Button>
            </Input.Group>
          }
          trigger="click"
          visible={visible}
          onVisibleChange={handleVisibleChange}
        >
          <div>
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
                handleVisibleChange()
              }}
            >
              <Trans>Share</Trans>
            </Button>
          </div>
        </Popover>
      )}
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
  )
}

const Header = ({
  data,
  LeftImage,
  profile,
  isAuthenticated,
  type,
  id,
  handleEditBtn,
  handleDeleteBtn,
  allowBookmark,
  visible,
  handleVisible,
  showLess,
  setShowLess,
  placeholder,
  handleRelationChange,
  relation,
  translations,
  selectedLanguage,
  setLanguage,
  bookmark2PS,
  onBookmark2PS,
}) => {
  const toolButtons = (
    data,
    LeftImage,
    profile,
    isAuthenticated,
    type,
    id,
    handleEditBtn,
    handleDeleteBtn,
    allowBookmark,
    visible,
    handleVisible,
    showLess,
    setShowLess,
    placeholder,
    relation,
    handleRelationChange
  ) => {
    const noEditTopics = new Set(['stakeholder'])

    const resourceOwners = data?.stakeholderConnections
      ?.filter((stakeholder) => stakeholder?.role?.toLowerCase() === 'owner')
      .map((stakeholder) => stakeholder?.stakeholderId)

    const find = resourceOwners.includes(profile?.id)

    const canEdit = () =>
      isAuthenticated &&
      profile.reviewStatus === 'APPROVED' &&
      (profile.role === 'ADMIN' ||
        profile.id === params.createdBy ||
        data.owners.includes(profile.id) ||
        find) &&
      ((type !== 'initiative' && !noEditTopics.has(type)) ||
        (type === 'initiative' && id > 10000))

    const canDelete = () =>
      isAuthenticated &&
      ((profile.reviewStatus === 'APPROVED' && profile.role === 'ADMIN') ||
        find)

    return (
      <HeaderButtons
        data={data}
        handleDeleteBtn={handleDeleteBtn}
        canDelete={canDelete}
        topic={{ ...data }}
        type={type}
        id={id}
        handleEditBtn={handleEditBtn}
        canEdit={canEdit}
        relation={relation.relation}
        handleRelationChange={relation.handleRelationChange}
        allowBookmark={allowBookmark}
        visible={visible}
        handleVisible={handleVisible}
        translations={translations}
        selectedLanguage={selectedLanguage}
        setLanguage={setLanguage}
        {...{ bookmark2PS, onBookmark2PS }}
      />
    )
  }

  return (
    <div className="detail-header">
      <h3 className="detail-resource-type content-heading">
        {topicNames(type)}
      </h3>
      <h4 className="detail-resource-title">
        {selectedLanguage ? translations?.title[selectedLanguage] : data?.title}
      </h4>
      {toolButtons(
        data,
        LeftImage,
        profile,
        isAuthenticated,
        type,
        id,
        handleEditBtn,
        handleDeleteBtn,
        allowBookmark,
        visible,
        handleVisible,
        showLess,
        setShowLess,
        placeholder,
        { ...{ handleRelationChange, relation } }
      )}
    </div>
  )
}

export default Header
