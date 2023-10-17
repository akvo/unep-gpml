import classNames from 'classnames'
import Image from 'next/image'
import styles from './style.module.scss'

const ResourceCard = ({ item }) => {
  const withImage = item.image != null
  let inner
  if (withImage) {
    inner = (
      <>
        <Image src={item.image} width={190} height={250} />
      </>
    )
  }
  return (
    <div className={classNames(styles.resourceCard, { withImage })}>
      {inner}
      <div className="tags">
        <div className="tag">{item.type}</div>
      </div>
    </div>
  )
}

export default ResourceCard
