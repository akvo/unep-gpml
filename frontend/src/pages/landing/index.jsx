import {
  Tabs,
  Collapse,
  Card,
  Tag,
  Input,
  Col,
  Row,
  Form,
  Select,
  Dropdown,
  Menu,
  notification,
  List,
} from 'antd'
import Image from 'next/image'
import Link from 'next/link'
import styles from './index.module.scss'
import {
  CirclePointer,
  LinkedinIcon,
  YoutubeIcon,
  LongArrowRight,
  Pointer,
} from '../../components/icons'
import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { motion, AnimatePresence } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper'
import { useDeviceSize } from '../../modules/landing/landing'
import ExploreByTopic from './ExploreByTopic'
import Button from '../../components/button'
import { Trans, t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { loadCatalog } from '../../translations/utils'
import { UIStore } from '../../store'
import { useRouter } from 'next/router'
import {
  getStrapiUrl,
  stripHtml,
  transformStrapiResponse,
} from '../../utils/misc'
import api from '../../utils/api'
import { SearchBar } from '../search'
import { ChannelCard } from '../forum'
import dynamic from 'next/dynamic'

const pagination = {
  clickable: true,
  renderBullet: function (index, className) {
    return '<div class="' + className + '">' + '<span/>' + '</div>'
  },
}

const Landing = (props) => {
  return (
    <div id="landing" className={styles.landing}>
      <HeroPlasticTap {...props} />
      <AtAGlance />
      <ExploreByTopic />
      <div className="container wed-container" id="main-content">
        <iframe
          title="Introduction to the Global Plastics Hub"
          width="100%"
          height="600"
          src="https://www.youtube.com/embed/g1DY4Pc0hYE?si=JDSTEuPd_FZl-dr1"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>

        {/* <div className="wed">
          <h1 className="hide-mobile">#WorldEnvironmentDay</h1>
          <h1 className="hide-desktop">
            #World
            <br />
            Environment
            <br />
            Day
          </h1>
          <p>
            <Trans>
              5th June 2025, Jeju Island, Republic of Korea hosts world
              celebration of World Environment Day with the theme of plastic
              pollution.
            </Trans>
          </p>
          <a href="https://www.worldenvironmentday.global/" target="_blank">
            <Button withArrow type="ghost">
              <Trans>Visit Site</Trans>
            </Button>
          </a>
          <Image
            className="wed-logos"
            src="/wed-logos.svg"
            width={640}
            height={50}
          />
        </div> */}
      </div>
      <LatestNews />
      <div className="workflow">
        <div className="container">
          <div className="text">
            {/* <strong className="caps-heading-1">
              <Trans>Workflow</Trans>
            </strong> */}
            <h2>
              <strong>
                <Trans>Action Planning Tool</Trans>
              </strong>
              <br />
            </h2>
            <p className="p-m">
              <Trans>
                The Action Planning Tool is a digital workflow to help countries
                in developing national plastic source inventories and plastic
                strategies, supported by step-by-step guidance and inspiring
                case studies. Create your account and explore.
              </Trans>
            </p>
            <Link href="/workspace/plastic-strategy-country-a">
              <Button type="primary" size="large" withArrow>
                <Trans>View</Trans>
              </Button>
            </Link>
          </div>
          <div className="screenshot">
            <Link href="/workspace/plastic-strategy-country-a">
              <img
                src="/workflow-screenshot.png"
                width={710}
                alt="Workflow screenshot"
                style={{
                  borderRadius: '6px',
                  width: '100%',
                  height: 'auto',
                  cursor: 'pointer',
                }}
              />
            </Link>
          </div>
        </div>
      </div>
      <Forums {...props} />
      <Partners />
      <div className="info-box">
        <div className="container">
          <p>
            <Trans>
              Global Plastics Hub is developed through various stakeholders
              consultations, engagement and contributions from members and
              partners under the Global Partnership on Plastic Pollution and
              Marine Litter. We appreciate generous contributions from donor
              communities including Government of Japan, Norway and the United
              States.
            </Trans>
          </p>
        </div>
      </div>
    </div>
  )
}

const Hero = ({ setLoginVisible, isAuthenticated }) => {
  const [selected, setSelected] = useState('Governments')
  const [timeout, _setTimeout] = useState(true)

  const intidRef = useRef()
  const [width] = useDeviceSize()
  const { i18n } = useLingui()

  const items = [
    {
      group: i18n._(t`Governments`),
      id: 'Governments',
      text: i18n._(
        t`The GPML digital platform empowers all countries to create and implement successful plastic strategies to end plastic pollution including in the marine environment.`
      ),
    },
    {
      group: i18n._(t`Private Sector`),
      id: 'Private Sector',
      text: i18n._(
        t`The GPML digital platform fosters public-private partnerships, offers clarity on circular economy practices, and provides guidance on Extended Producer Responsibilities (EPRs) and sustainable business models.`
      ),
    },
    {
      group: i18n._(t`Scientific Communities`),
      id: 'Scientific Communities',
      text: i18n._(
        t`The GPML digital platform helps academia and the scientific community to ensure their research becomes actionable by offering the opportunity to share resources and collaborate with policy makers.`
      ),
    },
    {
      group: i18n._(t`NGOs`),
      id: 'NGOs',
      text: i18n._(
        t`The GPML Digital Platform allows NGOs and civil society to connect with likeminded organizations, discover financing resources and funding opportunities, and showcase their work in the fight against plastic pollution and marine litter.`
      ),
    },
    {
      group: i18n._(t`IGOs`),
      id: 'IGOs',
      text: i18n._(
        t`The GPML digital platform offers the opportunity to forge collaborative partnerships with diverse stakeholders, share and find resources on plastic pollution, and amplify advocacy.`
      ),
    },
    {
      group: i18n._(t`Civil Society`),
      id: 'Civil Society',
      text: i18n._(
        t`The GPML digital platform allows NGOs and civil society to connect with likeminded organizations, discover financing resources and funding opportunities, and showcase their work in the fight against plastic pollution and marine litter.`
      ),
    },
  ]
  const router = useRouter()
  useEffect(() => {
    let index = 0
    clearInterval(intidRef.current)
    intidRef.current = setInterval(() => {
      index += 1
      if (index >= items.length) index = 0
      setSelected(items[index].id)
    }, 5000)

    return () => {
      clearInterval(intidRef.current)
    }
  }, [])

  const handleClickLabel = (item) => () => {
    setSelected(item.id)
    clearInterval(intidRef.current)
    _setTimeout(false)
  }

  return (
    <>
      <div className="hero">
        <div className="container">
          <div className="globe">
            <Image
              className="hide-mobile"
              src="/globe.jpg"
              width={1022}
              height={770}
              alt="hero"
            />
            <Image
              className="hide-desktop"
              src="/globe-mobile.jpg"
              width={width}
              height={width / 0.77}
              alt="hero"
            />
            <div
              className="labels"
              style={width < 768 ? { transform: `scale(${width / 390})` } : {}}
            >
              {items.map((item) => (
                <div
                  onClick={handleClickLabel(item)}
                  key={item.id}
                  className={classNames(
                    `label l-${item.id.toLowerCase().replace(' ', '-')}`,
                    { selected: selected === item.id }
                  )}
                >
                  <span>{item.group}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text">
            <h1>
              <Trans>Empowering</Trans>
              <br />
              <b className={classNames({ timeout })}>
                {items.find((name) => name.id === selected)?.group}
              </b>
              <br />
              <Trans>to address plastic pollution</Trans>
            </h1>
            <div className="p-container">
              {items.map((item) => (
                <AnimatePresence key={`p-${item.id}`}>
                  {item.id === selected && (
                    <motion.p
                      transition={{
                        type: 'spring',
                        damping: 15,
                        stiffness: 100,
                      }}
                      initial={{ opacity: 0, transform: `translateY(-30px)` }}
                      animate={{ opacity: 1, transform: `translateY(0px)` }}
                      exit={{ opacity: 0, transform: `translateY(30px)` }}
                      className="p-l"
                      key={`p-${item.id}`}
                    >
                      {item.text}
                    </motion.p>
                  )}
                </AnimatePresence>
              ))}
            </div>
            <JoinBtn {...{ isAuthenticated, setLoginVisible }} />
          </div>
        </div>
      </div>
      <div className="container">
        <SearchBar
          onSearch={(val) => {
            router.push(`/search?q=${val.replace(/ /g, '+')}`)
          }}
        />
      </div>
    </>
  )
}

const JoinBtn = ({ isAuthenticated, setLoginVisible }) => {
  return (
    <>
      {!isAuthenticated ? (
        <Button
          onClick={() => setLoginVisible(true)}
          type="primary"
          size="large"
          withArrow
          aria-label="Join now"
        >
          <Trans>Join Now</Trans>
        </Button>
      ) : (
        <Link href="/workspace">
          <Button type="primary" size="large" withArrow>
            <Trans>View</Trans>
          </Button>
        </Link>
      )}
    </>
  )
}

const HeroPlasticTap = ({ isAuthenticated, setLoginVisible }) => {
  const router = useRouter()
  return (
    <div className="hero">
      <div className="container">
        <div className="content">
          <div className="hide-desktop credit">
            <a href="https://turnofftheplastictap.com/" target="_blank">
              <Image
                src="/photo-credit.svg"
                width={16}
                height={16}
                alt="Photo by"
              />
              Credit
            </a>
          </div>
          <h5 className="hide-mobile">the global plastics hub</h5>
          <h1>
            <Trans>
              The one-stop platform for data, knowledge, and collaboration to
              end plastic pollution.
            </Trans>
          </h1>
          <JoinBtn {...{ isAuthenticated, setLoginVisible }} />
        </div>
      </div>
      <div className="search-bar-bottom">
        <div className="container">
          <SearchBar
            onSearch={(val) => {
              router.push(`/search?q=${val.replace(/ /g, '+')}`)
            }}
          />
        </div>
      </div>
      <div className="attribution hide-mobile">
        #TurnOffThePlasticTap by{' '}
        <a href="https://turnofftheplastictap.com/" target="_blank">
          Benjamin Von Wong
        </a>
      </div>
    </div>
  )
}

const AtAGlance = () => {
  // Video background on larger screens only, and not for visitors who
  // turn off animations. Phones and reduced motion get the still photo.
  const [showVideo, setShowVideo] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(
      '(min-width: 769px) and (prefers-reduced-motion: no-preference)'
    )
    setShowVideo(mq.matches)
  }, [])

  return (
    <section className="at-a-glance" aria-labelledby="explore-platform-heading">
      {showVideo && (
        <video
          className="glance-video"
          autoPlay
          muted
          loop
          playsInline
          poster="/explore-platform-video-poster.jpg"
          aria-hidden="true"
        >
          <source src="/explore-platform-bg.mp4" type="video/mp4" />
        </video>
      )}
      <h3 id="explore-platform-heading">
        <Trans>Explore The Platform</Trans>
      </h3>

      <div className="container glance">
        <div className="glance-card glance-data">
          <Link href="/data/maps" className="glance-title">
            <Image
              src="/iconxl-data-hub.svg"
              width={160}
              height={80}
              alt="Data Hub icon"
            />
            <h5>
              <Trans>Data Hub</Trans>
            </h5>
            <h2>70+</h2>
          </Link>
          <p>
            <Trans>
              Indicators from global datasets from international organizations,
              scientific articles and SDG monitoring are visualized through{' '}
              <Link href="/data/maps" className="link-green">
                global maps
              </Link>{' '}
              and{' '}
              <Link href="/country-dashboard" className="link-green">
                country dashboards
              </Link>
            </Trans>
          </p>
        </div>

        <Link href="/workspace" className="glance-apt">
          <Image
            src="/iconxl-workspace.svg"
            width={120}
            height={60}
            alt="Action Planning Tool icon"
          />
          <h5>
            <Trans>Action Planning Tool</Trans>
          </h5>
          <p>
            <Trans>
              Shared digital working space connecting data, knowledge and
              stakeholders
            </Trans>
          </p>
        </Link>

        <div className="glance-card glance-kh">
          <Link href="/knowledge-hub" className="glance-title">
            <Image
              src="/iconxl-knowledge-hub.svg"
              width={160}
              height={80}
              alt="Knowledge Hub icon"
            />
            <h5>
              <Trans>Knowledge Hub</Trans>
            </h5>
            <h2>2800+</h2>
          </Link>
          <p>
            <Trans>
              Technical resources, good practices, case studies, guidelines,
              tools, training courses etc., integrated into the{' '}
              <Link href="/knowledge-hub" className="link-orange">
                Library
              </Link>{' '}
              and{' '}
              <Link href="/knowledge/learning-centre" className="link-purple">
                Learning Centre
              </Link>
            </Trans>
          </p>
        </div>

        <div className="glance-card glance-ch">
          <Link href="/community-hub" className="glance-title">
            <Image
              src="/iconxl-community.svg"
              width={160}
              height={100}
              alt="Community Hub icon"
            />
            <h5>
              <Trans>Community Hub</Trans>
            </h5>
            <h2>3000+</h2>
          </Link>
          <p>
            <Trans>
              Users and stakeholders signed up for the{' '}
              <Link href="/community-hub" className="link-purple">
                Global Plastics Hub
              </Link>{' '}
              and{' '}
              <Link href="/community" className="link-purple">
                GPML members
              </Link>
            </Trans>
          </p>
        </div>
      </div>
      {showVideo ? (
        <a
          className="glance-credit"
          href="https://www.pexels.com/video/plastic-floating-in-the-sea-4717817/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Video: Åke Wall / Pexels
        </a>
      ) : (
        <a
          className="glance-credit"
          href="https://unsplash.com/@naja_bertolt_jensen"
          target="_blank"
          rel="noopener noreferrer"
        >
          Photo: Naja Bertolt Jensen / Unsplash
        </a>
      )}
    </section>
  )
}

const LatestNews = () => {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const strapiUrl = getStrapiUrl()
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true)
    }
  }, [])
  useEffect(() => {
    fetch(
      `${strapiUrl}/api/posts?locale=${router.locale}&populate=cover&sort=id:desc`
    )
      .then((d) => d.json())
      .then((d) => {
        setItems(transformStrapiResponse(d.data))
        setLoading(false)
      })
  }, [router])
  return (
    <div className={styles.latestNews}>
      <div className="container">
        <div className="news-wrapper">
          {/* <strong className="caps-heading-1">
            <Trans>HIGHLIGHTS</Trans>
          </strong> */}
          <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
  <strong>
    <Trans>Highlights</Trans>
  </strong>
  <Link href="/highlights" style={{ fontSize: '14px', fontWeight: 'normal' }}>
    <Button type="link" withArrow>
      <Trans>See All</Trans>
    </Button>
  </Link>
</h2>
        </div>
        <Swiper
          slidesPerView={isMobile ? 1 : 4}
          spaceBetween={20}
          modules={[Pagination]}
          pagination={{
            clickable: true,
          }}
        >
          {items.map((item, dx) => {
            return (
              <SwiperSlide>
                <Card
                  bordered={false}
                  cover={
                    <div className="cover-image-container">
                      <div className="cover-image-overlay"></div>
                      <Link href={`/post/${item.id}-${item.slug}`}>
                        <Image
                          alt={item.title}
                          src={
                            item.cover.data?.attributes?.formats?.medium?.url
                          }
                          width={366}
                          height={220}
                        />
                      </Link>
                    </div>
                  }
                  key={dx}
                >
                  <Link href={`/post/${item.id}-${item.slug}`}>
                    <h5 className="bold">{item.title}</h5>
                  </Link>
                  <p className="p-m">
                    {stripHtml(item.content)?.substring(0, 150)}...
                  </p>
                  <Link
                    href={`/post/${item.id}-${item.slug}`}
                    aria-label={`Read more about ${item.title}`}
                  >
                    <Button type="link" withArrow>
                      <Trans>Read More</Trans>
                    </Button>
                  </Link>
                </Card>
              </SwiperSlide>
            )
          })}
        </Swiper>
        {/* <div className="news-wrapper news-items">
          
        </div> */}
      </div>
    </div>
  )
}

