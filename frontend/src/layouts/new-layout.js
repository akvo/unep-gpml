import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { isEmpty } from 'lodash'
import { Button } from 'antd'
import localFont from 'next/font/local'
import { DM_Sans } from 'next/font/google'
import Image from 'next/image'
import Footer from '../footer'
import Login from '../modules/login/view'
import { DownArrow } from '../components/icons'
import Link from 'next/link'
import { motion, AnimatePresence, useCycle } from 'framer-motion'
import { useDeviceSize } from '../modules/landing/landing'
import { MenuToggle } from './MenuToggle'
import { Navigation } from './Navigation'
import { FullscreenNav } from './FullScreenNavigation'

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
