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
      <Hero {...props} />
      <ShowcasingAndStats {...props} />
      <WhoAreWe />
      <ActNow />
      <LatestNews />
      <Activities />
      <Partners />
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

const ShowcasingAndStats = (props) => {
  const { i18n } = useLingui()
  const { isAuthenticated, setLoginVisible } = props
  const { stakeholders, organisations } = UIStore.useState((s) => ({
    stakeholders: s.stakeholders,
    organisations: s.organisations,
  }))

  const [expertsCount, setExpertsCount] = useState(0)
  const { _locale } = i18n
  const totalCount = props?.data?.reduce((sum, item) => {
    if (item.topic !== '[]') {
      return sum + item.count
    }
    return sum
  }, 0)

  useEffect(() => {
    const url = `/stakeholder/expert/list`
    api
      .get(url, { page_size: 100, page_n: 0 })
      .then((resp) => {
        const data = resp?.data
        setExpertsCount(data.count)
      })
      .catch((err) => {
        console.error(err)
      })
  }, [])

  return (
    <div className="container">
      <div className={styles.showCasingSection}>
        <div className="caption-container">
          <div className="caps-heading-1 page-sub-heading">
            <Trans>FEATURES</Trans>
          </div>
          <h2>
            <Trans>Browse the platform content</Trans>
          </h2>
        </div>
        <div className="powered-by-container">
          <div className="caps-heading-1 page-sub-heading">
            <Trans>POWERED BY:</Trans>
          </div>
          <div className="powered-by-images">
            <Image
              src={`/powered-by-unep${
                _locale === 'en' ? '' : `-${_locale}`
              }.svg`}
              alt="UNEP"
              width={146}
              height={146}
            />
          </div>
        </div>
      </div>
      <div className={styles.newFeaturesSection}>
        <div className="feature">
          <div className="icon">
            <Image
              src="/iconxl-knowledge-hub.svg"
              width={265}
              height={136}
              alt="knowledge hub"
            />
          </div>
          <p>
            <div>
              <h3>
                <Trans>Knowledge Hub</Trans>
              </h3>
              <span>
                <Trans>
                  Crowdsourcing a vast repository/library of <b>{totalCount}</b>{' '}
                  curated knowledge products and materials.
                </Trans>
              </span>
              <Link href="/knowledge/library">
                <Button type="link">
                  <Trans>Explore the resources</Trans>{' '}
                  <div className="icn">
                    <Pointer />
                  </div>
                </Button>
              </Link>
            </div>
          </p>
        </div>
        <div className="feature">
          <div className="icon">
            <Image
              src="/iconxl-data-hub.svg"
              width={320}
              height={160}
              alt="data hub"
            />
          </div>
          <p>
            <div>
              <h3>
                <Trans>Data Hub</Trans>
              </h3>
              <span>
                <Trans>
                  Visualizing an extensive array of <b>{props?.layers}</b> data
                  layers across the plastic lifecycle, providing in-depth
                  insights.
                </Trans>
              </span>
              <Link href="/data/maps">
                <Button type="link">
                  <Trans>Explore the data layers</Trans>{' '}
                  <div className="icn">
                    <Pointer />
                  </div>
                </Button>
              </Link>
            </div>
          </p>
        </div>
        <div className="feature">
          <div className="icon">
            <Image src="/iconxl-cop.svg" width={321} height={191} alt="cop" />
          </div>
          <p>
            <div>
              <h3>
                <Trans>Communities of Practice</Trans>
              </h3>
              <span>
                <Trans>
                  Harnessing the expertise of <b>{props?.cop}</b> Communities of
                  Practice (CoPs) comprised of leading experts and scientists to
                  bridge critical knowledge and data gaps.
                </Trans>
              </span>
              <Link href="/cop">
                <Button type="link">
                  <Trans>Explore the CoPs</Trans>{' '}
                  <div className="icn">
                    <Pointer />
                  </div>
                </Button>
              </Link>
            </div>
          </p>
        </div>
        <div className="feature">
          <div className="icon">
            <Image
              src="/iconxl-community.svg"
              width={321}
              height={204}
              alt="community"
            />
          </div>
          <p>
            <div>
              <h3>Community</h3>
              <span>
                <Trans>
                  Fostering a dynamic network of <b>{expertsCount}</b> experts,{' '}
                  <b>{stakeholders?.stakeholders?.length}</b> stakeholders and{' '}
                  <b>{organisations.length}</b> member organisations, enhancing
                  collaboration and shared innovation.
                </Trans>
              </span>
              <Link href="/community">
                <Button type="link">
                  <Trans>Explore the community</Trans>{' '}
                  <div className="icn">
                    <Pointer />
                  </div>
                </Button>
              </Link>
            </div>
          </p>
        </div>
        <div className="feature">
          <div className="icon">
            <Image
              src="/iconxl-workspace.svg"
              width={321}
              height={166}
              alt="workspace"
            />
          </div>
          <p>
            <div>
              <h3>
                <Trans>Workspace</Trans>
              </h3>
              <span>
                <Trans>
                  Empowering <b>18</b> countries in crafting comprehensive
                  national source inventories, which facilitates the development
                  of a National Roadmap/Strategy/Plan through evidence-based
                  approach. Additionally, forums can be accessed from the
                  workspace, promoting collaboration and sharing of information.
                </Trans>
              </span>
              {!isAuthenticated ? (
                <Button type="link" onClick={() => setLoginVisible(true)}>
                  <Trans>Access the workspace</Trans>
                  <div className="icn">
                    <Pointer />
                  </div>
                </Button>
              ) : (
                <Link href="/workspace">
                  <Button type="link">
                    <Trans>Access the workspace</Trans>
                    <div className="icn">
                      <Pointer />
                    </div>
                  </Button>
                </Link>
              )}
            </div>
          </p>
        </div>
      </div>
    </div>
  )
}

