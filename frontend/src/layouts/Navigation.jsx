import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MenuItem } from './MenuItem'
import { MenuToggle } from './MenuToggle'
import {
  CirclePointer,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
} from '../components/icons'
import { Button } from 'antd'
import { UIStore } from '../store'

const SOCIAL_LINKS = [
  { icon: FacebookIcon, url: 'https://facebook.com/' },
  { icon: TwitterIcon, url: 'http://twitter.com/' },
  { icon: LinkedinIcon, url: 'https://linkedin.com/' },
]

const menuVariants = {
  open: {
    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
}

const contentVariants = {
  enter: {
    x: '100%',
    opacity: 0,
  },
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'tween', duration: 0.3 },
      opacity: { duration: 0.3 },
    },
  },
  exit: {
    x: '100%',
    opacity: 1,
    transition: {
      x: { type: 'tween', duration: 0.3 },
      opacity: { duration: 0.3 },
    },
  },
}

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

export const Navigation = ({ isOpen, toggleOpen }) => {
  const [selectedMenuItem, setSelectedMenuItem] = useState(null)
  const { menuList } = UIStore.useState((s) => ({ menuList: s.menuList }))

  const handleMenuItemClick = (item) => setSelectedMenuItem(item)

  return (
    <AnimatePresence mode="wait">
      {selectedMenuItem ? (
        <SubMenuContent key="sub-menu" />
      ) : (
        isOpen && <MainMenuContent key="main-menu" />
      )}
    </AnimatePresence>
  )

  function SubMenuContent() {
    return (
      <motion.div
        key="screenKey"
        variants={contentVariants}
        initial="enter"
        animate="center"
        exit="exit"
        className="slide-menu"
      >
        <MenuHeader />
        <div className="navigation-container">
          <h2>{selectedMenuItem}</h2>
          <SubMenuItems />
        </div>
      </motion.div>
    )
  }

  function MainMenuContent() {
    return (
      <>
        <MenuHeader />
        <div className="navigation-container" style={{ height: '100%' }}>
          <MainMenuItems />
          <SocialLinks />
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
      <motion.ul
        key="menuList"
        variants={menuVariants}
        initial="closed"
        animate="open"
        exit="closed"
      >
        {menuList.map((i) => (
          <MenuItem key={i.key} i={i.key} onClick={handleMenuItemClick} />
        ))}
      </motion.ul>
    )
  }

  function SubMenuItems() {
    const items =
      menuList.find((item) => selectedMenuItem === item.key)?.children || []
    return (
      <motion.ul
        key="menuList"
        variants={menuVariants}
        initial="closed"
        animate="open"
        exit="closed"
      >
        {items.map((i) => (
          <MenuItem key={i.key} i={i.key} item={i} collapseMenu />
        ))}
      </motion.ul>
    )
  }

  function SocialLinks() {
    return (
      <motion.div
        className="social-links-container"
        variants={socialLinksVariants}
        initial="closed"
        animate="open"
        exit="closed"
      >
        <h6>Follow Us</h6>
        <ul className="social-links">
          {SOCIAL_LINKS.map(({ icon: Icon, url }) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Icon />
              </a>
            </li>
          ))}
        </ul>
      </motion.div>
    )
  }

  function handleToggle() {
    toggleOpen()
    setSelectedMenuItem(null)
  }
}