const Forums = ({
  setLoginVisible,
  isAuthenticated,
  profile,
  setShouldJoin,
}) => {
  const [forums, setForums] = useState([])
  const [viewModal, setViewModal] = useState({
    open: false,
    data: {},
  })
  const handleOnView = (data) => {
    setViewModal({
      open: true,
      data,
    })
  }
  useEffect(() => {
    api.get('/chat/channel/all').then((d) => {
      setForums(d.data.channels)
    })
  }, [])
  return (
    <div className="forums">
      <div className="container">
        <div className="title-wrapper">
          <div className="title-holder">
            <strong className="caps-heading-1">
              <Trans>Workspace</Trans>
            </strong>
            <h2>
              <strong>
                <Trans>Forums</Trans>
              </strong>
            </h2>
          </div>
          {/* <Button type="ghost" withArrow ghost size="large">
            All Forums
          </Button> */}
        </div>
        <List
          grid={{ lg: 3, column: 3, gutter: 20, md: 2, sm: 1, xs: 1 }}
          dataSource={forums
            .sort((a, b) => {
              if (b.privacy === 'public' && a.privacy !== 'public') return 1
              else return -1
            })
            .slice(0, 3)}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <ChannelCard
                {...{
                  item,
                  handleOnView,
                  profile,
                  // ChatStore,
                  // handleEditItem,
                }}
              />
            </List.Item>
          )}
        />
      </div>
      <DynamicForumModal
        {...{
          viewModal,
          setViewModal,
          setLoginVisible,
          isAuthenticated,
          profile,
          setShouldJoin,
        }}
      />
    </div>
  )
}
const DynamicForumModal = dynamic(
  () => import('../../modules/forum/forum-modal'),
  {
    ssr: false, // modal has window object that should be run in client side
  }
)

const Partners = () => {
  const [items, setItems] = useState([])
  const [width] = useDeviceSize()
  const strapiUrl = getStrapiUrl()
  useEffect(() => {
    fetch(`${strapiUrl}/api/partners?populate=*`)
      .then((d) => d.json())
      .then((d) => {
        const simplifiedItems = d.data.map((item) => {
          const { title, url, image } = item.attributes
          return {
            title,
            url,
            image: image.data.attributes.url,
          }
        })
        setItems(simplifiedItems)
      })
  }, [])

  return (
    <div className={styles.partnerSection}>
      <div className="container">
        <h2 className="semibold">Partners</h2>
      </div>
      <div className="partner-container">
        <ul className="partner-items">
          <Swiper
            spaceBetween={width <= 1024 ? 20 : 40}
            slidesPerView={width <= 1024 ? 2 : 5}
            pagination={pagination}
            modules={[Pagination]}
          >
            {items.map((item, ix) => (
              <SwiperSlide key={ix}>
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <img alt={item.title} src={item.image} />
                  </a>
                ) : (
                  <img alt={item.title} src={item.image} />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </ul>
      </div>
    </div>
  )
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default Landing
