import classNames from 'classnames'
import Image from 'next/image'
import styles from './style.module.scss'
import { BookmarkIcon } from '../icons'
import { useState } from 'react'
import { Tooltip } from 'antd'

const ResourceCard = ({ item, bookmarked, onBookmark, onClick }) => {
  const withImage = item.image != null
  const handleClick = (e) => {
    onClick({ e, type: item.type, id: item.id })
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
        <div className="tag">{item?.type?.replace(/_/g, ' ')}</div>
      </div>
    </div>
  )
}
const BookmarkBtn = ({ bookmarked, onBookmark, item }) => {
  const [on, setOn] = useState(bookmarked)
  const handleClick = (e) => {
    e.stopPropagation()
    setOn((_on) => {
      onBookmark(item, !_on)
      return !_on
    })
  }
  return (
    <Tooltip title={on ? 'Remove from Library' : 'Save to Library'}>
      <div
        className={classNames(styles.bookmarkBtn, {
          [styles.bookmarked]: on,
        })}
        onClick={handleClick}
      >
        <BookmarkIcon />
      </div>
    </Tooltip>
  )
}

export default ResourceCard
