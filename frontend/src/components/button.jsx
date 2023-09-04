import { Button as AntButton } from 'antd'
import { CirclePointer, ArrowRight, LongArrowRight } from './icons'
import classNames from 'classnames'

const Button = ({ withArrow, children, className, ...props }) => {
  let arrowIcon = null
  if (withArrow) {
    if (props.type === 'primary') arrowIcon = <CirclePointer />
    else if (props.type === 'link') arrowIcon = <ArrowRight />
    else arrowIcon = <LongArrowRight />
  }
  return (
    <AntButton {...props} className={classNames(className, { withArrow })}>
      {children}
      {withArrow && ' '}
      {arrowIcon}
    </AntButton>
  )
}

export default Button
