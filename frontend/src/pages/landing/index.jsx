import { Tabs, Collapse, Card, Tag, Input, Col, Row, Form } from 'antd'
import Image from 'next/image'
import Link from 'next/link'
import styles from './index.module.scss'
import {
  CirclePointer,
  Magnifier,
  Localiser,
  ArrowRight,
  LinkedinIcon,
  YoutubeIcon,
} from '../../components/icons'
import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { motion, AnimatePresence } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper'
import moment from 'moment'
import { useDeviceSize } from '../../modules/landing/landing'
import Button from '../../components/button'

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
    <OurVoices />
    <Partnership />
    <Partners />
    <HelpCentre />
    <Footer />
  </div>
)

const Hero = () => {
  const [selected, setSelected] = useState('Governments')
  const [timeout, _setTimeout] = useState(true)
  const intidRef = useRef()
  const [width] = useDeviceSize()
  const items = [
    {
      group: 'Governments',
      text:
        'The plastic action platform empowers all countries to create and implement successful plastic strategies to end plastic pollution.',
    },
    {
      group: 'Private Sector',
      text:
        'The GPML digital platform fosters public-private partnerships, offers clarity on circular economy practices, and provides guidance on Extended Producer Responsibilities (EPRs) and sustainable business models.',
    },
    {
      group: 'Scientific Community',
      text:
        'The GPML digital platform helps academia and the scientific community to ensure their research becomes actionable by offering the opportunity to share resources and collaborate with policy makers.',
    },
    {
      group: 'NGOs',
      text:
        'The GPML digital platform helps academia and the scientific community to ensure their research becomes actionable by offering the opportunity to share resources and collaborate with policy makers.',
    },
    {
      group: 'IGOs',
      text:
        'The GPML digital platform offers the opportunity to forge collaborative partnerships with diverse stakeholders, share and find resources on plastic pollution, and amplify advocacy.',
    },
    {
      group: 'Civil Society',
      text:
        'The GPML digital platform allows NGOS and civil society to connect with likeminded organizations, discover financing resources and funding opportunities, and showcase their work in the fight against plastic pollution and marine litter.',
    },
  ]
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
              Empowering
              <br />
              <b className={classNames({ timeout })}>{selected}</b>
              <br />
              to address plastic pollution
            </h1>
            <div className="p-container">
              {items.map((item) => (
                <AnimatePresence>
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
              Join Now
            </Button>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="search-bar">
          <div className="bar">
            <Input
              prefix={width < 768 && <Magnifier />}
              placeholder="Search the resource database..."
              type="text"
            />
            <div className="localisation h-xs">
              <Localiser />
              <span className="hide-mobile">Globally</span>
            </div>
            <Button
              type="primary"
              size="small"
              className="left-icon hide-mobile"
            >
              <Magnifier />
              Search
            </Button>
          </div>
          <Button type="primary" className="hide-desktop noicon">
            Search
          </Button>
          <div className="tags hide-mobile">
            <b>Suggested search:</b>
            <Tag className="h-xxs">Case Studies</Tag>
            <Tag className="h-xxs">Plastic Strategies</Tag>
            <Tag className="h-xxs">Plastic Solutions</Tag>
          </div>
        </div>
      </div>
    </>
  )
}

const ShowcasingAndStats = () => {
  const items = [
    {
      value: '2370',
      label: 'NUMBER OF RESOURCES',
    },
    {
      value: '300',
      label: 'DATA LAYERS',
    },
    {
      value: '70',
      label: 'ACTION PLANS',
    },
    {
      value: '45K',
      label: 'COMMUNITIES OF PRACTICE',
    },
  ]
  return (
    <div className="container">
      <div className={styles.showCasingSection}>
        <div className="caption-container">
          <div className="caps-heading-1 page-sub-heading">SHOWCASING</div>
          <h2>Already on the platform</h2>
        </div>
        <div className="powered-by-container">
          <div className="caps-heading-1 page-sub-heading">POWERED BY:</div>
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
            <h5>195 Governements</h5>
          </span>
          <span className="green">
            <h5>1358 Organizations</h5>
          </span>
          <span className="blue">
            <h5>1251 Individuals</h5>
          </span>
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
      title: 'Who are we?',
      description:
        'The Global Partnership on Plastic Pollution and Marine Litter (GPML) Digital Platform is a multi-stakeholder, knowledge sharing and networking tool which aims to facilitate action on plastic pollution and marine litter reduction and prevention.',
    },
    {
      id: 2,
      title: 'What we do?',
      description:
        'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolor sapiente maiores consequuntur provident ad a earum consectetur saepe at dicta beatae commodi incidunt deleniti inventore, natus id ullam modi omnis.',
    },
    {
      id: 3,
      title: 'What is the connection between this platform and GPML?',
      description:
        'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolor sapiente maiores consequuntur provident ad a earum consectetur saepe at dicta beatae commodi incidunt deleniti inventore, natus id ullam modi omnis.',
    },
    {
      id: 4,
      title: 'Why to join the partnership?',
      description:
        'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolor sapiente maiores consequuntur provident ad a earum consectetur saepe at dicta beatae commodi incidunt deleniti inventore, natus id ullam modi omnis.',
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
      content:
        'Start your own initiative. Get inspired by others who are making progress to end plastic pollution.',
      bgColor: 'purple',
      title: (
        <>
          Case
          <br />
          Studies
        </>
      ),
      links: [{ label: 'Track progress', url: '#' }],
    },
    {
      bgColor: 'green',
      content:
        'Reduce your country’s footprint. Create and advance your plastic startegy.',
      title: 'Plastic Strategies',
      links: [
        { label: 'Track progress', url: '#' },
        { label: 'Track action', url: '#' },
      ],
    },
    {
      bgColor: 'violet',
      content:
        'Join others in coordinating efforts towards shared plastic solutions. From data to capacity development communities',
      title: 'Communities of practise',
      label: 'Coming soon',
      links: [{ label: 'Track progress', url: '#' }],
    },
    {
      bgColor: 'blue',
      content:
        'Start your own initiative. get inspired by others who are making progress to end plastic pollution.',
      title: 'Country Progress',
      links: [
        { label: 'Track progress', url: '#' },
        { label: 'Track action', url: '#' },
      ],
    },
  ]
  return (
    <div className={styles.actNow}>
      <div className="container act-now-container">
        <div className="wrapper">
          <div className="caps-heading-1 page-sub-heading">Why us?</div>
          <h3 className="h-xxl">
            Act Now: <br /> <span>Co-solution with the plastic network</span>
          </h3>
          <p className="p-l">
            Avoid duplication of efforts. By using the platform you can match
            with other organisations and governments to create shared solutions
            to end plastic pollution.
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
        <Button type="link" withArrow>
          {link.label}
        </Button>
      ))}
    </div>
  </div>
)

