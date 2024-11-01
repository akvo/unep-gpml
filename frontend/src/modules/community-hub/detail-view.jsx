import Image from 'next/image'
import { useEffect, useState } from 'react'
import api from '../../utils/api'
import styles from './style.module.scss'
import ResourceCards from '../../components/resource-cards/resource-cards'
import { Swiper, SwiperSlide } from 'swiper/react'
import ResourceCard from '../../components/resource-card/resource-card'
import StakeholderCard from '../../components/stakeholder-card/stakeholder-card'
import {
  Email,
  Globe,
  LinkedinIcon,
  LinkedinOutlined,
  LinkIcon,
  LocationPin,
} from '../../components/icons'
import { UIStore } from '../../store'

const DetailView = ({ item }) => {
  const [data, setData] = useState({ ...item })
  const [loading, setLoading] = useState(true)
  const [resources, setResources] = useState(null)
  const [members, setMembers] = useState(null)
  const { countries } = UIStore.useState((s) => ({
    countries: s.countries,
  }))
  useEffect(() => {
    if (data.type)
      api.get(`/detail/${data.type}/${data.id}`).then((d) => {
        setData((_data) => {
          return { ..._data, ...d.data }
        })
        setLoading(false)
        if (data.type === 'organisation') {
          api
            .get(`/organisation/${data.id}/content?limit=20&page=0`)
            .then((d) => {
              setResources(d.data.results)
            })
          api
            .get(`/organisation/${data.id}/members?limit=20&page=0`)
            .then((d) => {
              setMembers(d.data.members)
            })
        }
      })
  }, [])
  console.log(resources)
  if (data.type === 'stakeholder') {
    return (
      <div className={`${styles.detailView} ${styles.stakeholderDetailView}`}>
        <div className="header">
          <h4 className="h-caps-m">member individual</h4>
          <h1>{data.name}</h1>
          <h5>
            {data.jobTitle}{' '}
            {data.affiliation && (
              <>
                @ <span>{data.affiliation.name}</span>
              </>
            )}
          </h5>
        </div>
        <div className="content">
          {data.picture && (
            <div className="img">
              <Image src={data.picture} fill />
            </div>
          )}
          <div className="meta">
            {data.country && (
              <div className="item location">
                <LocationPin />
                <span>
                  {data.country &&
                    countries.find((it) => it.id === data.country)?.name}
                </span>
              </div>
            )}
            {data.email && (
              <div className="item email">
                <Email />
                <span>{data.email}</span>
              </div>
            )}
            {data.linkedin && (
              <div className="item link linkedin">
                <LinkedinOutlined />
                <span>{data.linkedin}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className={styles.detailView}>
      <div className="org">
        <div className="header">
          <h4 className="h-caps-m">member organisation</h4>
          <h1>{data.name}</h1>
          <div className="meta">
            <div className="item location">
              <LocationPin />
              <span>
                {data.country &&
                  countries.find((it) => it.id === data.country)?.name}
              </span>
            </div>
            <div className="item geo">
              <Globe />
              <span>{data.geoCoverageType}</span>
            </div>
            <a href={data.url} target="_blank">
              <div className="item link">
                <LinkIcon />
                <span>{data.url}</span>
              </div>
            </a>
            {/* <div className="item link linkedin">
              <LinkedinOutlined />
              <span>http...</span>
            </div> */}
          </div>
        </div>
        <div className="content">
          <p>
            {data.picture && (
              <div className="img">
                <Image src={data.picture} fill />
              </div>
            )}
            {data.program}
          </p>
          <div className="clearfix"></div>
          {resources != null && resources.length > 0 && (
            <>
              <h4 className="h-caps-m">Associated content</h4>
              <Swiper
                spaceBetween={15}
                slidesPerGroup={4}
                slidesPerView={'auto'}
                className="resource-cards"
              >
                {resources.map((item) => (
                  <SwiperSlide>
                    <ResourceCard item={item} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </>
          )}
          {members != null && members.length > 0 && (
            <>
              <h4 className="h-caps-m">Individual members</h4>
              <Swiper
                spaceBetween={15}
                slidesPerGroup={4}
                slidesPerView={'auto'}
                className="members-slider"
              >
                {members.map((member) => (
                  <SwiperSlide>
                    <StakeholderCard
                      item={{ type: 'stakeholder', ...member }}
                      key={`${member.type}-${member.id}`}
                      className="resource-card"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DetailView
