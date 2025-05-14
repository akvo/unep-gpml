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
      <LatestNews />
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

const LatestNews = () => {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const strapiUrl = getStrapiUrl()
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
        <div className="news-wrapper hide-sm">
          <strong className="caps-heading-1">
            <Trans>HIGHLIGHTS</Trans>
          </strong>
          <h2>
            <strong>
              <Trans>Latest news:</Trans>
            </strong>
            <br />
          </h2>
        </div>
        <div className="news-wrapper news-items">
          {items.map((item, dx) => {
            return (
              <Card
                bordered={false}
                cover={
                  <div className="cover-image-container">
                    <div className="cover-image-overlay"></div>
                    <Link href={`/post/${item.id}-${item.slug}`}>
                      <Image
                        alt={item.title}
                        src={item.cover.data?.attributes?.formats?.medium?.url}
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
                  {stripHtml(item.content)?.substring(0, 100)}...
                </p>
                <Link href={`/post/${item.id}-${item.slug}`}>
                  <Button type="link" withArrow>
                    <Trans>Read More</Trans>
                  </Button>
                </Link>
              </Card>
            )
          })}
        </div>
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
