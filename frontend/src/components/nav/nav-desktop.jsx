import React from 'react'
import { Col, Row } from 'antd'
import { UIStore } from '../../store'
import { CloseIcon } from '../icons'
import { motion, AnimatePresence } from 'framer-motion'
import Item from './item'
import { useLingui } from '@lingui/react'
import { deepTranslate } from '../../utils/misc'
import Button from '../button'
import { i18n } from '@lingui/core'

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

const ToolsMenu = ({ toggle }) => {
  const { menuList } = UIStore.useState((s) => ({
    menuList: s.menuList,
  }))

  const menu = deepTranslate(menuList)

  return (
    <div className="container sub-menu">
      <Row gutter={[168, 168]}>
        {menu
          .find((it) => it.id === 'Tools')
          .children?.map((menu) => (
            <Col span={8} key={menu.key}>
              <motion.p
                className="p-m"
                custom={0}
                variants={menuItemVariants}
                initial="closed"
                animate="open"
                exit="closed"
              >
                {i18n._(menu.key)}
              </motion.p>
              <ul>
                {menu?.children?.map((child, i) => (
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

const PlasticMenu = ({ toggle }) => {
  const { menuList } = UIStore.useState((s) => ({
    menuList: s.menuList,
  }))

  const menu = deepTranslate(menuList)

  return (
    <div className="container sub-menu">
      <Row gutter={[168, 168]}>
        {menu
          .find((it) => it.id === 'Plastic')
          .children?.map((menu, index) => (
            <Col span={index === 0 ? 16 : 8} key={menu.key}>
              <motion.p
                className="p-m block"
                custom={0}
                variants={menuItemVariants}
                initial="closed"
                animate="open"
                exit="closed"
              >
                {i18n._(menu.key)}
              </motion.p>
              <ul>
                {menu?.children?.map((child, i) => (
                  <motion.li
                    onClick={toggle}
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

const AboutUsMenu = ({ toggle }) => {
  const { menuList } = UIStore.useState((s) => ({
    menuList: s.menuList,
  }))

  const menu = deepTranslate(menuList)

  return (
    <div className="container sub-menu">
      <Row gutter={[168, 168]}>
        {menu
          .find((it) => it.id === 'About Us')
          .children?.filter((t) => t.type !== 'button')
          .map((menu) => (
            <Col span={8} key={menu?.id}>
              <motion.p
                className="p-m"
                custom={0}
                variants={menuItemVariants}
                initial="closed"
                animate="open"
                exit="closed"
              >
                {i18n._(menu.key)}
              </motion.p>
              <ul>
                {menu?.children?.map((child, i) => (
                  <motion.li
                    key={child.title}
                    custom={i + 1}
                    variants={menuItemVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    className="sub-menu-item"
                    onClick={toggle}
                  >
                    <Item {...child} />
                  </motion.li>
                ))}
              </ul>
            </Col>
          ))}
        <Col span={8}>
          <motion.div
            custom={0}
            key={0}
            variants={menuItemVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <a href="https://gpmarinelitter.org" target="_blank">
              <Button type="primary" size="small" className="noicon">
                Go to GPML
              </Button>
            </a>
          </motion.div>
          <motion.div
            custom={1}
            key={1}
            variants={menuItemVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <a href="mailto:unep-gpmarinelitter@un.org">
              <Button ghost size="small" className="contact-button">
                Contact Us
              </Button>
            </a>
          </motion.div>
        </Col>
      </Row>
    </div>
  )
}

const NavDesktop = ({ isOpen, toggle, contentKey }) => {
  let ContentComponent

  switch (contentKey) {
    case 'Tools':
      ContentComponent = () => <ToolsMenu toggle={toggle} />
      break
    case 'About Us':
      ContentComponent = () => <AboutUsMenu toggle={toggle} />
      break
    case 'Plastic':
      ContentComponent = () => <PlasticMenu toggle={toggle} />
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
          <button className="cancel" onClick={toggle}>
            <CloseIcon />
          </button>
          <ContentComponent />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NavDesktop
