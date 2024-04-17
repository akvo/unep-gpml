import React, { useState, useRef, useEffect } from 'react'
import { Button, notification, Avatar, Menu, Row, Col } from 'antd'
import { UIStore } from '../../store'
import { userRoles as roles } from '../../utils/misc'
import { UserOutlined, DiffOutlined, SettingOutlined } from '@ant-design/icons'
import StickyBox from 'react-sticky-box'
import {
  fetchSubmissionData,
  fetchReviewItems,
  fetchStakeholders,
} from '../../modules/profile/utils'
import { useRouter } from 'next/router'
import { useAuth0 } from '@auth0/auth0-react'
import styles from '../../modules/profile/styles.module.scss'
import api from '../../utils/api'
import { isEqual, isEmpty } from 'lodash'
import { Trans, t } from '@lingui/macro'
const userRoles = new Set(roles)
const reviewerRoles = new Set(['REVIEWER', 'ADMIN'])
const adminRoles = new Set(['ADMIN'])
import { useLingui } from '@lingui/react'

function getChangedFields(original, updated) {
  let changes = {}

  Object.keys(updated).forEach((key) => {
    if (!isEqual(original[key], updated[key])) {
      changes[key] = updated[key]
    }
  })

  return changes
}

export const useMenuItems = () => {
  const { i18n } = useLingui()

  const menuItems = [
    {
      key: 'personal-details',
      name: i18n._(t`Personal Details`),
      role: userRoles,
      icon: <UserOutlined />,
    },
    {
      key: 'review-section',
      name: i18n._(t`Review Section`),
      role: reviewerRoles,
      icon: <DiffOutlined />,
    },
    {
      key: 'admin-section',
      name: i18n._(t`Admin Section`),
      role: adminRoles,
      icon: <SettingOutlined />,
    },
    {
      key: 'profil-section',
      name: i18n._(t`Profile Quick Link`),
      role: userRoles,
      icon: <UserOutlined />,
    },
  ]

  return menuItems
}

