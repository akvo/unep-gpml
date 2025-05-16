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
      <FeatureCards />
      <div className="container wed-container">
        <div className="wed">
          <h1 className="hide-mobile">#WorldEnvironmentDay</h1>
          <h1 className="hide-desktop">
            #World
            <br />
            Environment
            <br />
            Day
          </h1>
          <p>
            5th June 2025, Jeju Island, Republic of Korea hosts world
            celebration of World Environment Day with the theme of plastic
            pollution.
          </p>
          <a href="https://www.worldenvironmentday.global/" target="_blank">
            <Button withArrow type="ghost">
              Visit Site
            </Button>
          </a>
          <Image
            className="wed-logos"
            src="/wed-logos.svg"
            width={640}
            height={50}
          />
        </div>
      </div>
      <LatestNews />
      <div className="workflow">
        <div className="container">
          <div className="text">
            {/* <h3>Country Dedicated Workflow</h3> */}
            <strong className="caps-heading-1">Country Dedicated</strong>
            <h2>
              <strong>Workflow</strong>
              <br />
            </h2>
            <p className="p-m">
              The Country Dedicated Workflow is a digital tool to help countries
              in developing national plastic source inventories and plastic
              strategies, supported by step-by-step guidance and inspiring case
              studies. Create your account and explore.
            </p>
            <JoinBtn {...props} />
          </div>
          <div className="screenshot">
            <Image src="/workflow-screenshot.jpg" width={710} height={423} />
          </div>
        </div>
      </div>
      <Forums {...props} />
      <div className="info-box">
        <div className="container">
          <p>
            Global Plastics Hub is developed through various stakeholders
            consultations, engagement and contributions from members and
            partners under the Global Partnership on Plastic Pollution and
            Marine Litter. We appreciate generous contributions from donor
            communities including Government of Japan, Norway and the United
            States.
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
        >
          <Trans>Join Now</Trans>
        </Button>
      ) : (
        <Link href="/workspace">
          <Button type="primary" size="large" withArrow>
            <Trans>Workspace</Trans>
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
          <h5 className="hide-mobile">the global plastics hub</h5>
          <h1>
            The one-stop platform for data, knowledge, and collaboration to end
            plastic pollution.
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
        #TurnOffThePlasticTap by <a href="#">Benjamin Von Wong</a>
      </div>
    </div>
  )
}

const FeatureCards = () => {
  return (
    <div className="feature-cards">
      <h3>Explore The Platform</h3>
      <div className="container">
        <Link href="/knowledge-hub" className="feature-card">
          <Image
            src="/iconxl-knowledge-hub.svg"
            width={265}
            height={136}
            alt="knowledge hub"
          />
          <h5>Knowledge Hub</h5>
          <h2>2800+</h2>
          <p>Knowledge resources shared in the Knowledge Library</p>
          <span>Explore The Resources</span>
        </Link>
        <Link href="/data-hub" className="feature-card">
          <Image
            src="/iconxl-data-hub.svg"
            width={320}
            height={160}
            alt="data hub"
          />
          <h5>Data Hub</h5>
          <h2>80+</h2>
          <p>Plastic Lifecycle Indicators showcase in the Data Hub.</p>
          <span>Explore The Data</span>
        </Link>
        <Link href="/community-hub" className="feature-card">
          <Image
            src="/iconxl-community.svg"
            width={321}
            height={204}
            alt="community"
          />
          <h5>Community Hub</h5>
          <h2>2000+</h2>
          <p>Members connected through Community Hub.</p>
          <span>Explore The Community</span>
        </Link>
      </div>
    </div>
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
    fetch(`${strapiUrl}/api/posts?locale=${router.locale}&populate=cover`)
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
          <strong className="caps-heading-1">
            <Trans>HIGHLIGHTS</Trans>
          </strong>
          <h2>
            <strong>
              <Trans>Latest news</Trans>
            </strong>
            <br />
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
                  <Link href={`/post/${item.id}-${item.slug}`}>
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
            <strong className="caps-heading-1">Workspace</strong>
            <h2>
              <strong>Forums</strong>
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

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default Landing
