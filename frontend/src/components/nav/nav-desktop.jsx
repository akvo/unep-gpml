import React from 'react'
import { Col, Row } from 'antd'
import { UIStore } from '../../store'
import { CloseIcon } from '../icons'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Item from './item'
import { useLingui } from '@lingui/react'
import { deepTranslate } from '../../utils/misc'

const navVariants = {
  open: { scale: 1, opacity: 1 },
  closed: { scale: 0.95, opacity: 0 },
}

const menuItemVariants = {
  open: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.03,
      duration: 0.45,
      ease: [0.42, 0, 0.58, 1],
    },
  }),
  closed: {
    opacity: 0,
    y: 50,
    transition: {
      duration: 0.4,
      ease: 'anticipate',
    },
  },
}

const ToolsMenu = () => {
  const { i18n } = useLingui()

  const { menuList } = UIStore.useState((s) => ({
    menuList: s.menuList,
  }))

  const menu = deepTranslate(menuList)

  return (
    <div className="container sub-menu">
      <Row gutter={[168, 168]}>
        {menu
          .find((it) => it.key === 'Tools')
          .children.map((menu) => (
            <Col span={8} key={menu.key}>
              <motion.p
                className="p-m"
                custom={0}
                variants={menuItemVariants}
                initial="closed"
                animate="open"
                exit="closed"
              >
                {menu.key}
              </motion.p>
              <ul>
                {menu?.children.map((child, i) => (
                  <motion.li
                    key={child.title}
                    custom={i + 1}
                    variants={menuItemVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    className="sub-menu-item"
                  >
                    <Item {...child} />
                  </motion.li>
                ))}
              </ul>
            </Col>
          ))}
      </Row>
    </div>
  )
}

const NavDesktop = ({ isOpen, toggle, contentKey }) => {
  let ContentComponent

  switch (contentKey) {
    case 'Tools':
      ContentComponent = ToolsMenu
      break
    default:
      ContentComponent = () => <div>Select a menu item...</div>
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="closed"
          animate="open"
          exit="closed"
          variants={navVariants}
          transition={{ duration: 0.25 }}
          className="fullscreen-nav"
        >
          <button onClick={toggle}>
            <CloseIcon />
          </button>
          <ContentComponent />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NavDesktop