const WhoAreWe = () => {
  const [activeTab, setActiveTab] = useState('1')
  const [activeAccordion, setActiveAccordion] = useState('1')

  const items = [
    {
      id: 1,
      title: t`Who are we?`,
      description: t`The Global Partnership on Plastic Pollution and Marine Litter (GPML) Digital Platform is a multi-stakeholder, knowledge sharing and networking tool which aims to facilitate action on plastic pollution and marine litter reduction and prevention.`,
    },
    {
      id: 2,
      title: t`What we do?`,
      description: t`The Global Partnership on Plastic Pollution and Marine Litter (GPML) Digital Platform brings decision making power to multiple stakeholders by integrating data, crowd sourced knowledge, and fostering collaborations to co-create and advance solutions to end plastic pollution including in the marine environment.`,
    },
    {
      id: 3,
      title: t`What is the connection between this platform and GPML?`,
      description: t`The GPML Digital Platform functions as the digital arm of the GPML, a multi-stakeholder partnership that brings together all actors working to prevent plastic pollution and marine litter.`,
    },
    {
      id: 4,
      title: t`Why join the GPML?`,
      description: (
        <>
          <Trans>
            Benefits of joining:
            <ul>
              <li>Access to a global network of members​</li>
              <li>
                Opportunities to showcase your work in our newsletter, online
                and at events
              </li>
              <li>A Data Hub to guide efforts towards SDGs and more​</li>
              <li>Thousands of resources at your fingertips</li>
              <li>Networking with other stakeholders​</li>
              <li>Access to financing opportunities, and more!</li>
            </ul>
          </Trans>
        </>
      ),
    },
  ]
  return (
    <div className={styles.about}>
      <div className="container">
        <div className="who-are-we-lg-md">
          <Tabs
            tabPosition="left"
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
          >
            {items.map((item) => {
              return (
                <Tabs.TabPane
                  tab={
                    <span className="tab-label">
                      <span className="h6 bold">{item.title}</span>
                      <CirclePointer />
                    </span>
                  }
                  key={item.id}
                >
                  <strong className="caps-heading-1">{item.title}</strong>
                  <br />
                  <br />
                  <p className="p-l">{item.description}</p>
                </Tabs.TabPane>
              )
            })}
          </Tabs>
        </div>
        <div className="who-are-we-mobile">
          <Collapse
            bordered={false}
            activeKey={activeAccordion}
            onChange={setActiveAccordion}
            expandIcon={() => <CirclePointer />}
            accordion
          >
            {items.map((item) => (
              <Collapse.Panel
                header={<strong className="h6 bold">{item.title}</strong>}
                key={`${item.id}`}
              >
                <p className="p-s">{item.description}</p>
              </Collapse.Panel>
            ))}
          </Collapse>
        </div>
      </div>
    </div>
  )
}

