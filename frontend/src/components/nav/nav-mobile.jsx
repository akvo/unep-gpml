import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MenuItem } from './menu-item'
import { MenuToggle } from './menu-toggle'
import { CirclePointer, LinkedinIcon, YoutubeIcon } from '../icons'
import { Button } from 'antd'
import { UIStore } from '../../store'

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

const NavMobile = ({ isOpen, toggleOpen }) => {
  const [selectedMenuItem, setSelectedMenuItem] = useState(null)
  const { menuList } = UIStore.useState((s) => ({ menuList: s.menuList }))

  const handleMenuItemClick = (item) => setSelectedMenuItem(item)

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
            {selectedMenuItem ? (
              <SubMenuContent key="sub-menu" />
            ) : (
              isOpen && <MainMenuContent key="main-menu" />
            )}
          </AnimatePresence>
        </motion.div>
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

  function handleToggle() {
    toggleOpen()
    setSelectedMenuItem(null)
  }
}

export default NavMobile
