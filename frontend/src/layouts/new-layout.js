import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { isEmpty } from 'lodash'
import { Button, Menu } from 'antd'
import localFont from 'next/font/local'
import { DM_Sans } from 'next/font/google'
import Image from 'next/image'
import Footer from '../footer'
import Login from '../modules/login/view'
import { DownArrow, CloseIcon } from '../components/icons'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const navVariants = {
  open: { scale: 1, opacity: 1 },
  closed: { scale: 0.95, opacity: 0 },
}

const menuItemVariants = {
  open: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.5 + i * 0.1,
    },
  }),
  closed: { opacity: 0, y: 50 },
}
const FullscreenNav = ({ isOpen, toggle }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="closed"
          animate="open"
          exit="closed"
          variants={navVariants}
          transition={{ duration: 0.5, type: 'spring', stiffness: 75 }}
          className="fullscreen-nav"
        >
          <button
            onClick={toggle}
            style={{ position: 'absolute', top: 20, right: 20 }}
          >
            <CloseIcon />
          </button>
          <ul>
            {menuItems.map((item, i) => (
              <motion.li
                key={item.key}
                variants={menuItemVariants}
                custom={i}
                initial="closed"
                animate="open"
                exit="closed"
              >
                <Link href={'/'} legacyBehavior>
                  <a>
                    {item.label}
                    <span>
                      <DownArrow />
                    </span>
                  </a>
                </Link>
              </motion.li>
            ))}
          </ul>
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

const NewLayout = ({
  children,
  isIndexPage,
  isAuthenticated,
  auth0Client,
  profile,
}) => {
  const [loginVisible, setLoginVisible] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [hoveredItemKey, setHoveredItemKey] = useState(null)

  return (
    <>
      <style jsx global>{`
        :root {
          --font-dm-sans: ${dmSans.style.fontFamily};
          --font-archia: ${archia.style.fontFamily};
        }
      `}</style>
      <div>
        <div className="top-bar">
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
            <ul className="ant-menu">
              {menuItems.map((item) => (
                <li
                  key={item.key}
                  onMouseEnter={() => setHoveredItemKey(item.key)}
                  onMouseLeave={() => setHoveredItemKey(null)}
                >
                  <Link href={'/'} legacyBehavior>
                    <a>
                      {item.label}
                      <span>
                        <DownArrow />
                      </span>
                    </a>
                  </Link>
                  {hoveredItemKey === item.key && (
                    <FullscreenNav
                      isOpen={true}
                      toggle={() => setHoveredItemKey(null)}
                    />
                  )}
                </li>
              ))}
            </ul>
            <nav>
              <Button
                type="primary"
                size="small"
                className="noicon"
                onClick={() => setShowMenu(true)}
              >
                Join Now
              </Button>
            </nav>
          </div>
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
