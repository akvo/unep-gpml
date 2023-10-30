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
} from 'antd'
import Image from 'next/image'
import Link from 'next/link'
import isEmpty from 'lodash/isEmpty'
import values from 'lodash/values'
import flatten from 'lodash/flatten'
import styles from './index.module.scss'
import {
  CirclePointer,
  Magnifier,
  Localiser,
  ArrowRight,
  LinkedinIcon,
  YoutubeIcon,
  LongArrowRight,
} from '../../components/icons'
import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { motion, AnimatePresence } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper'
import moment from 'moment'
import { useDeviceSize } from '../../modules/landing/landing'
import Button from '../../components/button'
import { Trans, t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { loadCatalog } from '../../translations/utils'
import { UIStore } from '../../store'
import api from '../../utils/api'
import { useRouter } from 'next/router'
import { stripHtml, transformStrapiResponse } from '../../utils/misc'

const pagination = {
  clickable: true,
  renderBullet: function (index, className) {
    return '<div class="' + className + '">' + '<span/>' + '</div>'
  },
}

const Landing = () => (
  <div id="landing" className={styles.landing}>
    <Hero />
    <ShowcasingAndStats />
    <WhoAreWe />
    <ActNow />
    <LatestNews />
    <Features />
    <Trusted />
    <Activities />
    {/* <OurVoices /> */}
    <Partnership />
    <Partners />
    <HelpCentre />
    <Footer />
  </div>
)

const Hero = () => {
  const [selected, setSelected] = useState('Governments')
  const [timeout, _setTimeout] = useState(true)
  const [filter, setFilter] = useState({})

  const intidRef = useRef()
  const [width] = useDeviceSize()
  const { i18n } = useLingui()

  const items = [
    {
      group: i18n._(t`Governments`),
      text: i18n._(
        t`The GPML digital platform empowers all countries to create and implement successful plastic strategies to end plastic pollution including in the marine environment.`
      ),
    },
    {
      group: t`Private Sector`,
      text:
        'The GPML digital platform fosters public-private partnerships, offers clarity on circular economy practices, and provides guidance on Extended Producer Responsibilities (EPRs) and sustainable business models.',
    },
    {
      group: t`Scientific Communities`,
      text: t`The GPML digital platform helps academia and the scientific community to ensure their research becomes actionable by offering the opportunity to share resources and collaborate with policy makers.`,
    },
    {
      group: t`NGOs`,
      text: t`The GPML digital platform helps academia and the scientific community to ensure their research becomes actionable by offering the opportunity to share resources and collaborate with policy makers.`,
    },
    {
      group: t`IGOs`,
      text: t`The GPML digital platform offers the opportunity to forge collaborative partnerships with diverse stakeholders, share and find resources on plastic pollution, and amplify advocacy.`,
    },
    {
      group: t`Civil Society`,
      text: t`The GPML digital platform allows NGOs and civil society to connect with likeminded organizations, discover financing resources and funding opportunities, and showcase their work in the fight against plastic pollution and marine litter.`,
    },
  ]
  const router = useRouter()
  const tags = UIStore.useState((s) => s.tags)
  // populate options for tags dropdown
  const tagsWithoutSpace =
    !isEmpty(tags) &&
    flatten(values(tags)).map((it) => ({
      value: it?.tag?.trim(),
      label: it?.tag?.trim(),
    }))

  const tagOpts = !isEmpty(tags)
    ? [...new Set(tagsWithoutSpace.map((s) => JSON.stringify(s)))]
        .map((s) => JSON.parse(s))
        ?.sort((tag1, tag2) => tag1?.label.localeCompare(tag2?.label))
    : []
  const suggestedTags = [
    'Plastic Pollution',
    'Marine Litter',
    'Reports & Assessments',
    'Circularity',
    'Plastics',
    'Waste management',
    'Courses & Training',
    'National Action Plan',
  ]
  const maxTags = 6

  useEffect(() => {
    let index = 0
    clearInterval(intidRef.current)
    intidRef.current = setInterval(() => {
      index += 1
      if (index >= items.length) index = 0
      setSelected(items[index].group)
    }, 5000)
  }, [])
  const handleClickLabel = (item) => () => {
    setSelected(item.group)
    clearInterval(intidRef.current)
    _setTimeout(false)
  }

  const handleOnSearch = () => {
    if (!filter?.tag) {
      return
    }
    router.push({
      pathname: '/knowledge/library',
      query: filter,
    })
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
            />
            <Image
              className="hide-desktop"
              src="/globe-mobile.jpg"
              width={width}
              height={width / 0.77}
            />
            <div
              className="labels"
              style={width < 768 ? { transform: `scale(${width / 390})` } : {}}
            >
              {items.map((item) => (
                <div
                  onClick={handleClickLabel(item)}
                  key={item.group}
                  className={classNames(
                    `label l-${item.group.toLowerCase().replace(' ', '-')}`,
                    { selected: selected === item.group }
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
              <b className={classNames({ timeout })}>{selected}</b>
              <br />
              <Trans>to address plastic pollution</Trans>
            </h1>
            <div className="p-container">
              {items.map((item) => (
                <AnimatePresence key={`p-${item.group}`}>
                  {item.group === selected && (
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
                      key={`p-${item.group}`}
                    >
                      {item.text}
                    </motion.p>
                  )}
                </AnimatePresence>
              ))}
            </div>
            <Button type="primary" size="large" withArrow>
              <Trans>Join Now</Trans>
            </Button>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="search-bar">
          <div className="bar">
            <Select
              dropdownClassName={styles.dropdownSuggestion}
              placeholder={t`Search the resource database...`}
              options={tagOpts}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              value={filter?.tag}
              onChange={(val) => {
                setFilter({
                  tag: val,
                })
              }}
              suffixIcon={width < 768 && <Magnifier />}
              virtual={false}
              showSearch
            />
            <div className="localisation h-xs">
              <Localiser />
              <span className="hide-mobile">
                <Trans>Globally</Trans>
              </span>
            </div>
            <Button
              type="primary"
              size="small"
              className="left-icon hide-mobile"
              onClick={handleOnSearch}
            >
              <Magnifier />
              <Trans>Search</Trans>
            </Button>
          </div>
          <Button
            type="primary"
            className="hide-desktop noicon"
            onClick={handleOnSearch}
          >
            <Trans>Search</Trans>
          </Button>
          <div className="tags hide-mobile">
            <b>
              <Trans>Suggested:</Trans>
            </b>
            <div className="suggestions">
              {suggestedTags.slice(0, maxTags).map((suggestion, sx) => (
                <Tag
                  key={sx}
                  className="h-xxs"
                  onClick={() => setFilter({ tag: suggestion })}
                >
                  {suggestion}
                </Tag>
              ))}
              {suggestedTags.length > maxTags && (
                <Dropdown
                  overlay={
                    <Menu>
                      {suggestedTags
                        .slice(maxTags, suggestedTags.length)
                        .map((tag, tx) => {
                          return (
                            <Menu.Item
                              key={tx}
                              onClick={() => setFilter({ tag })}
                            >
                              {tag}
                            </Menu.Item>
                          )
                        })}
                    </Menu>
                  }
                  trigger={['click']}
                >
                  <Tag className="h-xxs">
                    {`+${suggestedTags.length - maxTags} more`}
                  </Tag>
                </Dropdown>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const ShowcasingAndStats = () => {
  const { i18n } = useLingui()
  const items = [
    {
      value: '2370',
      label: i18n._(t`NUMBER OF RESOURCES`),
    },
    {
      value: '300',
      label: t`DATA LAYERS`,
    },
    {
      value: '70',
      label: t`ACTION PLANS`,
    },
    {
      value: '5',
      label: t`COMMUNITIES OF PRACTICE`,
    },
  ]
  return (
    <div className="container">
      <div className={styles.showCasingSection}>
        <div className="caption-container">
          <div className="caps-heading-1 page-sub-heading">
            <Trans>SHOWCASING</Trans>
          </div>
          <h2>
            <Trans>Already on the platform</Trans>
          </h2>
        </div>
        <div className="powered-by-container">
          <div className="caps-heading-1 page-sub-heading">
            <Trans>POWERED BY:</Trans>
          </div>
          <div className="powered-by-images">
            <Image
              src="/powered-by-unep.svg"
              alt="UNEP"
              width={146}
              height={146}
            />
            <Image
              src="/powered-by-gpml.svg"
              alt="GPML"
              width={146}
              height={146}
            />
          </div>
        </div>
      </div>
      <div className={styles.statsSection}>
        <div className="stats-container">
          <ul className="stats">
            {items.map((item, ix) => (
              <li key={ix}>
                <h2>{item.value}</h2>
                <strong className="h-xs">{item.label}</strong>
              </li>
            ))}
          </ul>
        </div>
        <div className="summaries">
          <span className="purple">
            <h5>
              195 <Trans>Governments</Trans>
            </h5>
          </span>
          <span className="green">
            <h5>
              1358 <Trans>Organizations</Trans>
            </h5>
          </span>
          <span className="blue">
            <h5>
              1251 <Trans>Individuals</Trans>
            </h5>
          </span>
        </div>
      </div>
    </div>
  )
}

const WhoAreWe = () => {
  const [activeTab, setActiveTab] = useState('1')
  const [activeAccordion, setActiveAccordion] = useState('1')
  const { i18n } = useLingui()

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
  const { i18n } = useLingui()
  const items = [
    {
      content: t`Start your own initiative. Get inspired by others who are making progress to end plastic pollution.`,
      bgColor: 'purple',
      title: (
        <>
          <Trans>
            Case
            <br />
            Studies
          </Trans>
        </>
      ),
      links: [
        {
          label: t`Discover`,
          url: '/knowledge/library?subContentType=Case+studies',
        },
      ],
    },
    {
      bgColor: 'green',
      content: t`Reduce your country’s footprint. Create and advance your plastic startegy.`,
      title: t`Plastic Strategies`,
      links: [
        {
          label: t`Discover`,
          url: '/knowledge/library/map/action-plan',
        },
        { label: t`Add`, url: '/flexible-form' },
      ],
    },
    {
      bgColor: 'violet',
      content: t`Join others in coordinating efforts towards shared plastic solutions. From data to capacity development communities`,
      title: t`Communities of practise`,
      links: [{ label: t`Join and collaborate`, url: '/forum' }],
    },
    {
      bgColor: 'blue',
      content: t`Data visualisations to track countries progress. Quickly connect with others working in the country to end plastic.`,
      label: t`Coming soon`,
      title: t`Country Progress`,
      links: [
        // { label: t`Track progress`, url: '#' },
        // { label: t`Track action`, url: '#' },
      ],
    },
  ]
  return (
    <div className={styles.actNow}>
      <div className="container act-now-container">
        <div className="wrapper">
          <div className="caps-heading-1 page-sub-heading">Why us?</div>
          <h3 className="h-xxl">
            <Trans>
              Act Now: <br /> <span>Co-solution with the plastic network</span>
            </Trans>
          </h3>
          <p className="p-l">
            <Trans>
              Avoid duplication of efforts. By using the platform, you can
              collaborate with other organisations and governments to create
              shared solutions to end plastic pollution.
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
            {items.map((item) => (
              <SwiperSlide>
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
      {item.links.map((link) => (
        <Link href={link.url}>
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
  // const items = [
  //   {
  //     id: 111,
  //     badge: 'NEWS',
  //     image: '/news/watch-the-7th-international-marine-debris-conference.jpg',
  //     published_at: '2023-10-18T07:56:55.667029+00:00',
  //     title: 'WATCH: The 7th International Marine Debris Conference',
  //     excerpt:
  //       'Join a 90-minute interactive workshop, to discuss a risk assessment approach',
  //     url: '/landing',
  //   },
  //   {
  //     id: 112,
  //     badge: 'EDITORIAL',
  //     image: '/news/discover-opportunities-and-resources.jpg',
  //     published_at: null,
  //     title: 'DISCOVER: Opportunities and Resources!',
  //     excerpt:
  //       'The CASSINI EU Maritime Prize for Digital Space Applications is looking',
  //     url: '/landing',
  //   },
  //   {
  //     id: 113,
  //     badge: 'BLOGPOST',
  //     image: '/news/register-gpml-interactive-workshop.jpg',
  //     published_at: '2023-08-01T07:56:55.667029+00:00',
  //     title: 'REGISTER: GPML Interactive Workshop',
  //     excerpt:
  //       'Join a 90-minute interactive workshop, to discuss a risk assessment approach',
  //     url: '/landing',
  //   },
  // ]
  useEffect(() => {
    fetch(
      `https://unep-gpml.akvotest.org/strapi/api/posts?locale=en&populate=cover`
    )
      .then((d) => d.json())
      .then((d) => {
        console.log(transformStrapiResponse(d.data))
        setItems(transformStrapiResponse(d.data))
        setLoading(false)
      })
  }, [])
  return (
    <div className={styles.latestNews}>
      <div className="container">
        <div className="news-wrapper hide-sm">
          <strong className="caps-heading-1">HIGHLIGHTS</strong>
          <h2>
            <strong>
              <Trans>Latest news:</Trans>
            </strong>
            <br />
            <Trans>How is the network co-solutioning?</Trans>
          </h2>
        </div>
        <div className="news-wrapper hide-sm">
          <p className="p-l">
            <Trans>
              Learn about inspiring co-soluting efforts from the GPML network
              and all the other actors contributing to the plastic action
              platform.
            </Trans>
          </p>
        </div>
        <div className="news-wrapper news-items">
          {items.map((item, dx) => {
            // const badgeColor = ['blue', 'green', 'purple']
            return (
              <Card
                bordered={false}
                cover={
                  <div className="cover-image-container">
                    <div className="cover-image-overlay">
                      {/* <span className={`badge ${badgeColor?.[dx]}`}>
                        {item.badge}
                      </span> */}
                      {item.publishedAt && (
                        <span className="date">
                          <span>
                            <span className="h5 bold">
                              {moment(item.publishedAt).format('DD')}
                            </span>
                            <br />
                            <span className="month">
                              {moment(item.publishedAt).format('MMM')}
                            </span>
                          </span>
                        </span>
                      )}
                    </div>
                    <Image
                      alt={item.title}
                      src={item.cover.data.attributes.formats.medium.url}
                      width={366}
                      height={220}
                    />
                  </div>
                }
                key={dx}
              >
                <h5 className="bold">{item.title}</h5>
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

const Features = () => {
  const [width] = useDeviceSize()
  const { i18n } = useLingui()
  const items = [
    {
      title: t`Data tools`,
      key: 'data-tool',
      content: t`Access a suite of powerful data tools tailored for tackling plastic pollution and marine litter. Utilize comprehensive data sets, layers and statistics to  gain valuable insights that empower informed decision-making and drive effective action.`,
    },
    {
      label: t`Coming soon`,
      title: t`Workspace`,
      key: 'workspace-feature',
      content: t`Elevate your mission to address plastic pollution and marine litter through our integrated workspace feature. This feature enables you to coordinate with partners, centralize resources, strategize actions, and drive collective solutions`,
    },
    {
      title: t`Match-making`,
      key: 'match-making',
      content: t`Discover like-minded individuals and organizations passionate about combating plastic pollution and marine litter through our innovative matchmaking feature. Connect with fellow advocates, researchers, and activists to amplify your impact and collaborate on meaningful projects for a cleaner and healthier ocean ecosystem.`,
    },
    {
      label: t`Coming soon`,
      title: t`AI Innovations`,
      key: 'ai-innovations',
      content: t`By leveraging AI and innovation, the platform will enable proactive strategies and solutions that efficiently combat plastic pollution and marine litter`,
    },
  ]

  return (
    <section className={styles.features}>
      {width >= 1024 && (
        <div className="container">
          <div className="title-wrapper">
            <div className="title-holder">
              <div className="caps-heading-1 page-sub-heading">
                <Trans>How does it work?</Trans>
              </div>
              <h2 className="h-xxl">
                <Trans>
                  Features & Benefits <span>of using the platform</span>
                </Trans>
              </h2>
              <p className="p-l">
                <Trans>
                  The platform offers a wide range of tools to support your
                  decision-making and help a global network of actors to work
                  together to create shared solutions to end plastic pollution.
                </Trans>
              </p>
            </div>
            <div>
              <Button withArrow={<LongArrowRight />} size="large" ghost>
                <Trans>View All Features</Trans>
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="slider-container">
        <div className="slider-wrapper">
          <Swiper
            spaceBetween={20}
            slidesPerView={'auto'}
            pagination={pagination}
            modules={[Pagination]}
          >
            {items.map((item) => (
              <SwiperSlide>
                <FeatureCard item={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  )
}

const Trusted = () => {
  return (
    <div className="container">
      <div className={styles.trustedSection}>
        <div className="trusted-text">
          <h3 className="semibold">
            <Trans>
              Trusted data and information badge system and validation process.
            </Trans>
          </h3>
          <Button withArrow type="primary" size="large">
            <Trans>Discover</Trans>
          </Button>
        </div>
        <div className="trusted-circle" />
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
            <Button size="large" ghost withArrow={<LongArrowRight />}>
              <Trans>Visit the website</Trans>
            </Button>
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
                <Trans>Access to all</Trans>
              </p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

const OurVoices = () => {
  const [width] = useDeviceSize()
  return (
    <section className={styles.ourVoices}>
      <div className="container">
        <div className="title-wrapper">
          <div className="title-holder">
            <div className="caps-heading-1 page-sub-heading">Our Voices</div>
            <h2 className="h-xxl">
              Uniting Waste Pickers and Indigenous Communities:{' '}
              <span>Take Action for Sustainable Empowerment</span>
            </h2>
          </div>
        </div>
        <div className="group-wrapper">
          <div className="group-one">
            <img
              src={
                width < 768
                  ? '/voices-group-one-mobile.jpg'
                  : '/voices-group-one.jpg'
              }
            />
            <div className="group-card">
              <div className="label-s">
                <span>WASTE PICKERS</span>
              </div>
              <p className="p-l">
                Cooperative actions for Caribbean fisheries officials after a
                successful ghost gear retrieval training in Panama{' '}
              </p>
              <Button withArrow={<LongArrowRight />}>
                Explore whole story
              </Button>
            </div>
          </div>
          <div className="group-two">
            <div className="group-card">
              <div className="label-s">
                <span>Indigenous People</span>
              </div>
              <p className="p-l">
                Cooperative actions for Caribbean fisheries officials after a
                successful ghost gear retrieval training in Panama{' '}
              </p>
              <Button withArrow={<LongArrowRight />}>
                Explore whole story
              </Button>
            </div>
            <img
              src={
                width < 768
                  ? '/voices-group-two-mobile.jpg'
                  : '/voices-group-two.jpg'
              }
            />
          </div>
        </div>
      </div>
    </section>
  )
}

const Partnership = () => {
  return (
    <section className={styles.partnership}>
      <div className="container content-container">
        <div className="partnership-content-wrapper">
          <h2 className="h-xxl">
            <Trans>
              Join the Global Partnership on Plastic Pollution and Marine Litter
            </Trans>
          </h2>
          <p className="h-m">
            <Trans>
              Become part of GPML to collaborate with thousands of organisations
              and individuals from around the world
            </Trans>
          </p>
          <Button withArrow type="primary" size="large">
            <Trans>Join now</Trans>
          </Button>
        </div>
      </div>
      <div className="container links-container">
        <Row gutter={24}>
          <Col lg={8} xl={8}>
            <div className="links-card">
              <h3 className="h-m">
                <Trans>Become part of the network</Trans>
              </h3>
              <ul className="link-list">
                <li>
                  <CirclePointer />
                  <Trans>Sign Up</Trans>
                </li>
                <li>
                  <CirclePointer />
                  <Trans>Join the GPML</Trans>
                </li>
                <li>
                  <CirclePointer />
                  <Trans>Become a partnerL</Trans>
                </li>
              </ul>
            </div>
          </Col>
          <Col lg={8} xl={8}>
            <div className="links-card">
              <h3 className="h-m">
                <Trans>Co-solution with our network</Trans>
              </h3>
              <ul className="link-list">
                <li>
                  <CirclePointer />
                  <Trans>Network with others</Trans>
                </li>
                <li>
                  <CirclePointer />
                  <Trans>Share your knowledge</Trans>
                </li>
                <li>
                  <CirclePointer />
                  <Trans>Share your data</Trans>
                </li>
              </ul>
            </div>
          </Col>
          <Col lg={8} xl={8}>
            <div className="links-card">
              <Trans>
                <h3 className="h-m">Spread the word</h3>
                <p>Follow us on social media to be part of the movement. </p>
              </Trans>
              <ul className="icon-list">
                <li>
                  <a
                    href="https://ke.linkedin.com/company/global-partnership-on-marine-litter"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LinkedinIcon />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/channel/UCoWXFwDeoD4c9GoXzFdm9Bg"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <YoutubeIcon />
                  </a>
                </li>
              </ul>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  )
}

const Partners = () => {
  const items = [
    {
      id: 1,
      name: 'IMO',
      url: '/partners/partner-imo.png',
    },
    {
      id: 2,
      name: 'SEA Solutions',
      url: '/partners/partner-sea-os-solutions.png',
    },
    {
      id: 3,
      name: 'Ocean conservancy',
      url: '/partners/parner-ocean-conservancy.png',
    },
    {
      id: 4,
      name: 'FAO',
      url: '/partners/partner-fao.png',
    },
    {
      id: 5,
      name: 'INFORMEA',
      url: '/partners/partner-informea.png',
    },
    {
      id: 6,
      name: 'Duke',
      url: '/partners/partner-duke.png',
    },
    {
      id: 7,
      name: 'GESAMP',
      url: '/partners/partner-gesamp.png',
    },
  ]
  return (
    <div className={styles.partnerSection}>
      <div className="container">
        <h2 className="semibold">
          <Trans>Our partners</Trans>
        </h2>
      </div>
      <div className="partner-container">
        <ul className="partner-items">
          {items.map((item, ix) => (
            <li key={ix}>
              <Image alt={item.name} src={item.url} width={200} height={97} />
            </li>
          ))}
        </ul>
      </div>
      <div className="partner-button-container">
        <div className="container">
          <Button withArrow={<LongArrowRight />} size="large" ghost>
            <Trans>See all partners</Trans>
          </Button>
        </div>
      </div>
    </div>
  )
}

const HelpCentre = () => {
  return (
    <div className={styles.helpCentreSection}>
      <Image
        src="/globe-help-centre.svg"
        alt="CTA Help centre"
        width={64}
        height={64}
      />
      <div className="help-centre-text">
        <h2 className="bold">
          <Trans>Any Questions?</Trans>
        </h2>
        <h6 className="semibold">
          <Trans>Visit the Help Center for FAQs, tutorials and more</Trans>
        </h6>
      </div>
      <div className="help-centre-button">
        <Button withArrow={<LongArrowRight />}>
          <Trans>Visit the Help Centre</Trans>
        </Button>
      </div>
    </div>
  )
}

export const Footer = () => {
  const [form] = Form.useForm()

  const onFinish = (values) => {
    console.log('Finish:', values)
  }
  return (
    <footer className={styles.footerSection}>
      <div className="container">
        <div className="footer-items">
          <div className="footer-item">
            <strong className="p-l">GPML Digital Platform</strong>
            <div className="contact-us">
              <p className="p-m">
                <Trans>Contact Us</Trans>
              </p>
              <a href="mailto:unep-gpmarinelitter@un.org" className="p-m">
                unep-gpmarinelitter@un.org
              </a>
            </div>
          </div>
          {/* <div className="footer-item">
            <h6 className="title">About us</h6>
            <ul>
              <li>
                <Link href="/landing">Who we are</Link>
              </li>
              <li>
                <Link href="/landing">What we do</Link>
              </li>
              <li>
                <Link href="/landing">About the GPML Digital platform</Link>
              </li>
            </ul>
          </div> */}
          <div className="footer-item">
            <h6 className="title">
              <Trans>GPML Tools</Trans>
            </h6>
            <ul>
              <li>
                <Link href="/landing">
                  <Trans>Show all tools</Trans>
                </Link>
              </li>
            </ul>
          </div>
          <div className="footer-item">
            <h6 className="title">
              <Trans>Join Newsletter</Trans>
            </h6>
            <div className="footer-newsletter">
              <div>
                <p className="h-xs">
                  <Trans>
                    Stay tuned with the GPML latest news and events!
                  </Trans>
                </p>
              </div>
              <div className="newsletter-container">
                <Form
                  form={form}
                  name="newsletter"
                  layout="inline"
                  onFinish={onFinish}
                >
                  <Form.Item name="email">
                    <Input type="email" placeholder={t`Enter your email`} />
                  </Form.Item>
                  <Form.Item shouldUpdate>
                    {() => (
                      <button type="submit">
                        <ArrowRight viewBox="0 0 15 24" />
                      </button>
                    )}
                  </Form.Item>
                </Form>
              </div>
              <div>
                <h6>
                  <Trans>Follow Us</Trans>
                </h6>
                <ul className="social-links">
                  <li>
                    <a
                      href="https://ke.linkedin.com/company/global-partnership-on-marine-litter"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <LinkedinIcon />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.youtube.com/channel/UCoWXFwDeoD4c9GoXzFdm9Bg"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <YoutubeIcon />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <hr />
        <div className="footer-bar">
          <div>
            <p className="h-xxs">
              <Trans>
                Copyright © {moment().format('YYYY')} All rights reserved
              </Trans>
            </p>
          </div>
          <div className="footer-confirm-cookies">
            <Trans>
              <p className="h-xxs">We use cookies for better service.</p>
              <Button type="link">Accept</Button>
            </Trans>
          </div>
        </div>
      </div>
    </footer>
  )
}

const FeatureCard = ({ item }) => {
  return (
    <div className="feature-card">
      <div className={`card-title-container card--${item?.key}`}>
        {item?.label && <span className="card-label">{item?.label}</span>}
        <h3 className="h-l">{item.title}</h3>
      </div>
      <div className="card-content-container">
        <p className="p-l">{item?.content}</p>
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
