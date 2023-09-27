import React from 'react'
import './style.module.scss'
import { Col, Popover, Input, Select } from 'antd'
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
import { ViewIcon, BookmarkIcon } from '../../components/icons'

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
      {data?.url && (
        <Button
          size="small"
          ghost
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
          View Source
          <ViewIcon />
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
          Recording
        </Button>
      )}
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
                style={{ width: '20%' }}
                type="primary"
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
                Copy
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
              Share
            </Button>
          </div>
        </Popover>
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
        {bookmarked ? 'Bookmarked' : 'Bookmark'}
        <BookmarkIcon />
      </Button>
      {canEdit() && (
        <Button
          className="edit-button two-tone-button"
          size="small"
          ghost
          onClick={() => handleEditBtn(type)}
        >
          Edit
        </Button>
      )}
      {canDelete() && (
        <Button
          className="delete-button two-tone-button"
          size="small"
          ghost
          onClick={handleDeleteBtn}
        >
          Delete
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
