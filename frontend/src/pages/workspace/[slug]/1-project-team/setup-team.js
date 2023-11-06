import { useState } from 'react'
import { PageLayout } from '..'
import SetupTeamForm from '../../../../modules/workspace/ps/setup-team-form'
import SetupTeamTable from '../../../../modules/workspace/ps/setup-team-table'
import styles from './setup-team.module.scss'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'

const View = ({ psItem }) => {
  const [members, setMembers] = useState([])
  const [reload, setReload] = useState(false)
  return (
    <div className={styles.setupTeamView}>
      <div className="title-section">
        <h4 className="caps-heading-m">
          <Trans>National steering committee & Project Team</Trans>
        </h4>
        <h2 className="h-xxl w-bold">
          <Trans>Create Your Team</Trans>
        </h2>
      </div>
      <div className="desc-section">
        <p>
          <Trans>
            Establish a National Steering Committee (NSC) with representation
            from relevant government agencies as well as relevant
            non-governmental organisations. The NSC will aim to meet 2-4 times
            per year to assist with and drive the roadmap/strategy/plan.
            Establish a project team consisting of consultants to lead the
            implementation of the project with the guidance of the NSC and UNEP.
          </Trans>
        </p>
      </div>
      <div className="table-section">
        <h5>
          <Trans>Team members</Trans>
        </h5>
        <SetupTeamTable
          {...{ psItem, members, setMembers, reload, setReload }}
        />
      </div>
      <div className="add-member-section">
        <h5>
          <Trans>Add a New Member</Trans>
        </h5>
        <SetupTeamForm {...{ psItem, members, setReload }} />
      </div>
    </div>
  )
}

View.getLayout = PageLayout

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default View