const ActNow = () => {
  const [width] = useDeviceSize()
  const items = [
    {
      content: t`Visit Library and get informed by new reports, inspiring case studies, technical resources and on-going projects.`,
      bgColor: 'purple',
      title: (
        <>
          <Trans>Library</Trans>
        </>
      ),
      links: [
        {
          label: t`Discover`,
          url: '/knowledge-hub',
        },
      ],
    },
    {
      bgColor: 'green',
      content: t`Explore global plastic lifecycle datasets to deepen your understanding on the global trend of plastic pollution.`,
      title: t`Data Maps`,
      links: [
        {
          label: t`Discover`,
          url: '/data/maps',
        },
      ],
    },
    {
      bgColor: 'violet',
      content: t`Discover national plastic material flow and data narratives in countries to get inspired for necessary policies and actions.`,
      title: t`National Dashboard`,
      links: [{ label: t`Discover`, url: '/country-dashboard' }],
    },
    {
      bgColor: 'blue',
      content: t`Join others in coordinating efforts in monitoring harmonization and action planning.`,
      title: t`Communities of Practice`,
      links: [
        { label: t`Discover`, url: '/partnership' },
        // { label: t`Track action`, url: '#' },
      ],
    },
  ]
  return (
    <div className={styles.actNow}>
      <div className="container act-now-container">
        <div className="wrapper">
          <div className="caps-heading-1 page-sub-heading">
            <Trans>Why us?</Trans>
          </div>
          <h3 className="h-xxl">
            <Trans>Get Inspired:</Trans>
          </h3>
          <p className="p-l">
            <Trans>
              Data and information is a key for successful policy and action
              design to end plastic pollution. Immerse yourself in the rich
              resources in the platform.
            </Trans>
          </p>
        </div>
      </div>
      <div className="container slider-container">
        <div className="slider-wrapper">
          <Swiper
            spaceBetween={20}
            slidesPerView={width <= 1024 ? 'auto' : 4}
            pagination={pagination}
            modules={[Pagination]}
          >
            {items.map((item, index) => (
              <SwiperSlide key={index}>
                <ActNowCard item={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  )
}

const ActNowCard = ({ item }) => (
  <div className={`card card--${item?.bgColor}`}>
    {item?.label && <span className="card-label">{item?.label}</span>}
    <h2 className="h-m">{item?.title}</h2>
    <p className="p-s">{item?.content}</p>
    <div className={item.links.lenght === 1 ? 'monolink' : 'multilink'}>
      {item.links.map((link, index) => (
        <Link href={link.url} key={index}>
          <Button type="link" withArrow>
            {link.label}
          </Button>
        </Link>
      ))}
    </div>
  </div>
)

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

const Activities = () => {
  return (
    <section className={styles.activities}>
      <div className="container">
        <div className="title-wrapper">
          <div className="title-holder">
            <div className="caps-heading-1 page-sub-heading">
              <Trans>WHAT IS THE FOCUS OF GPML?</Trans>
            </div>
            <h2 className="h-xxl">
              <Trans>
                <span>GPML’s</span> Action Tracks
              </Trans>
            </h2>
            <p className="p-l">
              <Trans>
                The current core work of the GPML is organized through the
                following five Action Tracks, with the aim of advancing priority
                issues by connecting key stakeholders and facilitating
                collaboration and coordination. The platform offers a wide range
                of tools to facilitate this work.
              </Trans>
            </p>
          </div>
          <div>
            <a href="https://www.gpmarinelitter.org/" target="_blank">
              <Button size="large" ghost withArrow={<LongArrowRight />}>
                <Trans>Visit the website</Trans>
              </Button>
            </a>
          </div>
        </div>
        <div className="activity-box-wrapper">
          <ul>
            <li>
              <div className="icon">
                <img src="/activity-policy.svg" />
              </div>
              <p className="h-m">
                <Trans>
                  Science
                  <br />
                  policy
                </Trans>
              </p>
            </li>
            <li>
              <div className="icon">
                <img src="/activity-bookmark.svg" />
              </div>
              <p className="h-m">
                <Trans>Guidelines standards & harmonization</Trans>
              </p>
            </li>
            <li>
              <div className="icon">
                <img src="/activity-money.svg" />
              </div>
              <p className="h-m">
                <Trans>Sustainable & innovative financing</Trans>
              </p>
            </li>
            <li>
              <div className="icon">
                <img src="/activity-plans.svg" />
              </div>
              <p className="h-m">
                <Trans>National action plans</Trans>
              </p>
            </li>
            <li>
              <div className="icon">
                <img src="/activity-access.svg" />
              </div>
              <p className="h-m">
                <Trans>Access for All</Trans>
              </p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

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
        <h2 className="semibold">
          <Trans>Our partners</Trans>
        </h2>
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
                    <img alt={item.name} src={item.image} />
                  </a>
                ) : (
                  <img alt={item.name} src={item.image} />
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
