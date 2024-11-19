import Image from 'next/image'
import {
  Calendar,
  Globe,
  LinkExternal,
  LinkIcon,
  LocationPin,
  PinCalendar,
} from '../../components/icons'
import styles from './style.module.scss'
import { SwiperSlide, Swiper } from 'swiper/react'
import { Navigation } from 'swiper'
import Link from 'next/link'
import moment from 'moment'

const ProjectDetail = ({ data }) => {
  console.log(data)
  const groupedConnections = {}
  data?.entityConnections?.forEach((it) => {
    if (!groupedConnections[it.role]) groupedConnections[it.role] = []
    groupedConnections[it.role].push(it)
  })
  const connectionLabels = {
    donor: 'Donors',
    implementor: 'Implementing Partners',
    partner: 'Partners',
    owner: 'Owners',
  }
  return (
    <div className={styles.detailView}>
      <div className="container">
        <div className="head">
          <h5 className="h-caps-m">project</h5>
          <h1 className="h-xxl">{data?.title}</h1>
          <div className="meta">
            {/* {data.country && (
            <div className="item location">
              <LocationPin />
              <span>
                {countries.find((it) => it.id === data.country)?.name}
              </span>
            </div>
          )} */}
            {data?.geoCoverageType && (
              <div className="item geo">
                <Globe />
                <span>{data.geoCoverageType}</span>
              </div>
            )}
            {data?.startDate && (
              <div className="item date">
                <Calendar />
                <span>From {moment(data.startDate).format('MMM YYYY')}</span>
                {data?.endDate && (
                  <span>
                    &nbsp;to {moment(data.startDate).format('MMM YYYY')}
                  </span>
                )}
              </div>
            )}
            {data?.url && (
              <a href={data.url} target="_blank">
                <div className="item link">
                  <LinkIcon />
                  <span>{data.url}</span>
                </div>
              </a>
            )}
          </div>
        </div>
        <Swiper
          spaceBetween={15}
          slidesPerView={'auto'}
          navigation={true}
          modules={[Navigation]}
        >
          {data?.image && (
            <SwiperSlide>
              <div className="cover-img">
                <img src={data?.image} />
              </div>
            </SwiperSlide>
          )}
          {data?.videos.map((video) => (
            <SwiperSlide className="video-slide">
              {convertYouTubeUrlToEmbed(video)}
            </SwiperSlide>
          ))}
        </Swiper>
        <h3 className="h-m w-bold">Background</h3>
        <p className="two-cols">{data?.background}</p>
        <h3 className="h-m w-bold">Purpose</h3>
        <p className="two-cols">{data?.purpose}</p>
        <div className="cols">
          <div className="col outcomes">
            <h3 className="h-m w-bold">Expected Outcomes</h3>
            <ul>
              {data?.outcomes?.map((it) => (
                <li>{it}</li>
              ))}
            </ul>
          </div>
          <div className="col highlights">
            <h3 className="h-m w-bold">Key Highlights</h3>
            <ul>
              {data?.highlights?.map((it) => {
                if (it.url && it.url !== '') {
                  return (
                    <li>
                      <a href={it.url} target="_blank">
                        {it.text}
                        <div className="icon">
                          <LinkExternal />
                        </div>
                      </a>
                    </li>
                  )
                }
                return <li>{it.text}</li>
              })}
            </ul>
          </div>
        </div>
        <div className="grouped-connections">
          {Object.keys(groupedConnections).map((groupKey) => (
            <div className="group">
              <h3 className="h-m w-bold">{connectionLabels[groupKey]}</h3>
              {groupedConnections[groupKey].map((it) => (
                <Link href={`/organisation/${it.entityId}`}>
                  <div className="org-item">
                    {it.image && (
                      <Image
                        src={it.image}
                        width={60}
                        height={60}
                        objectFit="contain"
                      />
                    )}
                    <span>{it.entity}</span>
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function convertYouTubeUrlToEmbed(url) {
  // Regular expression to match YouTube URLs
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  const match = url.match(regex)

  if (match && match[1]) {
    const videoId = match[1]
    return (
      <iframe
        width="720"
        height="460"
        src={`https://www.youtube.com/embed/${videoId}`}
        frameborder="0"
        allowfullscreen
      ></iframe>
    )
  } else {
    return 'Invalid YouTube URL'
  }
}

export default ProjectDetail
