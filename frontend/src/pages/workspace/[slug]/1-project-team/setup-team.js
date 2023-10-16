import { useState } from 'react'
import { PageLayout } from '..'
import SetupTeamForm from '../../../../modules/workspace/ps/setup-team-form'
import SetupTeamTable from '../../../../modules/workspace/ps/setup-team-table'
import styles from './setup-team.module.scss'

const View = ({ psItem }) => {
  const [members, setMembers] = useState([])
  return (
    <div className={styles.setupTeamView}>
      <div className="title-section">
        <h4 className="caps-heading-m">
          National steering committee & Project Team
        </h4>
        <h2 className="h-xxl w-bold">Create Your Team</h2>
      </div>
      <div className="desc-section">
        <p>
          Establish a National Steering Committee (NSC) with representation from
          relevant government agencies as well as relevant non-governmental
          organisations. The NSC will aim to meet 2-4 times per year to assist
          with and drive the roadmap/strategy/plan. Establish a project team
          consisting of consultants to lead the implementation of the project
          with the guidance of the NSC and UNEP
        </p>
      </div>
      <div className="table-section">
        <h5>Team members</h5>
        <SetupTeamTable {...{ psItem, members, setMembers }} />
      </div>
      <div className="add-member-section">
        <h5>Add a New Member</h5>
        <SetupTeamForm {...{ psItem, members, setMembers }} />
      </div>
    </div>
  )
}

View.getLayout = PageLayout

export default View