const LatestNews = () => {
  const items = [
    {
      id: 111,
      badge: 'NEWS',
      image: '/news/watch-the-7th-international-marine-debris-conference.jpg',
      published_at: '2023-10-18T07:56:55.667029+00:00',
      title: 'WATCH: The 7th International Marine Debris Conference',
      excerpt:
        'Join a 90-minute interactive workshop, to discuss a risk assessment approach',
      url: '/landing',
    },
    {
      id: 112,
      badge: 'EDITORIAL',
      image: '/news/discover-opportunities-and-resources.jpg',
      published_at: null,
      title: 'DISCOVER: Opportunities and Resources!',
      excerpt:
        'The CASSINI EU Maritime Prize for Digital Space Applications is looking',
      url: '/landing',
    },
    {
      id: 113,
      badge: 'BLOGPOST',
      image: '/news/register-gpml-interactive-workshop.jpg',
      published_at: '2023-08-01T07:56:55.667029+00:00',
      title: 'REGISTER: GPML Interactive Workshop',
      excerpt:
        'Join a 90-minute interactive workshop, to discuss a risk assessment approach',
      url: '/landing',
    },
  ]
  return (
    <div className={styles.latestNews}>
      <div className="container">
        <div className="news-wrapper hide-sm">
          <strong className="caps-heading-1">HIGHLIGHTS</strong>
          <h2>
            <strong>Latest news:</strong>
            <br />
            How is the network co-solutioning?
          </h2>
        </div>
        <div className="news-wrapper hide-sm">
          <p className="p-l">
            Learn about inspiring co-soluting efforts from the GPML network and
            all the other actors contributing to the plastic action platform.
          </p>
        </div>
        <div className="news-wrapper news-items">
          {items.map((item, dx) => {
            const badgeColor = ['blue', 'green', 'purple']
            return (
              <Card
                bordered={false}
                cover={
                  <div className="cover-image-container">
                    <div className="cover-image-overlay">
                      <span className={`badge ${badgeColor?.[dx]}`}>
                        {item.badge}
                      </span>
                      {item.published_at && (
                        <span className="date">
                          <span>
                            <span className="h5 bold">
                              {moment(item.published_at).format('DD')}
                            </span>
                            <br />
                            <span className="month">
                              {moment(item.published_at).format('MMM')}
                            </span>
                          </span>
                        </span>
                      )}
                    </div>
                    <Image
                      alt={item.title}
                      src={item.image}
                      width={366}
                      height={220}
                    />
                  </div>
                }
                key={dx}
              >
                <h5 className="bold">{item.title}</h5>
                <p className="p-m">{item.excerpt}</p>
                <Link href={item.url}>
                  <Button type="link" withArrow>
                    Read More
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
  const items = [
    {
      title: 'Data tools',
      key: 'data-tool',
      content:
        'Access a suite of powerful data tools tailored for tackling plastic pollution and marine litter. Utilize comprehensive data sets, layers and statistics to  gain valuable insights that empower informed decision-making and drive effective action.',
    },
    {
      label: 'Coming soon',
      title: 'Workspace',
      key: 'workspace-feature',
      content:
        'Elevate your mission to address plastic pollution and marine litter through our integrated workspace feature. This feature enables you to coordinate with partners, centralize resources, strategize actions, and drive collective solutions',
    },
    {
      title: 'Match-making',
      key: 'match-making',
      content:
        'Discover like-minded individuals and organizations passionate about combating plastic pollution and marine litter through our innovative matchmaking feature. Connect with fellow advocates, researchers, and activists to amplify your impact and collaborate on meaningful projects for a cleaner and healthier ocean ecosystem.',
    },
    {
      label: 'Coming soon',
      title: 'AI Innovations',
      key: 'ai-innovations',
      content:
        'By leveraging AI and innovation, the platform will enable proactive strategies and solutions that efficiently combat plastic pollution and marine litter',
    },
  ]

  return (
    <section className={styles.features}>
      {width >= 1024 && (
        <div className="container">
          <div className="title-wrapper">
            <div className="title-holder">
              <div className="caps-heading-1 page-sub-heading">
                How does it work?
              </div>
              <h2 className="h-xxl">
                Features & Benefits <span>of using the platform</span>
              </h2>
              <p className="p-l">
                The platform offers a wide range of tools to support your
                decision-making and help a global network of actors to work
                together to create shared solutions to end plastic pollution.
              </p>
            </div>
            <div>
              <Button withArrow size="large" ghost>
                View All Features
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
            Trusted data and information badge system and validation process.
          </h3>
          <Button withArrow type="primary" size="large">
            Discover
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
              WHAT IS THE FOCUS OF GPML?
            </div>
            <h2 className="h-xxl">
              <span>GPML’s</span> Action Tracks
            </h2>
            <p className="p-l">
              The current core work of the GPML is organized through the
              following five Action Tracks, with the aim of advancing priority
              issues by connecting key stakeholders and facilitating
              collaboration and coordination. The platform offers a wide range
              of tools to facilitate this work.
            </p>
          </div>
          <div>
            <Button size="large" ghost withArrow>
              Visit the website
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
                Science
                <br />
                policy
              </p>
            </li>
            <li>
              <div className="icon">
                <img src="/activity-bookmark.svg" />
              </div>
              <p className="h-m">Guidelines standards & harmonization</p>
            </li>
            <li>
              <div className="icon">
                <img src="/activity-money.svg" />
              </div>
              <p className="h-m">Sustainable & innovative financing</p>
            </li>
            <li>
              <div className="icon">
                <img src="/activity-plans.svg" />
              </div>
              <p className="h-m">National action plans</p>
            </li>
            <li>
              <div className="icon">
                <img src="/activity-access.svg" />
              </div>
              <p className="h-m">Access to all</p>
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
              <Button withArrow>Explore whole story</Button>
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
              <Button withArrow>Explore whole story</Button>
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
            Join the Global Partnership on Plastic Pollution and Marine Litter
          </h2>
          <p className="h-m">
            Become part of GPML to collaborate with thousands of organisations
            and individuals from around the world
          </p>
          <Button withArrow type="primary" size="large">
            Join now
          </Button>
        </div>
      </div>
      <div className="container links-container">
        <Row gutter={24}>
          <Col lg={8} xl={8}>
            <div className="links-card">
              <h3 className="h-m">Become part of the network</h3>
              <ul className="link-list">
                <li>
                  <CirclePointer />
                  Sign Up
                </li>
                <li>
                  <CirclePointer />
                  Join the GPML
                </li>
                <li>
                  <CirclePointer />
                  Become a partnerL
                </li>
              </ul>
            </div>
          </Col>
          <Col lg={8} xl={8}>
            <div className="links-card">
              <h3 className="h-m">Co-solution with our network</h3>
              <ul className="link-list">
                <li>
                  <CirclePointer />
                  Network with others
                </li>
                <li>
                  <CirclePointer />
                  Share your knowledge
                </li>
                <li>
                  <CirclePointer />
                  Share your data
                </li>
              </ul>
            </div>
          </Col>
          <Col lg={8} xl={8}>
            <div className="links-card">
              <h3 className="h-m">Spread the word</h3>
              <p>Follow us on social media to be part of the movement. </p>
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
        <h2 className="semibold">Our partners</h2>
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
          <Button withArrow size="large" ghost>
            See all partners
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
        <h2 className="bold">Any Questions?</h2>
        <h6 className="semibold">
          Visit the Help Center for FAQs, tutorials and more
        </h6>
      </div>
      <div className="help-centre-button">
        <Button withArrow>Visit the Help Centre</Button>
      </div>
    </div>
  )
}

const Footer = () => {
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
              <p className="p-m">Contact Us</p>
              <a href="mailto:unep-gpmarinelitter@un.org" className="p-m">
                unep-gpmarinelitter@un.org
              </a>
            </div>
          </div>
          <div className="footer-item">
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
          </div>
          <div className="footer-item">
            <h6 className="title">GPML Tools</h6>
            <ul>
              <li>
                <Link href="/landing">Show all tools</Link>
              </li>
            </ul>
          </div>
          <div className="footer-item">
            <h6 className="title">Join Newsletter</h6>
            <div className="footer-newsletter">
              <div>
                <p className="h-xs">
                  Stay tuned with the GPML latest news and events!
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
                    <Input type="email" placeholder="Enter your email" />
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
                <h6>Follow Us</h6>
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
              Copyright © {moment().format('YYYY')} All rights reserved
            </p>
          </div>
          <div className="footer-confirm-cookies">
            <p className="h-xxs">We use cookies for better service.</p>
            <Button type="link">Accept</Button>
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

export default Landing
