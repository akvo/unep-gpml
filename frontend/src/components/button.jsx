import { Button as AntButton } from 'antd'
import { CirclePointer, ArrowRight, LongArrowRight } from './icons'

const Button = ({ withArrow, children, ...props }) => {
  let arrowIcon = null
  if (withArrow) {
    if (props.type === 'primary') arrowIcon = <CirclePointer />
    else if (props.type === 'link') arrowIcon = <ArrowRight />
    else arrowIcon = <LongArrowRight />
  }
  return (
    <AntButton {...props}>
      {children}
      {withArrow && ' '}
      {arrowIcon}
    </AntButton>
  )
}

export default Button
