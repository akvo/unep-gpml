import styles from './ps.module.scss'

const View = () => (
  <div className={styles.plasticStrategyView}>
    <div className={styles.sidebar}>
      <div className="head">
        <div className="caps-heading-s">plastic strategy</div>
        <h5 className="h-m m-semi">South Africa</h5>
        <div className="progress-bar">
          <div className="fill" style={{ width: '20%' }}></div>
        </div>
      </div>
    </div>
  </div>
)

export default View
