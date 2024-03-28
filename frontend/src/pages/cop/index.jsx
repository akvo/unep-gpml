import Head from 'next/head'
import styles from './index.module.scss'
import { PinDoc } from '../../components/icons'
import { Tag } from 'antd'
import Button from '../../components/button'

const Page = () => {
  return (
    <>
      <Head>
        <title>Communities of Practice | UNEP GPML Digital Platform</title>
      </Head>
      <div className={styles.page}>
        <div className="container">
          <div className="hero">
            <h1>Communities of Practice</h1>
            <p>
              Communities of Practice are group of experts who have shared
              interests and missions for specific topics. Each CoP provide the
              space for knowledge exchange and coordination to harness the
              potential synergies avoiding duplication. ​
            </p>
          </div>

          <div className="cop-item">
            <div className="col">
              <h3>Community of Practice on Data Harmonization</h3>
              <p>
                CoP on Data Harmonization provides scientific advisory on
                harmonization of datasets on marine litter and plastic pollution
                enabling their incorporation into and visualization on the GPML
                Digital Platform. ​
              </p>
              <div className="label">Key outcome resources</div>
              <div className="link-item">
                <PinDoc />
                Download Report
              </div>
            </div>
            <div className="col">
              <div className="label">Lead</div>
              <a href="#" className="tag-link">
                UNEP-DHI
              </a>
              <div className="label">Members</div>
              <a href="#" className="tag-link">
                University of georgia
              </a>
              <a href="#" className="tag-link">
                NOAA
              </a>
              <a href="#" className="tag-link">
                Blue Planet
              </a>
              <Button withArrow>Become a Forum Member</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
