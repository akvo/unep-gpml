import classNames from 'classnames'
import Image from 'next/image'
import styles from './style.module.scss'
import { BookmarkIconProper, Like, badges } from '../icons'
import { useState } from 'react'
import { Dropdown, Menu, Skeleton, Tooltip } from 'antd'
import { t } from '@lingui/macro'
import { getBaseUrl } from '../../utils/misc'

const baseUrl = getBaseUrl()

const ResourceCard = ({ item, bookmarked, onBookmark, onClick }) => {
  const types = [
    { name: t`Project`, value: 'project' },
    { name: t`Technical Resource`, value: 'technical_resource' },
    { name: t`Technology`, value: 'technology' },
    { name: t`Action Plan`, value: 'action_plan' },
    { name: t`Legislation`, value: 'policy' },
    { name: t`Financing Resource`, value: 'financing_resource' },
    { name: t`Case Study`, value: 'case_study' },
    { name: t`Initiative`, value: 'initiative' },
    { name: t`Event`, value: 'event' },
    { name: t`Data Portal`, value: 'data_catalog' },
  ]
  // /resources returns the files under `images`; /browse (used in the
  // Action Planning Tool) returns the same list under `files`
  const images = item?.images || item?.files
  const withImage = images?.length > 0 || images?.thumbnail
  const handleClick = (e) => {
    onClick({ e, item })
  }
  const hasMeta = item?.incBadges?.length > 0 || item?.likes > 0

  return (
    <div
      className={classNames(styles.resourceCard, 'resource-card', {
        [styles.withImage]: withImage,
      })}
      onClick={handleClick}
    >
      <div className="type caps-heading-xs">
        {types.find((it) => it.value === item?.type)?.name}
      </div>
      {onBookmark != null && (
        <BookmarkBtn {...{ bookmarked, onBookmark, item }} />
      )}
      {item.title && (
        <h4 className={classNames('h-xs', { hasMeta })}>{item.title}</h4>
      )}
      {hasMeta && (
        <div className="meta">
          {item.likes > 0 && (
            <div className="likes">
              <Like /> <span>{item.likes}</span>
            </div>
          )}
          {item?.incBadges && (
            <AssignedBadges assignedBadges={item?.incBadges} />
          )}
        </div>
      )}
      {images?.length > 0 && (
        <Image
          src={`${baseUrl}/img400/${images?.[0].objectKey}`}
          width={195}
          height={175}
          alt="thumbnail"
        />
      )}
      {images?.thumbnail && (
        <Image
          src={images?.medium?.url || images?.thumbnail.url}
          width={195}
          height={175}
          alt="thumbnail"
        />
      )}
    </div>
  )
}
export const ResourceCardSkeleton = () => {
  return (
    <div className={styles.resourceCard}>
      <Skeleton active loading />
    </div>
  )
}
export const AssignedBadges = ({ assignedBadges }) => {
  return (
    <>
      {assignedBadges?.map((badge) => (
        <div className="badge-container">
          <div
            className={classNames('badge', {
              gov: badge.badgeName !== 'resource-verified',
            })}
          >
            {badges.verified}
          </div>
          <span>
            {badge.badgeName === 'resource-verified'
              ? t`GPML Verified`
              : t`Government Verified`}
          </span>
        </div>
      ))}
    </>
  )
}
const BookmarkBtn = ({ bookmarked, onBookmark, item }) => {
  const handleClick = (e) => {
    e.stopPropagation()
    onBookmark(item, !bookmarked)
  }
  return (
    <Tooltip title={bookmarked ? t`Remove from Library` : t`Save to Library`}>
      <div
        className={classNames(styles.bookmarkBtn, {
          [styles.bookmarked]: bookmarked,
        })}
        onClick={handleClick}
      >
        <BookmarkIconProper />
      </div>
    </Tooltip>
  )
}

export default ResourceCard
