import React from "react";
import classNames from "classnames";
import styles from "./style.module.scss";

const VerticalTabs = ({ children }) => {
  return <div className={styles.container}>{children}</div>;
};

const Items = ({ children, className = null }) => {
  return <ul className={classNames(styles.items, className)}>{children}</ul>;
};

const Item = ({ children, key, className = null }) => {
  return (
    <li className={classNames(styles.item, className)} key={key}>
      {children}
    </li>
  );
};

const Content = ({ children, className = null }) => {
  return (
    <div className={classNames(styles.content, className)}>{children}</div>
  );
};

VerticalTabs.Items = Items;
VerticalTabs.Item = Item;
VerticalTabs.Content = Content;

export default VerticalTabs;
