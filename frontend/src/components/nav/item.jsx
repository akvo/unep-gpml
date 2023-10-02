import Link from 'next/link'

const Item = ({ title, subtitle, icon, iconClass, to, href, setShowMenu }) => {
  const contents = (
    <>
      <div className={['icon', iconClass].filter((it) => it != null).join(' ')}>
        {icon}
      </div>
      <div className="content">
        <b className="p-s">{title}</b>
        <span>{subtitle}</span>
      </div>
    </>
  )

  if (to != null) {
    return (
      <Link href={to} legacyBehavior>
        <a>{contents}</a>
      </Link>
    )
  } else if (href != null) {
    return <a href={href}>{contents}</a>
  }

  return (
    <>
      <div className="icon">{icon}</div>
      <div className="content">
        <b className="p-s">{title}</b>
        <span>{subtitle}</span>
      </div>
    </>
  )
}
export default Item
