import classNames from 'classnames'
import Image from 'next/image'
import styles from './style.module.scss'
import { BookmarkIconProper, badges } from '../icons'
import { useState } from 'react'
import { Tooltip } from 'antd'
import { t } from '@lingui/macro'

const ResourceCard = ({ item, bookmarked, onBookmark, onClick }) => {
  const withImage = item.image != null
  const handleClick = (e) => {
    onClick({ e, item })
  }
  let inner
  if (withImage) {
    inner = (
      <>
        <Image src={item.image} width={190} height={250} />
      </>
    )
  } else {
    inner = (
      <>
        <h4 className="h-xs w-bold">{item.title}</h4>
      </>
    )
  }
  return (
    <div
      className={classNames(styles.resourceCard, {
        [styles.withImage]: withImage,
      })}
      onClick={handleClick}
    >
      {inner}
      {onBookmark != null && (
        <BookmarkBtn {...{ bookmarked, onBookmark, item }} />
      )}
      <div className="tags">
        {item.assignedBadges?.map((badge) => (
          <Tooltip
            title={
              badge.badgeName === 'resource-verified'
                ? 'GPML Verified'
                : 'Government Verified'
            }
          >
            <div className="badge">{badges.verified}</div>
          </Tooltip>
        ))}
        <div className="tag">{item?.type?.replace(/_/g, ' ')}</div>
      </div>
    </div>
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
