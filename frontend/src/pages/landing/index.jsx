import { Button, Tabs, Collapse, Tag } from 'antd'
import Image from 'next/image'
import styles from './index.module.scss'
import {
  CirclePointer,
  Magnifier,
  Localiser,
  ArrowRight,
} from '../../components/icons'
import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { motion, AnimatePresence } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { useDeviceSize } from '../../modules/landing/landing'

const Landing = () => (
  <div id="landing" className={styles.landing}>
    <Hero />
    <WhoAreWe />
    <ActNow />
    <Features />
  </div>
)

const Hero = () => {
  const [selected, setSelected] = useState('Governments')
  const [timeout, _setTimeout] = useState(true)
  const intidRef = useRef()
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
      group: 'Scientific Communities',
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
          <div className="text">
            <h1>
              Empowering
              <br />
              <b className={classNames({ timeout })}>{selected}</b>
              <br />
              to end plastic pollution
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
            <Button type="primary" size="large">
              Join Now <CirclePointer />
            </Button>
          </div>
          <div className="globe">
            <Image src="/globe.jpg" width={1022} height={770} />
            <div className="labels">
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
        </div>
      </div>
      <div className="container">
        <div className="search-bar">
          <div className="bar">
            <input
              placeholder="Search in the resource database..."
              type="text"
              className="h-m"
            />
            <div className="localisation h-xs">
              <Localiser />
              Globally
            </div>
            <Button type="primary" size="small" className="left-icon">
              <Magnifier />
              Search
            </Button>
          </div>
          <div className="tags">
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
                  <div>
                    {`${item.id}` === activeTab && (
                      <div>
                        <strong className="caps-heading-1">{item.title}</strong>
                        <p className="p-l">{item.description}</p>
                      </div>
                    )}
                  </div>
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
            expandIcon={({ isActive }) => (
              <CirclePointer rotate={isActive ? -90 : 90} />
            )}
            accordion
          >
            {items.map((item) => (
              <Collapse.Panel
                header={<strong className="h6 bold">{item.title}</strong>}
                key={`${item.id}`}
              >
                {activeAccordion === `${item.id}` && (
                  <p className="p-s">{item.description}</p>
                )}
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
      linkText: 'Track progress',
      content:
        'Join others in coordinating efforts towards shared plastic solutions. From data to capacity development communities',
      bgColor: 'purple',
      singleLink: true,
      title: 'Communities of practise',
    },
    {
      bgColor: 'green',
      content:
        'Reduce your country’s footprint. Create and advance your plastic startegy.',
      linkText: 'Track progress',
      title: 'Plastic Strategies',
      linkTextTwo: 'Track action',
    },
    {
      bgColor: 'violet',
      content:
        'Join others in coordinating efforts towards shared plastic solutions. From data to capacity development communities',
      singleLink: true,
      title: 'Communities of practise',
      linkText: 'Track progress',
      badge: true,
    },
    {
      bgColor: 'blue',
      content:
        'Start your own initiative. get inspired by others who are making progress to end plastic pollution.',
      linkText: 'Track progress',
      title: 'Country Progress',
      linkTextTwo: 'Track action',
    },
  ]
  return (
    <section className={styles.actNow}>
      <div className="container act-now-container">
        <div className="wrapper">
          <PageHeading title="Why should I care?" />
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
            pagination={{
              clickable: true,
            }}
          >
            {items.map((item) => (
              <SwiperSlide>
                <ActNowCard item={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  )
}

const PageHeading = ({ title }) => (
  <div className="caps-heading-1 page-sub-heading">{title}</div>
)

const ActNowCard = ({ item }) => (
  <div className={`card card--${item?.bgColor}`}>
    {item?.badge && <span className="card-badge">Coming soon</span>}
    <h2 className="h-m">{item?.title}</h2>
    <p className="p-s">{item?.content}</p>
    {item?.singleLink ? (
      <div className="single-link">
        <Button type="link">
          {item?.linkText} <ArrowRight />
        </Button>
      </div>
    ) : (
      <div className="multiple-link">
        <Button type="link">
          {item?.linkText} <ArrowRight />
        </Button>
        <Button type="link">
          {item?.linkTextTwo} <ArrowRight />
        </Button>
      </div>
    )}
  </div>
)

const Features = () => {
  const items = [
    {
      title: 'Data tools',
      content:
        'Access a suite of powerful data tools tailored for tackling plastic pollution and marine litter. Utilize comprehensive data sets, layers and statistics to  gain valuable insights that empower informed decision-making and drive effective action.',
    },
    {
      title: 'Workspace',
      content:
        'Elevate your mission to address plastic pollution and marine litter through our integrated workspace feature. This feature enables you to coordinate with partners, centralize resources, strategize actions, and drive collective solutions',
    },
    {
      title: 'Match-making',
      content:
        'Discover like-minded individuals and organizations passionate about combating plastic pollution and marine litter through our innovative matchmaking feature. Connect with fellow advocates, researchers, and activists to amplify your impact and collaborate on meaningful projects for a cleaner and healthier ocean ecosystem.',
      badge: true,
    },
    {
      title: 'Match-making two',
      content:
        'Discover like-minded individuals and organizations passionate about combating plastic pollution and marine litter through our innovative matchmaking feature. Connect with fellow advocates, researchers, and activists to amplify your impact and collaborate on meaningful projects for a cleaner and healthier ocean ecosystem.',
    },
  ]
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="title-wrapper">
          <div className="title-holder">
            <PageHeading title="HOW DOES IT WORK?" />
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
            <Button type="default" size="large">
              View All Features <ArrowRight />
            </Button>
          </div>
        </div>
        <div className="slider-wrapper">
          <Swiper
            spaceBetween={20}
            slidesPerView={'auto'}
            pagination={{
              clickable: true,
            }}
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

const FeatureCard = ({ badge }) => {
  return (
    <div className="feature-card">
      <div className="card-title-container">
        {badge && <span className="card-badge">Coming soon</span>}
      </div>
    </div>
  )
}

export default Landing
