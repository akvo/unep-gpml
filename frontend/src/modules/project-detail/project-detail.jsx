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
import { Navigation, Pagination } from 'swiper'
import Link from 'next/link'
import moment from 'moment'
import { lifecycleStageTags, resourceTypeToTopicType } from '../../utils/misc'
import { useEffect, useState } from 'react'
import api from '../../utils/api'
import classNames from 'classnames'
import { Button, notification, Popover, Row, Skeleton } from 'antd'
import { MoreOutlined } from '@ant-design/icons'

const ProjectDetail = ({ data: inData, isModal, setVisible }) => {
  const [data, setData] = useState(inData)
  const [loading, setLoading] = useState(isModal)
  const groupedConnections = {}
  data?.entityConnections?.forEach((it) => {
    if (!groupedConnections[it.role]) groupedConnections[it.role] = []
    groupedConnections[it.role].push(it)
  })
  useEffect(() => {
    if (isModal) {
      api.get(`/detail/project/${inData.id}`).then((d) => {
        setData(d.data)
        setLoading(false)
      })
    }
  }, [])
  const connectionLabels = {
    donor: 'Donors',
    implementor: 'Implementing Partners',
    partner: 'Partners',
    owner: 'Owners',
  }
  const tagsToShow =
    data?.tags && data?.tags?.length > 0
      ? data.tags.filter(
          (item) =>
            !lifecycleStageTags.some(
              (filterItem) =>
                filterItem.toLowerCase() === item.tag.toLowerCase()
            )
        )
      : []
  const lifecycleTagsToShow =
    data?.tags && data?.tags?.length > 0
      ? data.tags.filter((item) =>
          lifecycleStageTags.some(
            (filterItem) => filterItem.toLowerCase() === item.tag.toLowerCase()
          )
        )
      : []
  const handleTagClick = (e) => {
    if (isModal) {
      setVisible(false)
    }
  }
  return (
    <div className={styles.detailView}>
      <div className={classNames('container', { isModal })}>
        <div className="head">
          <h5 className="h-caps-m">project</h5>
          {data?.reviewStatus === 'SUBMITTED' && (
            <div className="pending">
              <h5>Pending Approval</h5>
            </div>
          )}
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
            <AdminDropdown {...{ data }} />
          </div>
        </div>
        {loading && (
          <Row
            style={{ margin: '20px 40px' }}
            gutter={{
              lg: 24,
            }}
          >
            <Skeleton
              paragraph={{
                rows: 7,
              }}
              active
            />
          </Row>
        )}
        {!loading && (
          <>
            <Swiper
              spaceBetween={15}
              slidesPerView={'auto'}
              navigation={true}
              pagination={true}
              modules={[Navigation, Pagination]}
            >
              {data?.image && (
                <SwiperSlide>
                  <div className="cover-img">
                    <img src={data?.image} />
                  </div>
                </SwiperSlide>
              )}
              {data?.gallery?.map((image) => (
                <SwiperSlide>
                  <div className="cover-img">
                    <img src={image} />
                  </div>
                </SwiperSlide>
              ))}
              {data?.videos
                ?.filter((it) => it !== '')
                ?.map((video) => (
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
            <div className="cols">
              <div className="col">
                <h3 className="h-m w-bold">Life Cycle Stage</h3>
                <div className="tag-list">
                  {lifecycleTagsToShow?.map((tag) => (
                    <div className="tag-item" key={tag?.tag}>
                      <Link
                        href={`/knowledge-hub?tag=${tag.tag}`}
                        onClick={handleTagClick}
                      >
                        <div className="label">
                          <span>{tag?.tag || ''}</span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col">
                <h3 className="h-m w-bold">Tags</h3>
                <div className="tag-list">
                  {tagsToShow?.map((tag) => (
                    <div className="tag-item" key={tag?.tag}>
                      <Link
                        href={`/knowledge-hub?tag=${tag.tag}`}
                        onClick={handleTagClick}
                      >
                        <div className="label">
                          <span>{tag?.tag || ''}</span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
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

const AdminDropdown = ({ data }) => {
  return (
    <Popover
      placement="bottomLeft"
      content={
        <ul>
          <li>
            <Link href={`/add-content/?id=${data.id}&type=${data.type}`}>
              <Button size="small" type="link">
                Edit
              </Button>
            </Link>
          </li>
          <li>
            <Button
              size="small"
              type="link"
              onClick={() => {
                Modal.error({
                  className: 'popup-delete',
                  centered: true,
                  closable: true,
                  title: `Are you sure you want to delete this ${data.type}?`,
                  content: `Please be aware this action cannot be undone.`,
                  okText: `Delete`,
                  okType: 'danger',
                  onOk() {
                    return api
                      .delete(`/detail/${data.type}/${data.id}`)
                      .then((res) => {
                        notification.success({
                          message: 'Entity deleted successfully',
                        })
                      })
                      .catch((err) => {
                        console.error(err)
                        notification.error({
                          message: 'Oops, something went wrong',
                        })
                      })
                  },
                })
              }}
            >
              Delete
            </Button>
          </li>
        </ul>
      }
      trigger="click"
    >
      <div className="admin-btn">
        <MoreOutlined />
      </div>
    </Popover>
  )
}

export default ProjectDetail
