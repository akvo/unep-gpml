import React, { useState } from "react";
import classNames from "classnames";
import styles from "./style.module.scss";

const VerticalTabs = ({ children, defaultKey = 1 }) => {
  const [activeKey, setActiveKey] = useState(defaultKey);

  const tabsChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      if (child.type.name === "Items") {
        return React.cloneElement(child, {
          activeKey,
          setActiveKey,
        });
      }
      if (child.type.name === "Content") {
        const keyProp = child?.props?.tabKey || index;
        const visible = activeKey === keyProp;
        return React.cloneElement(child, {
          indexKey: index,
          visible,
        });
      }
    }
    return child;
  });
  return <div className={styles.container}>{tabsChildren}</div>;
};

const Items = ({ children, activeKey, setActiveKey, className = null }) => {
  const itemsChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      if (child.type.name === "Item") {
        const indexKey = index + 1;
        return React.cloneElement(child, {
          activeKey,
          indexKey,
          onClick: (param) => setActiveKey(param || index),
        });
      }
    }
    return child;
  });
  return (
    <ul className={classNames(styles.items, className)}>{itemsChildren}</ul>
  );
};

const Item = ({
  children,
  activeKey,
  indexKey,
  tabKey,
  onClick,
  className = null,
}) => {
  const keyValue = tabKey || indexKey;
  const activeClass = activeKey === keyValue ? styles.activeItem : null;
  return (
    <li
      className={classNames(styles.item, activeClass, className)}
      onClick={() => onClick(keyValue)}
      key={keyValue}
      aria-label="vtabs-item"
    >
      {children}
    </li>
  );
};

const Content = ({
  children,
  indexKey,
  tabKey,
  className = null,
  visible = true,
}) => {
  const isVisible = visible ? styles.show : styles.hidden;
  const keyValue = tabKey || indexKey;
  return (
    <div
      className={classNames(styles.content, isVisible, className)}
      tabkey={keyValue}
    >
      {children}
    </div>
  );
};

VerticalTabs.Items = Items;
VerticalTabs.Item = Item;
VerticalTabs.Content = Content;

export default VerticalTabs;
