import { Tabs } from 'antd'
import styles from './index.module.scss'
import TagView from './tags'
import { loadCatalog } from '../../translations/utils'
import ResourceView from './resource'
import OrganisationView from './organisation'
import IndividualsView from './individuals'
import GeographyView from './geography'
import withAuth from '../../components/withAuth'

const Admin = ({ isAuthenticated, setLoginVisible, profile }) => {
  return (
    <div className={styles.admin}>
      <div className="container">
        <Tabs defaultActiveKey="tags" type="card" size="large">
          <Tabs.TabPane tab="Tags" key="tags">
            <TagView />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Geography" key="geography">
            <GeographyView {...{ isAuthenticated, setLoginVisible, profile }} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Resources" key="resources">
            <ResourceView {...{ isAuthenticated, setLoginVisible, profile }} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Organisations" key="organisations">
            <OrganisationView
              {...{ isAuthenticated, setLoginVisible, profile }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Individuals" key="individuals">
            <IndividualsView
              {...{ isAuthenticated, setLoginVisible, profile }}
            />
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

export default withAuth(Admin)
