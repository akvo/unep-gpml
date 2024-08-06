import resourceCardStyle from '../resource-card/style.module.scss'

const StakeholderCard = ({ item }) => {
  const title =
    item.type === 'stakeholder'
      ? `${item.firstName} ${item.lastName}`
      : item.name
  return (
    <div className={resourceCardStyle.resourceCard}>
      <div className="type caps-heading-xs">
        {item?.type?.replace(/_/g, ' ')}
      </div>
      <h4 className="h-xs">{title}</h4>
    </div>
  )
}

export default StakeholderCard
