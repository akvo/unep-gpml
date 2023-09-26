import { Button as AntButton } from 'antd'
import { CirclePointer, ArrowRight } from './icons'
import classNames from 'classnames'

const Button = ({ withArrow, back, children, className, ...props }) => {
  let arrowIcon = null
  let backIcon = null
  if (withArrow && !back) {
    if (props.type === 'primary') arrowIcon = <CirclePointer />
    else if (props.type === 'link') arrowIcon = <ArrowRight />
    else arrowIcon = withArrow
  }
  if (back) {
    if (props.type === 'primary') backIcon = <CirclePointer />
    else if (props.type === 'link') backIcon = <ArrowRight />
    else backIcon = withArrow
  }
  return (
    <AntButton
      {...props}
      className={classNames(className, { withArrow, back })}
    >
      {backIcon}
      {children}
      {withArrow && ' '}
      {arrowIcon}
    </AntButton>
  )
}

export default Button
