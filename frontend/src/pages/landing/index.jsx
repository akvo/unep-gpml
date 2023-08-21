import { Button } from 'antd'
import Image from 'next/image'
import styles from './index.module.scss'
import { CirclePointer } from '../../components/icons'
import { useState } from 'react'
import classNames from 'classnames'

const Landing = () => (
  <div id="landing" className={styles.landing}>
    <Hero />
  </div>
)

const Hero = () => {
  const [selected, setSelected] = useState('Governments')
  const items = [
    {group: 'Governments', text: 'The plastic action platform empowers all countries to create and implement successful plastic strategies to end plastic pollution.'},
    {group: 'Private Sector', text: 'The GPML digital platform fosters public-private partnerships, offers clarity on circular economy practices, and provides guidance on Extended Producer Responsibilities (EPRs) and sustainable business models.'},
    {group: 'Scientific Community', text: 'The GPML digital platform helps academia and the scientific community to ensure their research becomes actionable by offering the opportunity to share resources and collaborate with policy makers.'},
    {group: 'NGOs', text: 'The GPML digital platform helps academia and the scientific community to ensure their research becomes actionable by offering the opportunity to share resources and collaborate with policy makers.'},
    {group: 'IGOs', text: 'The GPML digital platform offers the opportunity to forge collaborative partnerships with diverse stakeholders, share and find resources on plastic pollution, and amplify advocacy.'},
    {group: 'Civil Society', text: 'The GPML digital platform allows NGOS and civil society to connect with likeminded organizations, discover financing resources and funding opportunities, and showcase their work in the fight against plastic pollution and marine litter.'}
  ]
  return (
    <div className="hero">
      <div className="container">
        <div className="text">
          <h1>Empowering<br /><b>{selected}</b><br />to end plastic pollution</h1>
          <p className="p-l">{items.find(item => item.group === selected)?.text}</p>
          <Button type="primary" size="large">Join Now <CirclePointer /></Button>
        </div>
        <div className="globe">
          <Image src="/globe.jpg" width={1022} height={770} />
          <div className="labels">
            {items.map(item =>
              <div onClick={() => setSelected(item.group)} key={item.group} className={classNames(`label l-${item.group.toLowerCase().replace(' ', '-')}`, { selected: selected === item.group})}><span>{item.group}</span></div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


export default Landing