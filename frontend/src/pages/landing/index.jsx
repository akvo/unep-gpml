// import './index.module.scss';
import { Button } from 'antd'
import styles from './index.module.scss'
import { CirclePointer } from '../../components/icons'

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
  </div>
)



export default Landing