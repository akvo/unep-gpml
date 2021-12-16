import React from "react";
import Icon from "./Icon";
import { Button as AntButton } from "antd";

export default function Button({
  primary,
  label,
  className,
  rounded,
  onClick,
  icon,
  hideText,
  children,
  ...props
}) {
  return (
    <AntButton type="button" onClick={onClick} title={label} {...props}>
      {children}
      {icon && (
        <Icon name={icon} className={`text-sm h-4 ${!hideText && "pr-3"}`} />
      )}
      {!hideText && label}
    </AntButton>
  );
}
