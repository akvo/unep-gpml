import Link from 'next/link'
import { i18n } from '@lingui/core'

const Item = ({ title, subtitle, icon, iconClass, to, href, setShowMenu }) => {
  const contents = (
    <>
      {icon && (
        <div
          className={['icon', iconClass].filter((it) => it != null).join(' ')}
        >
          {icon}
        </div>
      )}
      <div className={`content ${!icon ? 'ml' : ''}`}>
        <b className="p-s">{i18n._(title)}</b>
        <span>{i18n._(subtitle)}</span>
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
      {icon && <div className="icon">{icon}</div>}
      <div className={`content ${!icon ? 'ml' : ''}`}>
        <b className="p-s">{i18n._(title)}</b>
        <span>{i18n._(subtitle)}</span>
      </div>
    </>
  )
}
export default Item
