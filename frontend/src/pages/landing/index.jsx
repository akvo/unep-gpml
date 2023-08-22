import { Button, Tag } from 'antd'
import Image from 'next/image'
import styles from './index.module.scss'
import { CirclePointer, Magnifier, Localiser } from '../../components/icons'
import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { motion, AnimatePresence } from 'framer-motion'

const Landing = () => (
  <div id="landing" className={styles.landing}>
    <Hero />
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

export default Landing