function ProfileLayout({ children }) {
  const { isAuthenticated, loginWithPopup } = useAuth0()
  const router = useRouter()
  const path = router.pathname

  const pathname = {
    personalDetails: '/profile',
    favourites: '/profile/my-favourites',
    network: '/profile/my-network',
    reviewSection: '/profile/review-section',
    adminSection: '/profile/admin-section',
  }

  const activeMenu = () => {
    if (path === pathname.favourites) {
      return 'my-favourites'
    } else if (path === pathname.network) {
      return 'my-network'
    } else if (path === pathname.reviewSection) {
      return 'review-section'
    } else if (path === pathname.adminSection) {
      return 'admin-section'
    } else {
      return 'personal-details'
    }
  }

  const {
    countries,
    tags,
    regionOptions,
    meaOptions,
    organisations,
    profile,
  } = UIStore.useState((s) => ({
    countries: s.countries,
    tags: s.tags,
    regionOptions: s.regionOptions,
    meaOptions: s.meaOptions,
    organisations: s.organisations,
    profile: s.profile,
  }))
  const isLoaded = () =>
    Boolean(
      countries.length &&
        !isEmpty(tags) &&
        regionOptions.length &&
        meaOptions.length &&
        organisations.length &&
        !isEmpty(profile)
    )

  const handleSubmitRef = useRef()
  const [saving, setSaving] = useState(false)
  const [menu, setMenu] = useState(activeMenu())

  const [reviewItems, setReviewItems] = useState({
    reviews: [],
    limit: 10,
    page: 1,
    count: 0,
    pages: 0,
  })
  const [reviewedItems, setReviewedItems] = useState({
    reviews: [],
    limit: 10,
    page: 1,
    count: 0,
    pages: 0,
  })
  const [stakeholdersData, setStakeholdersData] = useState({
    stakeholders: [],
    limit: 10,
    page: 1,
    count: 0,
    pages: 0,
  })
  const [resourcesData, setResourcesData] = useState({
    stakeholders: [],
    limit: 10,
    page: 1,
    count: 0,
    pages: 0,
  })
  const [tagsData, setTagsData] = useState({
    stakeholders: [],
    limit: 10,
    page: 1,
    count: 0,
    pages: 0,
  })
  const [entitiesData, setEntitiesData] = useState({
    stakeholders: [],
    limit: 10,
    page: 1,
    count: 0,
    pages: 0,
  })
  const [nonMemberEntitiesData, setNonMemberEntitiesData] = useState({
    stakeholders: [],
    limit: 10,
    page: 1,
    count: 0,
    pages: 0,
  })

  const menuItems = useMenuItems()

  useEffect(() => {
    UIStore.update((e) => {
      e.disclaimer = null
    })

    // show login prompt
    if (isEmpty(profile) && !isAuthenticated) {
      loginWithPopup()
      return
    }

    if (adminRoles.has(profile?.role)) {
      ;(async () => {
        const { page, limit } = stakeholdersData
        const data = await fetchSubmissionData(
          page,
          limit,
          'stakeholders',
          'SUBMITTED'
        )
        setStakeholdersData(data)
      })()
      ;(async () => {
        const { page, limit } = resourcesData
        const data = await fetchSubmissionData(
          page,
          limit,
          'resources',
          'SUBMITTED'
        )
        setResourcesData(data)
      })()
      ;(async () => {
        const { page, limit } = resourcesData
        const data = await fetchSubmissionData(page, limit, 'tags', 'SUBMITTED')
        setTagsData(data)
      })()
      ;(async () => {
        const { page, limit } = resourcesData
        const data = await fetchSubmissionData(
          page,
          limit,
          'entities',
          'SUBMITTED'
        )
        setEntitiesData(data)
      })()
      ;(async () => {
        const { page, limit } = resourcesData
        const data = await fetchSubmissionData(
          page,
          limit,
          'non-member-entities',
          'SUBMITTED'
        )
        setNonMemberEntitiesData(data)
      })()
    }
    if (reviewerRoles.has(profile?.role)) {
      ;(async () => {
        setReviewItems(await fetchReviewItems(reviewItems, 'PENDING'))
      })()
      ;(async () => {
        setReviewedItems(
          await fetchReviewItems(reviewedItems, 'ACCEPTED,REJECTED')
        )
      })()
    }
    // NOTE: Ignore the linter warning, because adding
    // dependency other than profile makes the FE send
    // multiple requests to the backend.
  }, [profile]) // eslint-disable-line

  const onSubmit = (vals) => {
    setSaving(true)
    if (!vals?.publicEmail) {
      vals = { ...vals, publicEmail: false }
    }
    if (
      (vals.geoCoverageType === 'national' ||
        vals.geoCoverageType === 'sub-national') &&
      !Array.isArray(vals.geoCoverageValue)
    ) {
      vals.geoCoverageValue = [vals.geoCoverageValue]
    }
    if (vals.geoCoverageType === 'global') {
      vals.geoCoverageValue = null
    }
    if (
      vals?.org &&
      vals.org?.id === -1 &&
      (vals.org.geoCoverageType === 'national' ||
        vals.org.geoCoverageType === 'sub-national') &&
      !Array.isArray(vals.org.geoCoverageValue)
    ) {
      vals.org.geoCoverageValue = [vals.org.geoCoverageValue]
    }
    if (
      vals?.org &&
      vals.org?.id === -1 &&
      vals.org.geoCoverageType === 'global'
    ) {
      vals.org.geoCoverageValue = null
    }

    vals.seeking = vals.seeking?.map((item) => item.toString())
    vals.offering = vals.offering?.map((item) => item.toString())

    const changes = getChangedFields(profile, vals)
    if (changes && Object.keys(changes).length > 0)
      api
        .put('/profile', changes)
        .then(() => {
          let data = {
            ...vals,
          }
          UIStore.update((e) => {
            e.profile = data
          })
          notification.success({ message: 'Profile updated' })
          setSaving(false)
        })
        .catch(() => {
          notification.error({ message: 'An error occured' })
          setSaving(false)
        })
  }

  const handleOnClickMenu = (menuKey) => {
    router.push(getMenuRoute(menuKey))
    setMenu(menuKey)
  }

  const getMenuRoute = (menuKey) => {
    switch (menuKey) {
      case 'my-favourites':
        return '/profile/my-favourites'
        break
      case 'my-network':
        return '/profile/my-network'
        break
      case 'review-section':
        return '/profile/review-section'
        break
      case 'admin-section':
        return '/profile/admin-section'
        break
      default:
        return '/profile'
        break
    }
  }

  const renderMenuItem = (profile) => {
    const menus = menuItems.filter((it) => it.role.has(profile?.role))
    const renderMenuText = (name, count = false) => {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span>{name}</span>
          {count !== false && (
            <Button
              style={{
                position: 'absolute',
                right: '1rem',
              }}
              size="small"
            >
              {count}
            </Button>
          )}
        </div>
      )
    }
    return menus.map((it) => {
      let menuText = ''
      switch (it.key) {
        case 'my-favourites':
          menuText = renderMenuText(it.name, relations.length)
          break
        case 'my-network':
          menuText = renderMenuText(it.name, 0)
          break
        case 'review-section':
          menuText = renderMenuText(it.name, reviewItems.count)
          break
        case 'admin-section':
          menuText = renderMenuText(
            it.name,
            stakeholdersData.count + resourcesData.count + entitiesData.count
          )
          break
        default:
          menuText = renderMenuText(it.name)
          break
      }
      return (
        <>
          <Menu.Item
            key={it.key}
            className="menu-item"
            icon={
              <Button
                type="ghost"
                className="white"
                shape="circle"
                icon={it.icon}
              />
            }
            onClick={() =>
              it.key !== 'profil-section'
                ? handleOnClickMenu(it.key)
                : router.push(`/stakeholder/${profile.id}`)
            }
          >
            {menuText}
          </Menu.Item>
        </>
      )
    })
  }

  const profilePic = profile?.picture?.includes('googleusercontent.com')
    ? profile?.picture.replace(
        /(s\d+\-c)/g,
        window.screen.width > 640 ? `s${window.screen.height}-c` : `s640-c`
      )
    : profile?.picture

  const additionalProps = {
    profile: profile,
    onSubmit: onSubmit,
    handleSubmitRef: handleSubmitRef,
    saving: saving,
    reviewerRoles: reviewerRoles,
    reviewItems: reviewItems,
    setReviewItems: setReviewItems,
    reviewedItems: reviewedItems,
    setReviewedItems: setReviewedItems,
    stakeholdersData: stakeholdersData,
    setStakeholdersData: setStakeholdersData,
    resourcesData: resourcesData,
    setResourcesData: setResourcesData,
    entitiesData: entitiesData,
    nonMemberEntitiesData: nonMemberEntitiesData,
    setEntitiesData: setEntitiesData,
    setNonMemberEntitiesData: setNonMemberEntitiesData,
    tagsData: tagsData,
    setTagsData: setTagsData,
    adminRoles: adminRoles,
  }

  return (
    <div id="profile" className={styles.profile}>
      <div className="profile-container">
        <div className="ui container">
          <Row className="menu-container profile-wrapper">
            <Col xs={24} sm={24} md={7} lg={6} className="menu-wrapper">
              <StickyBox
                offsetTop={20}
                offsetBottom={40}
                style={{ marginBottom: '3rem' }}
              >
                {menu === 'personal-details' && (
                  <div className="photo">
                    <Avatar
                      src={profilePic}
                      size={{
                        xs: 24,
                        sm: 125,
                        md: 50,
                        lg: 64,
                        xl: 125,
                        xxl: 200,
                      }}
                      style={{
                        fontSize: '62px',
                        fontWeight: 'bold',
                      }}
                    >
                      {profile?.firstName?.substring(0, 1)}
                    </Avatar>
                  </div>
                )}
                <Menu
                  className="menu-content-wrapper"
                  defaultSelectedKeys={menu}
                >
                  {renderMenuItem(profile)}
                </Menu>
              </StickyBox>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={17}
              lg={18}
              className={menu !== 'admin-section' ? 'content-wrapper' : ''}
            >
              {children &&
                React.isValidElement(children) &&
                React.cloneElement(children, additionalProps)}
            </Col>
          </Row>
        </div>
      </div>
    </div>
  )
}

export default ProfileLayout
