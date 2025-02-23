import React from 'react'
import styles from './stakeholder.module.scss'
import { Card, Avatar } from 'antd'
import Link from 'next/link'
import { UIStore } from '../../store'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation } from 'swiper'

import { randomColor } from '../../utils/misc'
import LocationIcon from '../../images/location.svg'
import CircledUserIcon from '../../images/stakeholder-overview/union-outlined.svg'
import { useDeviceSize } from '../landing/landing'
import { Trans } from '@lingui/macro'

const colour = () => randomColor[Math.floor(Math.random() * randomColor.length)]

const StakeholderCarousel = ({ stakeholders }) => {
  const [width] = useDeviceSize()
  const { countries } = UIStore.useState((s) => ({
    countries: s.countries,
    organisations: s.organisations,
    landing: s.landing,
  }))

  console.log(stakeholders)

  return (
    <div className={`${styles.connectionWrapper} connection-wrapper`}>
      <Swiper
        spaceBetween={0}
        slidesPerGroup={width > 1024 ? 5 : 1}
        slidesPerView={'auto'}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Pagination, Navigation]}
        className="connection-carousel"
      >
        {stakeholders
          .filter((x) => x.stakeholderRole !== 'ADMIN')
          .map((stakeholder) => {
            const country = countries.find(
              (country) => country.id === stakeholder?.country
            )?.name

            const name = stakeholder?.name?.split(' ')
            const firstInitial = name[0]?.substring(0, 1) || ''
            const secondInitial = name[1]?.substring(0, 1) || ''
            const initial = `${firstInitial}${secondInitial}`

            return (
              <SwiperSlide key={stakeholder?.name}>
                <Link
                  href={
                    stakeholder?.type === 'entity'
                      ? `/organisation/${stakeholder?.entityId}`
                      : `/stakeholder/${stakeholder?.stakeholderId}`
                  }
                  legacyBehavior
                >
                  <a>
                    <Card
                      className="connection-card"
                      key={stakeholder?.stakeholderId}
                    >
                      <div
                        className={`connection-image-wrapper ${
                          !stakeholder?.image && 'connection-no-image-wrapper'
                        }`}
                      >
                        <Avatar
                          className="connection-image"
                          src={stakeholder.image}
                          style={{ backgroundColor: colour() }}
                          alt={stakeholder?.name}
                        >
                          {!stakeholder?.image && <CircledUserIcon />}
                          <span>{initial}</span>
                        </Avatar>
                      </div>
                      <ul className="connection-detail-list">
                        <li className="list-item connection-name">
                          {stakeholder?.name}
                        </li>
                        {stakeholder?.type !== 'entity' && country && (
                          <li className="list-item connection-location">
                            <LocationIcon />
                            <span>{country}</span>
                          </li>
                        )}
                        <li className="list-item  connection-role">
                          <Trans>{stakeholder?.role}</Trans>
                        </li>
                      </ul>
                    </Card>
                  </a>
                </Link>
              </SwiperSlide>
            )
          })}
      </Swiper>
    </div>
  )
}

export default StakeholderCarousel
