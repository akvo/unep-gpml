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
  Pointer,
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
import { useRouter } from 'next/router'
import {
  getStrapiUrl,
  stripHtml,
  transformStrapiResponse,
  useQuery,
} from '../../utils/misc'
import LocationDropdown from '../../components/location-dropdown/location-dropdown'
import CountryTransnationalFilter from '../../components/select/country-transnational-filter'
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
      {/* <Features /> */}
      {/* <Trusted /> */}
      <Activities />
      {/* <OurVoices /> */}
      {/* <Partnership {...props} /> */}
      <Partners />
      {/* <HelpCentre /> */}
    </div>
  )
}

const Hero = ({ setLoginVisible, isAuthenticated }) => {
  const query = useQuery()
  const [selected, setSelected] = useState('Governments')
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const [country, setCountry] = useState([])
  const [multiCountry, setMultiCountry] = useState([])
  const [disable, setDisable] = useState({
    country: false,
    multiCountry: false,
  })
  const [timeout, _setTimeout] = useState(true)
  const [filter, setFilter] = useState({})
  const [filterCountries, setFilterCountries] = useState([])
  const [value, setValue] = useState('')
  const [multiCountryCountries, setMultiCountryCountries] = useState([])

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
  const tags = UIStore.useState((s) => s.tags)
  const { countries, transnationalOptions } = UIStore.useState((s) => ({
    countries: s.countries,
    transnationalOptions: s.transnationalOptions,
  }))
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
    'Report & Assessment',
    'Circularity',
    'Plastics',
    'Waste management',
    'Courses & Trainings',
    'National Action Plans',
  ]
  const maxTags = 6

  const { locale } = router

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

  function removeEmptyKeys(obj) {
    return Object.fromEntries(
      Object.entries(obj).filter(([key, value]) => {
        if (Array.isArray(value)) {
          return value.length > 0
        }
        return value !== null && value !== undefined && value !== ''
      })
    )
  }

  const handleOnSearch = () => {
    if (!filter?.tag && country.length === 0 && multiCountry.length === 0) {
      return
    }

    const data = {
      tag: filter?.tag?.toLowerCase(),
      country: country,
      transnational: multiCountry,
    }

    const cleanedData = removeEmptyKeys(data)

    router.push({
      pathname: '/knowledge/library',
      query: cleanedData,
    })
  }

  const countryOpts = countries
    ?.filter((country) => country.description.toLowerCase() === 'member state')
    ?.map((it) => ({ value: it.id, label: it.name }))
    ?.sort((a, b) => a.label.localeCompare(b.label))

  const updateQuery = (param, value, paramValueArr) => {
    if (param === 'country') {
      setDisable({
        ...disable,
        ...(value ? { multiCountry: true } : { multiCountry: false }),
      })
      setCountry(value)
      setFilterCountries(value?.toString())
      const find = countryOpts.find((item) => item.value === value)
      setValue(find ? find.label : '')
    }
    if (param === 'transnational') {
      setDisable({
        ...disable,
        ...(value ? { country: true } : { country: false }),
      })
      if (!value) {
        setFilterCountries('')
      }
      setMultiCountry(value)

      const find = transnationalOptions.find((item) => item.id === value)
      setValue(find ? find.name : '')
    }
  }

  const countryList = (
    <CountryTransnationalFilter
      {...{
        query,
        updateQuery,
        multiCountryCountries,
        setMultiCountryCountries,
      }}
      country={country || []}
      multiCountry={multiCountry || []}
      multiCountryLabelCustomIcon={true}
      isExpert={true}
      disable={disable}
    />
  )

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
  const { isAuthenticated, setLoginVisible } = props
  const { stakeholders, organisations, community } = UIStore.useState((s) => ({
    stakeholders: s.stakeholders,
    organisations: s.organisations,
    community: s.community,
  }))

  const [expertsCount, setExpertsCount] = useState(0)

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

  const { i18n } = useLingui()
  const items = [
    {
      value: totalCount,
      label: i18n._(t`NUMBER OF RESOURCES`),
    },
    {
      value: props?.layers,
      label: t`DATA LAYERS`,
    },
    {
      value:
        props?.data?.find((item) => item.topic === 'action_plan').count || 0,
      label: t`ACTION PLANS`,
    },
    {
      value: props?.cop,
      label: t`COMMUNITIES OF PRACTICE`,
    },
  ]

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
      {/* <div className={styles.statsSection}>
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
          <span className="green">
            <h5>
              {organisations?.length} <Trans>Member Organizations</Trans>
            </h5>
          </span>
          <span className="blue">
            <h5>
              {stakeholders?.stakeholders?.length
                ? stakeholders?.stakeholders?.length
                : 0}{' '}
              <Trans>Individuals</Trans>
            </h5>
          </span>
        </div>
      </div> */}
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
      title: t`National Action Plans`,
      links: [
        {
          label: t`Discover`,
          url: '/knowledge/library/map/action-plan',
        },
        { label: t`Add`, url: '/flexible-forms' },
      ],
    },
    {
      bgColor: 'violet',
      content: t`Join others in coordinating efforts towards shared plastic solutions. From data to capacity development communities`,
      title: t`Communities of practise`,
      links: [{ label: t`Join and collaborate`, url: '/cop' }],
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
          <div className="caps-heading-1 page-sub-heading">
            <Trans>Why us?</Trans>
          </div>
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
            // const badgeColor = ['blue', 'green', 'purple']
            return (
              <Card
                bordered={false}
                cover={
                  <div className="cover-image-container">
                    <div className="cover-image-overlay"></div>
                    <Link href={`/post/${item.id}-${item.slug}`}>
                      <Image
                        alt={item.title}
                        src={item.cover.data?.attributes?.formats?.medium.url}
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
      title: t`Workspace`,
      key: 'workspace-feature',
      content: `${t`Elevate your mission to address plastic pollution and marine litter through our integrated workspace feature. This feature enables you to coordinate with partners, centralize resources, strategize actions, and drive collective solutions`}.`,
    },
    {
      label: t`Coming soon`,
      title: t`Match-making`,
      key: 'match-making',
      content: t`Discover like-minded individuals and organizations passionate about combating plastic pollution and marine litter through our innovative matchmaking feature. Connect with fellow advocates, researchers, and activists to amplify your impact and collaborate on meaningful projects for a cleaner and healthier ocean ecosystem.`,
    },
    // {
    //   title: t`AI Innovations`,
    //   key: 'ai-innovations',
    //   content: t`By leveraging AI and innovation, the platform will enable proactive strategies and solutions that efficiently combat plastic pollution and marine litter`,
    // },
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
            {/* <div>
              <Button withArrow={<LongArrowRight />} size="large" ghost>
                <Trans>View All Features</Trans>
              </Button>
            </div> */}
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
            {items.map((item, index) => (
              <SwiperSlide key={index}>
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
              Trusted data, Information badge system and Validation process.
            </Trans>
          </h3>
          <a
            target="_blank"
            href="https://docs.google.com/presentation/d/e/2PACX-1vSi-8jTrnk3Lj7ieb-z2Hy-FIHE4jQhZyRjonWWOlYgPb2Mu5suUyPPfwylZR_7zDyIJE7kGNkfghTM/pub?start=false&loop=false&delayms=60000"
          >
            <Button withArrow type="primary" size="large">
              <Trans>Discover</Trans>
            </Button>
          </a>
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

const Partnership = ({ isAuthenticated, setLoginVisible }) => {
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
      <div className="container links-container">
        <Row gutter={24}>
          <Col lg={8} xl={8}>
            <div className="links-card">
              <h3 className="h-m">
                <Trans>Become part of the network</Trans>
              </h3>
              <ul className="link-list">
                <li onClick={() => setLoginVisible(true)}>
                  <CirclePointer />
                  <Trans>Sign Up</Trans>
                </li>
                <li>
                  <CirclePointer />
                  <Link href="/partnership">
                    <Trans>Join the GPML</Trans>
                  </Link>
                </li>
                <li>
                  <CirclePointer />
                  <Link href="/page/membership">
                    <Trans>Become a partner</Trans>
                  </Link>
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
                  <Link href="/community">
                    <Trans>Network with others</Trans>
                  </Link>
                </li>
                <li>
                  <CirclePointer />
                  <Link
                    href={
                      isAuthenticated ? '/flexible-forms' : '/knowledge-library'
                    }
                  >
                    <Trans>Share your knowledge</Trans>
                  </Link>
                </li>
                <li>
                  <CirclePointer />
                  <a
                    href={
                      isAuthenticated
                        ? 'https://unepazecosysadlsstorage.z20.web.core.windows.net/add-data'
                        : 'https://unepazecosysadlsstorage.z20.web.core.windows.net/'
                    }
                  >
                    <Trans>Share your data</Trans>
                  </a>
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
        <a href="mailto:unep-gpmarinelitter@un.org">
          <Button withArrow={<LongArrowRight />}>
            <Trans>Contact Us</Trans>
          </Button>
        </a>
      </div>
    </div>
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
        <p className="p-m">{item?.content}</p>
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
