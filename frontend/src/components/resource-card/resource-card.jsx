import classNames from 'classnames'
import Image from 'next/image'
import styles from './style.module.scss'
import { BookmarkIconProper, Like, badges } from '../icons'
import { useState } from 'react'
import { Tooltip } from 'antd'
import { t } from '@lingui/macro'
import { getBaseUrl } from '../../utils/misc'

const baseUrl = getBaseUrl()

const ResourceCard = ({ item, bookmarked, onBookmark, onClick }) => {
  const withImage = item?.images?.length > 0
  const handleClick = (e) => {
    onClick({ e, item })
  }
  const hasMeta = item.incBadges.length > 0 || item?.likes > 0
  return (
    <div
      className={classNames(styles.resourceCard, 'resource-card', {
        [styles.withImage]: withImage,
      })}
      onClick={handleClick}
    >
      <div className="type caps-heading-xs">
        {item?.type?.replace(/_/g, ' ')}
      </div>
      {onBookmark != null && (
        <BookmarkBtn {...{ bookmarked, onBookmark, item }} />
      )}
      <h4 className={classNames('h-xs', { hasMeta })}>{item.title}</h4>
      {hasMeta && (
        <div className="meta">
          {item.likes > 0 && (
            <div className="likes">
              <Like /> <span>{item.likes}</span>
            </div>
          )}
          <AssignedBadges assignedBadges={item.incBadges} />
        </div>
      )}
      {withImage && (
        <Image
          src={`${baseUrl}/img400/${item?.images?.[0].objectKey}`}
          width={195}
          height={175}
        />
      )}
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
