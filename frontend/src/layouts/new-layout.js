import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { isEmpty } from 'lodash'
import { Avatar, Button, Dropdown, Menu } from 'antd'
import localFont from 'next/font/local'
import { DM_Sans } from 'next/font/google'
import { UIStore } from '../store'
import classNames from 'classnames'
import Footer from '../components/footer/Footer'
import Login from '../modules/login/view'
import { Check, DownArrow, World, flags } from '../components/icons'
import Link from 'next/link'
import { Trans, t, msg } from '@lingui/macro'
import { useCycle } from 'framer-motion'
import { useDeviceSize } from '../modules/landing/landing'
import { isRegistered } from '../utils/profile'
import { i18n } from '@lingui/core'
import { MenuToggle, NavMobile, NavDesktop } from '../components/nav'
import GpmlCircle from '../components/gpml-circle'
import { changeLanguage } from '../translations/utils'

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

const NewLayout = ({
  children,
  isIndexPage,
  isAuthenticated,
  auth0Client,
  profile,
  loginVisible,
  setLoginVisible,
}) => {
  const router = useRouter()
  const { menuList } = UIStore.useState((s) => ({
    menuList: s.menuList,
  }))
  const [openedItemKey, setOpenedItemKey] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const [width] = useDeviceSize()
  const [isOpen, toggleOpen] = useCycle(false, true)

  const handleOnLogoutRC = () => {
    try {
      const iFrame = document.querySelector('iframe')
      iFrame.contentWindow.postMessage(
        {
          externalCommand: 'logout',
        },
        '*'
      )
    } catch (error) {
      console.error('client error RC iframe', error)
    }
  }

  const handleOnLogout = () => {
    handleOnLogoutRC()
    localStorage.removeItem('idToken')
    localStorage.removeItem('expiresAt')
    auth0Client.logout({
      returnTo: window.location.origin,
    })
  }

  const handleClick = (item) => {
    if (item.to) {
      router.push(item.to)
    } else if (item.href) {
      router.push(item.href)
    }
  }

  return (
    <>
      <style jsx global>{`
        :root {
          --font-dm-sans: ${dmSans.style.fontFamily};
          --font-archia: ${archia.style.fontFamily};
        }
      `}</style>
      <div>
        <div
          className={classNames('top-bar', { opened: openedItemKey != null })}
          style={{
            zIndex: isOpen ? 9 : 99,
            position: openedItemKey ? 'sticky' : 'relative',
          }}
        >
          <div className="container-fluid">
            <Link href="/">
              <div className="logo-container">
                <div className="circle">
                  <GpmlCircle />
                </div>
                <h5>
                  Global Partnership
                  <br />
                  on Plastic Pollution
                  <br />
                  and Marine Litter
                </h5>
              </div>
            </Link>
            {width >= 768 && (
              <Menu mode="horizontal" className="ant-menu">
                {menuList.map((item) => (
                  <Menu.SubMenu
                    key={item.id}
                    title={
                      <span>
                        {i18n._(item.key)} <DownArrow />
                      </span>
                    }
                  >
                    {item.children.map((child) => (
                      <Menu.Item
                        onClick={() => handleClick(child)}
                        className="nav-menu-item"
                        key={child.id}
                      >
                        {i18n._(child.key)}
                      </Menu.Item>
                    ))}
                  </Menu.SubMenu>
                ))}
              </Menu>
            )}
            <nav>
              <Dropdown
                overlayClassName="lang-dropdown-wrapper"
                overlay={
                  <Menu className="lang-dropdown">
                    {[
                      { key: 'EN', label: 'English' },
                      { key: 'FR', label: 'French' },
                      { key: 'ES', label: 'Spanish' },
                    ].map((lang) => (
                      <Menu.Item
                        className={classNames({
                          active: lang.key.toLowerCase() === router.locale,
                        })}
                        key={lang.key}
                        onClick={() => {
                          console.log(
                            lang.key.toLowerCase(),
                            'lang.key.toLowerCase()'
                          )
                          changeLanguage(lang.key.toLowerCase(), router)
                        }}
                      >
                        {flags[lang.key]}
                        {lang.label}
                        {lang.key.toLowerCase() === router.locale && (
                          <div className="check">
                            <Check />
                          </div>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu>
                }
                trigger={['click']}
                placement="bottomRight"
              >
                <div className="lang-btn">
                  <World />
                  <span>{router.locale}</span>
                  <DownArrow />
                </div>
              </Dropdown>
              {!isAuthenticated && (
                <Button
                  type="primary"
                  size="small"
                  className="noicon hide-mobile"
                  onClick={() => setLoginVisible(true)}
                >
                  <Trans>Join Now</Trans>
                </Button>
              )}
              {isAuthenticated && (
                <>
                  <Link href="/workspace">
                    <Button
                      type="primary"
                      size="small"
                      className="noicon hide-mobile"
                    >
                      <Trans>Workspace</Trans>
                    </Button>
                  </Link>
                  <Dropdown
                    overlayClassName="user-btn-dropdown-wrapper"
                    overlay={
                      <Menu className="user-btn-dropdown">
                        <Menu.Item key="add-content">
                          <Link href="/flexible-forms">
                            <span>
                              <Trans>Add Content</Trans>
                            </span>
                          </Link>
                        </Menu.Item>
                        <Menu.Item
                          key="profile"
                          onClick={() => {
                            router.push({
                              pathname: `/${'profile'}`,
                            })
                          }}
                        >
                          <Trans>Profile</Trans>
                        </Menu.Item>
                        <Menu.Item key="logout" onClick={handleOnLogout}>
                          <Trans>Logout</Trans>
                        </Menu.Item>
                      </Menu>
                    }
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Avatar size="large">
                      {profile?.firstName?.charAt(0)}
                      {profile?.lastName?.charAt(0)}
                    </Avatar>
                  </Dropdown>
                </>
              )}
              <div className="toggle-button">
                <MenuToggle toggle={() => toggleOpen()} isOpen={isOpen} />
              </div>
            </nav>
          </div>
        </div>
        <div className="navigation">
          <NavMobile {...{ isOpen, toggleOpen, handleClick }} />

          {/* <NavDesktop
            isOpen={showMenu}
            contentKey={openedItemKey}
            toggle={() => {
              setShowMenu(false)
              setOpenedItemKey(null)
            }}
          /> */}
        </div>
        {children}
        {!router.pathname.includes('/workspace/[slug]') && (
          <Footer
            showTools={() => {
              if (width >= 768) {
                if (openedItemKey === 'Tools') {
                  setOpenedItemKey(null)
                  setShowMenu(false)
                } else {
                  setOpenedItemKey('Tools')
                  setShowMenu(true)
                }
              } else {
                toggleOpen()
              }
            }}
          />
        )}
      </div>
      <Login visible={loginVisible} close={() => setLoginVisible(false)} />
    </>
  )
}

const initName = (name) =>
  name
    ?.split(/[ ,]+/)
    ?.slice(0, 2)
    .map((w) => w?.slice(0, 1))

export const withNewLayout = (Component) => {
  const WithLayoutComponent = (props) => {
    const router = useRouter()
    const isIndexPage =
      router.pathname === '/' || router.pathname === '/landing'
    const {
      isAuthenticated,
      auth0Client,
      profile,
      loginVisible,
      setLoginVisible,
    } = props

    return (
      <NewLayout
        {...{
          isIndexPage,
          isAuthenticated,
          setLoginVisible,
          auth0Client,
          profile,
          loginVisible,
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

const transformedData = (data) => {
  return data?.map((item) => ({
    title: item.attributes.title,
    subtitle: item.attributes.subtitle,
    to: `/page/${item.attributes.slug}`,
  }))
}

const updateMenuSection = (menu, sectionKey, subKey, data) => {
  const sectionIndex = menu.findIndex((item) => item.id === sectionKey)
  if (sectionIndex !== -1) {
    const section = menu[sectionIndex]
    const subIndex = section.children.findIndex((item) => item.id === subKey)
    if (subIndex !== -1) {
      section.children[subIndex].children = transformedData(data)
      menu[sectionIndex] = section
    }
  }
  return menu
}

export default NewLayout
