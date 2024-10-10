import { Tabs } from 'antd'
import styles from './index.module.scss'
import TagView from './tags'
import { loadCatalog } from '../../translations/utils'

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

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default Admin
