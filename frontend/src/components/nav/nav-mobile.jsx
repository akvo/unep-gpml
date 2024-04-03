import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MenuToggle } from './menu-toggle'
import { CirclePointer, DownArrow, LinkedinIcon, YoutubeIcon } from '../icons'
import { UIStore } from '../../store'
import { deepTranslate } from '../../utils/misc'
import Button from '../button'
import { Menu } from 'antd'
import { i18n } from '@lingui/core'

const SOCIAL_LINKS = [
  {
    Icon: LinkedinIcon,
    url: 'https://ke.linkedin.com/company/global-partnership-on-marine-litter',
  },
  {
    Icon: YoutubeIcon,
    url: 'https://www.youtube.com/channel/UCoWXFwDeoD4c9GoXzFdm9Bg',
  },
]

const socialLinksVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.5,
      duration: 0.4,
    },
  },
  closed: {
    opacity: 0,
    y: 50,
  },
}

const sidebar = {
  open: (height = 1000) => ({
    clipPath: `circle(${height * 2 + 200}px at 100% 0%)`,
    transition: {
      type: 'tween',
      duration: 0.5,
      ease: 'easeInOut',
    },
  }),
  closed: {
    clipPath: 'circle(0px at 100% 0px)',
    transition: {
      type: 'tween',
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
  exit: {
    clipPath: 'circle(0px at 100% 0px)',
    transition: {
      type: 'tween',
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
}

const NavMobile = ({ isOpen, toggleOpen, handleClick }) => {
  const [selectedMenuItem, setSelectedMenuItem] = useState(null)
  const { menuList } = UIStore.useState((s) => ({ menuList: s.menuList }))

  const menu = deepTranslate(menuList)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="closed"
          animate={isOpen ? 'open' : 'closed'}
          exit="exit"
          className="animation-container"
        >
          <motion.div className="mobile-menu-background" variants={sidebar} />
          <AnimatePresence mode="wait">
            {isOpen && <MainMenuContent key="main-menu" />}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )

  function MainMenuContent() {
    return (
      <>
        <MenuHeader />
        <div className="navigation-container" style={{ height: '100%' }}>
          <MainMenuItems />
          <motion.div
            className="social-links-container"
            variants={socialLinksVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <h6>Follow Us</h6>
            <ul className="social-links">
              {SOCIAL_LINKS.map(({ Icon, url }) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <Icon />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </>
    )
  }

  function MenuHeader() {
    return (
      <div
        className="toggle-button"
        style={selectedMenuItem ? {} : { justifyContent: 'flex-end' }}
      >
        {selectedMenuItem && (
          <Button onClick={() => setSelectedMenuItem(null)}>
            <CirclePointer />
            Back
          </Button>
        )}
        <MenuToggle toggle={handleToggle} isOpen={isOpen} />
      </div>
    )
  }

  function MainMenuItems() {
    return (
      <Menu mode="inline" className="ant-menu">
        {menu.map((item) => (
          <Menu.SubMenu
            key={item.id}
            title={
              <span>
                {i18n._(item.key)} <DownArrow />
              </span>
            }
            popupOffset={100}
          >
            {item.children.map((child) => (
              <Menu.Item
                onClick={() => handleClick(child)}
                className="nav-menu-item"
                key={child.id}
              >
                {i18n._(child.id)}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        ))}
      </Menu>
    )
  }

  function handleToggle() {
    toggleOpen()
    setSelectedMenuItem(null)
  }
}

export default NavMobile
