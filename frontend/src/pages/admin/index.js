import { Tabs } from 'antd'
import styles from './index.module.scss'
import TagView from './tags'

const Admin = () => {
  return (
    <div className={styles.admin}>
      <div className="container">
        <Tabs defaultActiveKey="tags" type="card" size="large">
          <Tabs.TabPane tab="Tags" key="tags">
            <TagView />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Resources" key="resources">
            sample content...
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  )
}

export default Admin
