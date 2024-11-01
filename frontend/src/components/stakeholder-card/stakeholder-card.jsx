import classNames from 'classnames'
import resourceCardStyle from '../resource-card/style.module.scss'
import Image from 'next/image'
import styles from './style.module.scss'

const StakeholderCard = ({ item, className }) => {
  const title =
    item.type === 'stakeholder' && item.name == null
      ? `${item.firstName} ${item.lastName}`
      : item.name
  const stakeholderType =
    item.type === 'stakeholder' ? 'individual' : 'organisation'

  const subtitle = item.jobTitle || item.about
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
        <div className="type caps-heading-xs">
          {item?.type?.replace(/_/g, ' ')}
        </div>
        <h4 className="h-xs">{title}</h4>
        {subtitle && <h5>{subtitle}</h5>}
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
