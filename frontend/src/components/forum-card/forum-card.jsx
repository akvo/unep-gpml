import React from 'react'
import classNames from 'classnames'
import { Button, Card, Popover } from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import moment from 'moment'
import styles from './style.module.scss'

/**
 * Reusable card component to showing forum information
 * that will be use in some pages, such as: /workspace & /forum
 */
const ForumOptions = ({ visible, onVisibleChange, onView, onLeave }) => (
  <div className="popover-container">
    <Popover
      placement="bottomLeft"
      visible={visible}
      overlayClassName={styles.forumOptions}
      onVisibleChange={onVisibleChange}
      trigger="click"
      content={
        <ul>
          <li>
            <Button type="link" onClick={() => onView(item)}>
              View Details
            </Button>
          </li>
          <li>
            <Button type="link" onClick={() => onLeave(item)}>
              Leave
            </Button>
          </li>
        </ul>
      }
    >
      <MoreOutlined rotate={90} />
    </Popover>
  </div>
)

const ForumLastMessage = ({ lm: updatedAt }) => (
  <div className="last-message">
    <span className={styles.labelClass}>Last message</span>
    <p className="p-m value" suppressHydrationWarning>
      {moment(updatedAt).fromNow()}
    </p>
  </div>
)

const ForumTitle = ({
  name: channelName,
  t: channelType,
  className = null,
}) => (
  <div className={classNames(styles.headingClass, className)}>
    <span className={styles.forumType}>
      {channelType === 'p' ? 'private ' : 'public '}channel
    </span>
    <h5 className={styles.title}>{channelName}</h5>
  </div>
)

const ForumHStack = ({ children, className }) => (
  <div className={classNames(styles.forumClass, className)}>{children}</div>
)

const ForumCard = ({ children, className = null, ...props }) => {
  return (
    <Card className={classNames(styles.forumWrapper)} {...props}>
      {children}
    </Card>
  )
}

ForumCard.Title = ForumTitle
ForumCard.LastMessage = ForumLastMessage
ForumCard.Options = ForumOptions
ForumCard.HStack = ForumHStack

export default ForumCard
