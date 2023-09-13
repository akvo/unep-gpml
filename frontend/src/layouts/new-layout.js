import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { isEmpty } from 'lodash'
import { Button, Col, Row } from 'antd'
import localFont from 'next/font/local'
import { DM_Sans } from 'next/font/google'
import Image from 'next/image'
import Footer from '../footer'
import Login from '../modules/login/view'
import { DownArrow, CloseIcon, MenuIcon } from '../components/icons'
import Link from 'next/link'
import { motion, AnimatePresence, useCycle } from 'framer-motion'
import { useDeviceSize } from '../modules/landing/landing'
import { MenuToggle } from './MenuToggle'
import { Navigation } from './Navigation'
import { UIStore } from '../store'

const navVariants = {
  open: { scale: 1, opacity: 1 },
  closed: { scale: 0.95, opacity: 0 },
}

const menuItemVariants = {
  open: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2 + i * 0.1,
      duration: 0.6,
      ease: [0.42, 0, 0.58, 1],
    },
  }),
  closed: {
    opacity: 0,
    y: 50,
    transition: {
      duration: 0.5,
      ease: 'anticipate',
    },
  },
}

export const Item = ({
  title,
  subtitle,
  icon,
  iconClass,
  to,
  href,
  setShowMenu,
}) => {
  const contents = (
    <>
      <div className={['icon', iconClass].filter((it) => it != null).join(' ')}>
        {icon}
      </div>
      <div className="content">
        <b className="p-s">{title}</b>
        <span>{subtitle}</span>
      </div>
    </>
  )

  if (to != null) {
    return (
      <Link href={to} legacyBehavior>
        <a>{contents}</a>
      </Link>
    )
  } else if (href != null) {
    return <a href={href}>{contents}</a>
  }

  return (
    <>
      <div className="icon">{icon}</div>
      <div className="content">
        <b className="p-s">{title}</b>
        <span>{subtitle}</span>
      </div>
    </>
  )
}

const ToolsMenu = () => {
  const { menuList } = UIStore.useState((s) => ({
    menuList: s.menuList,
  }))
  return (
    <div className="container sub-menu">
      <Row gutter={[168, 168]}>
        {menuList
          .find((item) => item.key === 'Tools')
          ?.children.map((menu) => (
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

const FullscreenNav = ({ isOpen, toggle, contentKey }) => {
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
          transition={{ duration: 0.5 }}
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

const archia = localFont({
  src: [
    {
      path: '../../public/fonts/archia-thin-webfont.woff2',
      weight: '200',
    },
    {
      path: '../../public/fonts/archia-light-webfont.woff2',
      weight: '300',
    },
    {
      path: '../../public/fonts/archia-regular-webfont.woff2',
      weight: '400',
    },
    {
      path: '../../public/fonts/archia-medium-webfont.woff2',
      weight: '500',
    },
    {
      path: '../../public/fonts/archia-semibold-webfont.woff2',
      weight: '600',
    },
    {
      path: '../../public/fonts/archia-bold-webfont.woff2',
      weight: '700',
    },
  ],
})
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '700'],
})

const menuItems = ['Plastic', 'Tools', 'Countries', 'About'].map((key) => ({
  key,
  label: key,
}))

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

const NewLayout = ({
  children,
  isIndexPage,
  isAuthenticated,
  auth0Client,
  profile,
}) => {
  const [loginVisible, setLoginVisible] = useState(false)
  const [hoveredItemKey, setHoveredItemKey] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const [width] = useDeviceSize()
  const [isOpen, toggleOpen] = useCycle(false, true)

  return (
    <>
      <style jsx global>{`
        :root {
          --font-dm-sans: ${dmSans.style.fontFamily};
          --font-archia: ${archia.style.fontFamily};
        }
      `}</style>
      <div className="">
        <div
          className="top-bar"
          style={{
            zIndex: isOpen ? 9 : 99,
          }}
        >
          <div className="container">
            <div className="logo-container">
              <Image
                className="gpml-white"
                src="/GPML-White-logo.svg"
                alt="GPML Digital Platform"
                width={244}
                height={74}
              />
            </div>
            {width >= 768 && (
              <ul
                className="ant-menu"
                // onMouseLeave={() => {
                //   setHoveredItemKey(null)
                //   setShowMenu(false)
                // }}
              >
                {menuItems.map((item) => (
                  <li
                    key={item.key}
                    onMouseEnter={() => {
                      setHoveredItemKey(item.label)
                      setShowMenu(true)
                    }}
                    className={`${
                      hoveredItemKey === item.label ? 'selected' : ''
                    }`}
                  >
                    <Link href={'/'} legacyBehavior>
                      <a>
                        {item.label}
                        <span>
                          <DownArrow />
                        </span>
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <nav>
              <Button type="primary" size="small" className="noicon">
                Join Now
              </Button>
              {width <= 768 && (
                <div className="toggle-button">
                  <MenuToggle toggle={() => toggleOpen()} isOpen={isOpen} />
                </div>
              )}
            </nav>
          </div>
        </div>
        <div className="navigation">
          <AnimatePresence>
            <motion.div
              initial="closed"
              animate={isOpen ? 'open' : 'closed'}
              exit="exit"
              className="animation-container"
            >
              <motion.div
                className="mobile-menu-background"
                variants={sidebar}
              />
              <Navigation isOpen={isOpen} toggleOpen={toggleOpen} />
            </motion.div>
          </AnimatePresence>

          <FullscreenNav
            isOpen={showMenu}
            contentKey={hoveredItemKey}
            toggle={() => {
              setShowMenu(!showMenu)
              setHoveredItemKey(null)
            }}
          />
        </div>
        {children}
      </div>
    </>
  )
}

export const withNewLayout = (Component) => {
  const WithLayoutComponent = (props) => {
    const router = useRouter()
    const isIndexPage = router.pathname === '/'
    const { isAuthenticated, auth0Client, profile, setLoginVisible } = props

    return (
      <NewLayout
        {...{
          isIndexPage,
          isAuthenticated,
          setLoginVisible,
          auth0Client,
          profile,
        }}
      >
        <Component {...props} />
      </NewLayout>
    )
  }

  if (!isEmpty(Component.getStaticProps)) {
    WithLayoutComponent.getStaticProps = async (ctx) => {
      const componentStaticProps = await Component.getStaticProps(ctx)
      return {
        props: {
          ...componentStaticProps.props,
        },
      }
    }
  }

  if (Component.getInitialProps) {
    WithLayoutComponent.getInitialProps = Component.getInitialProps
  }

  return WithLayoutComponent
}

export default NewLayout
