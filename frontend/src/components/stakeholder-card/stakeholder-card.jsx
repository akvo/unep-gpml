import classNames from 'classnames'
import resourceCardStyle from '../resource-card/style.module.scss'
import Image from 'next/image'
import styles from './style.module.scss'
import { badges } from '../icons'
import { Tooltip } from 'antd'

export const badgeTitles = {
  'org-verified': 'Verified',
  'user-verified': 'Verified',
  'org-partner-verified': 'Verified Partner',
  'user-focal-point-verified': 'Verified Focal Point',
  'resource-verified': 'Verified Resource',
}

const StakeholderCard = ({ item, className }) => {
  const title =
    item.type === 'stakeholder' && item.name == null
      ? `${item.firstName} ${item.lastName}`
      : item.name
  const stakeholderType =
    item.type === 'stakeholder' ? 'individual' : 'organisation'

  const subtitle = item.jobTitle || item.about
  const assignedBadges = (
    <span className="badges">
      {item?.assignedBadges?.map((it) => (
        <Tooltip title={badgeTitles[it.badgeName]}>
          <span className={`badge ${it.badgeName}`}>{badges.verified}</span>
        </Tooltip>
      ))}
    </span>
  )
  return (
    <a href={`/${item.type}/${item.id}`} target="_blank">
      <div
        className={classNames([
          resourceCardStyle.resourceCard,
          className,
          resourceCardStyle.withImage,
          styles.stakeholderCard,
          styles[stakeholderType],
        ])}
      >
        <div className="type caps-heading-xs">{stakeholderType}</div>
        <h4 className="h-xs">
          <span>{title}</span>
          {stakeholderType === 'organisation' && assignedBadges}
        </h4>
        {stakeholderType === 'individual' && assignedBadges}
        {subtitle && (
          <h5>
            {subtitle}{' '}
            {item.affiliation && (
              <>
                @ <span>{item.affiliation.name}</span>
              </>
            )}
          </h5>
        )}
        {item?.picture != null && (
          <Image
            className={stakeholderType}
            src={item?.picture}
            width={195}
            height={175}
          />
        )}
      </div>
    </a>
  )
}

export default StakeholderCard
