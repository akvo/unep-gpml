// import './index.module.scss';
import { Button } from 'antd'
import styles from './index.module.scss'
import { CirclePointer } from '../../components/icons'
import { VerticalTabs } from '../../components/vertical-tabs';
import { whoAreWe } from '../../ui-text'

const Landing = () => (
  <div id="landing" className={styles.landing}>
    <div className="hero">
      <div className="container">
        <div className="text">
          <h1>Empowering <b>governments</b><br />to end plastic pollution</h1>
          <p className="p-l">The plastic action platform empowers all countries to create and implement successful plastic strategies to end plastic pollution.</p>
          <Button type="primary" size="large">Join Now <CirclePointer /></Button>
        </div>
      </div>
    </div>
    <div id="who-are-we">
      <div className="container">
        <VerticalTabs>
          <VerticalTabs.Items>
            {whoAreWe.navs.map((nav, nx) => (
              <VerticalTabs.Item className={styles.verticalTabsItem} key={nx} tabKey={nx}>
                <span>{nav.text}</span>
                <CirclePointer />
              </VerticalTabs.Item>
            ))}
          </VerticalTabs.Items>
          {whoAreWe.contents.map((content, cx) => (
            <VerticalTabs.Content key={cx} tabKey={cx}>
              <div className={styles.verticalTabsContent}>
                <strong>{content?.caption}</strong>
                <h2>
                  <strong>{content?.heading?.strong}</strong>
                  <br />
                  {content?.heading?.text}
                </h2>
                <p>{content?.text}</p>
              </div>
            </VerticalTabs.Content>
          ))}
        </VerticalTabs>
      </div>
    </div>
  </div>
);


export default Landing