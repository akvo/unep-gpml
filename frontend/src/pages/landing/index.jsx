import { Button, Tabs, Collapse } from 'antd'
import Image from 'next/image'
import styles from './index.module.scss'
import { CirclePointer } from '../../components/icons'
import { useState } from 'react'
import classNames from 'classnames'
import { whoAreWe } from "../../ui-text";

const Landing = () => (
  <div id="landing" className={styles.landing}>
    <Hero />
    <WhoAreWe />
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

const WhoAreWe = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState("1");
  return (
    <div className={styles.whoAreWe}>
      <div className="container">
        <div className="who-are-we-lg-md">
          <Tabs
            tabPosition="left"
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
            items={whoAreWe.map((item) => {
              return {
                label: (
                  <span className={styles.whoAreWeItem}>
                    <span className="heading-s bold">{item.title}</span>
                    <CirclePointer />
                  </span>
                ),
                key: item.id,
                children: activeTab === item.id && (
                  <div>
                    <strong className="caps-heading-1">{item.title}</strong>
                    <p className="p-l">{item.description}</p>
                  </div>
                ),
              };
            })}
          />
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
            {whoAreWe.map((item) => (
              <Collapse.Panel
                header={
                  <strong className="heading-s bold">{item.title}</strong>
                }
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
  );
};

export default Landing
