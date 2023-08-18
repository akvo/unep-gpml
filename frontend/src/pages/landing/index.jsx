// import './index.module.scss';
import { Button } from 'antd'
import styles from './index.module.scss'
import { CirclePointer } from '../../components/icons'
import { VerticalTabs } from '../../components/vertical-tabs';

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
            <VerticalTabs.Item>Who are we?</VerticalTabs.Item>
            <VerticalTabs.Item>What we do?</VerticalTabs.Item>
            <VerticalTabs.Item>
              What is the connection between this platform and GPML?
            </VerticalTabs.Item>
            <VerticalTabs.Item>Why to join the partnership?</VerticalTabs.Item>
          </VerticalTabs.Items>
          <VerticalTabs.Content>
            <div className={styles.verticalTabsContent}>
              <strong>Who are we?</strong>
              <h2>
                <strong>The #1 global platform</strong>
                <br />
                on plastic pollution decisions.
              </h2>
              <p>
                The plastic action platform brings decision-making power to
                countries and active organisations by integrating data,
                crowdsourcing knowledge, and fostering collaborations to co-create
                and advance solutions to end plastic pollution.
              </p>
            </div>
          </VerticalTabs.Content>
        </VerticalTabs>
      </div>
    </div>
  </div>
)



export default Landing