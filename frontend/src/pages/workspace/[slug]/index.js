import NestedLayout from './layout'
import NewLayout from '../../../layouts/new-layout'
import style from './index.module.scss'
import { Trans } from '@lingui/macro'
import { loadCatalog } from '../../../translations/utils'

const Page = () => (
  <div className={style.view}>
    <Trans>
      <h2 className="w-bold">Instructions</h2>
      <p>
        This workflow tool has been created to assist your team with the
        development of a plastics strategy for your country. Some key steps are
        suggested for consideration while in the ‘create’ phase. The workflow
        will be further developed to assist with the phase of ‘implement’,
        ‘report’, and ‘review.’ <br />
        <br />
        The workflow and resources associated with each suggested step are
        designed to facilitate and accelerate the activities of the ‘create’
        phase of your plastic strategy. Such resources include data, documents,
        templates, case studies, relevant organizations (governmental and non
        governmental) as well as individuals active in the space.
      </p>
      <h3 className="h-s w-bold">
        Step 1: Establishment of a National Steering Committee & project team
      </h3>
      <p>
        This step assists in the establishment of a National Steering Committee
        (NSC) with representation from necessary government agencies as well as
        relevant non-governmental organizations. The NSC should aim to meet 2-4
        times per year to assist with and drive the roadmap/strategy/plan. A
        project team could be established to assist the NSC, consisting of
        consultants and focal points, to lead the implementation of the project
        with the guidance of the NSC and UNEP.
      </p>
      <h3 className="h-s w-bold">Step 2: Stakeholder consultation process</h3>
      <p>
        Consultation should aim to understand the current issues faced by
        various stakeholders, as well as their role in solving the problem
        (actors) and how proposed activities of the national plastics strategy
        may affect them positively or negatively. Different stakeholders may
        also have access to important data. This step of the workflow provides
        guidance on organizing a comprehensive stakeholder consultation process
        to ensure all relevant sectors and stakeholders are consulted.
      </p>
      <h3 className="h-s w-bold">
        Step 3: Legislation & Policy Review and Analysis
      </h3>
      <p>
        An analysis of the legal and policy framework in your country can help
        identify current goals and targets that the national plastics strategy
        should aim to achieve, as well as gaps in this framework that the
        strategy could help close. This allows for identification of priority
        areas to track and the type of data needed to do so. In this stage,
        together with UNEP’s guidance, a review and analysis of the legislative
        and policy landscape as it pertains to marine litter and plastic
        pollution would be conducted.
      </p>
      <h3 className="h-s w-bold">Step 4: Data Analysis</h3>
      <p>
        Data is at the core of understanding the issues and current state of
        play, as well as the tracking of trends to determine effectiveness of
        the national plastics strategy. This step will help in compiling
        existing data and information into a State of Knowledge Report. This
        could include identification of areas in need of additional data
        collection, leading to additional secondary data collection. Note that
        all the data collected should be made publicly available.
      </p>
      <h3 className="h-s w-bold">Step 5: National Source Inventory Report</h3>
      <p>
        National plastics strategies should be underpinned by a National Source
        Inventory (NSI). This step will help in analyzingwe the data available
        and collected into a National Source Inventory Report on plastic
        pollution and marine litter that can inform discussions on possible
        actions to be included in the national plastics strategy.{' '}
      </p>
      <h3 className="h-s w-bold">Final Step: National Roadmap/Strategy/Plan</h3>
      <p>
        This step facilitates the development of a National
        Roadmap/Strategy/Plan based on the evidence and information gathered in
        the NSI Report. The roadmap should be time bound, measurable and include
        provisions of periodic revisions. The strategy can be formally adopted
        through parliament or act as a voluntary guideline for action.{' '}
      </p>
    </Trans>
  </div>
)

export function PageLayout(page) {
  const { isAuthenticated, loginVisible, setLoginVisible, profile } = page.props
  return (
    <NewLayout
      {...{
        isAuthenticated,
        loginVisible,
        setLoginVisible,
        profile,
      }}
    >
      <NestedLayout>{page}</NestedLayout>
    </NewLayout>
  )
}

export default Page

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

Page.getLayout = PageLayout
