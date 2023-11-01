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
import axios from 'axios'
import { deepTranslate } from '../utils/misc'

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const MENU_MAPPING = [
          {
            key: msg`About Us`,
            id: 'About Us',
            subKeys: [
              {
                key: msg`The platform`,
                id: 'The platform',
                apiEndpoint:
                  'https://unep-gpml.akvotest.org/strapi/api/pages?locale=all&filters[section][$eq]=about-platform&fields=title&fields=subtitle&fields=slug',
              },
              {
                key: msg`Our Network`,
                id: 'Our Network',
                apiEndpoint:
                  'https://unep-gpml.akvotest.org/strapi/api/pages?locale=all&filters[section][$eq]=about-network&fields=title&fields=subtitle&fields=slug',
              },
            ],
          },
          {
            key: msg`Plastic`,
            id: 'Plastic',
            subKeys: [
              {
                key: msg`Topics`,
                id: 'Topics',
                apiEndpoint:
                  'https://unep-gpml.akvotest.org/strapi/api/pages?locale=all&filters[section][$eq]=plastic-topics&fields=title&fields=subtitle&fields=slug',
              },
              {
                key: msg`Basics`,
                id: 'Basics',
                apiEndpoint:
                  'https://unep-gpml.akvotest.org/strapi/api/pages?locale=all&filters[section][$eq]=plastic-basics&fields=title&fields=subtitle&fields=slug',
              },
            ],
          },
        ]

        const fetchData = async () => {
          const apiEndpoints = MENU_MAPPING.flatMap((section) =>
            section.subKeys.map((sub) => sub.apiEndpoint)
          )

          try {
            const responses = await Promise.all(
              apiEndpoints.map((endpoint) => axios.get(endpoint))
            )
            return responses
          } catch (error) {
            console.error('Error fetching data:', error)
            return []
          }
        }

        fetchData().then((responses) => {
          UIStore.update((s) => {
            const menu = deepTranslate([...s.menuList])
            let updatedMenu = menu

            MENU_MAPPING.forEach((section, sectionIdx) => {
              section.subKeys.forEach((sub, subIdx) => {
                const responseData =
                  responses[sectionIdx * section.subKeys.length + subIdx]?.data
                    ?.data
                if (responseData) {
                  updatedMenu = updateMenuSection(
                    updatedMenu,
                    section.id,
                    sub.id,
                    responseData
                  )
                }
              })
            })
            s.menuList = updatedMenu
          })
        })
      } catch (err) {
        console.log(err)
      }
    }

    fetchData()
  }, [])

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
          <div className={`${isIndexPage ? 'container' : 'container-fluid'}`}>
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
              <ul className="ant-menu">
                {menuList.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => {
                      if (item.id === openedItemKey) {
                        setOpenedItemKey(null)
                        setShowMenu(false)
                      } else {
                        setOpenedItemKey(item.id)
                        setShowMenu(true)
                      }
                    }}
                    className={`${openedItemKey === item.id ? 'selected' : ''}`}
                  >
                    <a>
                      <span>{i18n._(item.key)}</span>
                      <DownArrow />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <nav>
              {!isAuthenticated && (
                <Button
                  type="primary"
                  size="small"
                  className="noicon hide-mobile"
                  onClick={() => setLoginVisible(true)}
                >
                  Join Now
                </Button>
              )}
              {isAuthenticated && (
                <>
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
                              router.push(router.pathname, router.pathname, {
                                locale: lang.key.toLowerCase(),
                              })
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
                      <DownArrow />
                    </div>
                  </Dropdown>
                  <Link href="/workspace">
                    <Button
                      type="primary"
                      size="small"
                      className="noicon hide-mobile"
                    >
                      Workspace
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
                              pathname: `/${
                                isRegistered(profile) ? 'profile' : 'onboarding'
                              }`,
                            })
                          }}
                        >
                          <Trans>Profile</Trans>
                        </Menu.Item>
                        <Menu.Item
                          key="logout"
                          onClick={() => {
                            auth0Client.logout({
                              returnTo: window.location.origin,
                            })
                          }}
                        >
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
              {width <= 768 && (
                <div className="toggle-button">
                  <MenuToggle toggle={() => toggleOpen()} isOpen={isOpen} />
                </div>
              )}
            </nav>
          </div>
        </div>
        <div className="navigation">
          <NavMobile {...{ isOpen, toggleOpen }} />

          <NavDesktop
            isOpen={showMenu}
            contentKey={openedItemKey}
            toggle={() => {
              setShowMenu(!showMenu)
              setOpenedItemKey(null)
            }}
          />
        </div>
        {children}
        {router.pathname !== '/workspace/[slug]' && (
          <Footer
            showTools={() => {
              if (openedItemKey === 'Tools') {
                setOpenedItemKey(null)
                setShowMenu(false)
              } else {
                setOpenedItemKey('Tools')
                setShowMenu(true)
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
