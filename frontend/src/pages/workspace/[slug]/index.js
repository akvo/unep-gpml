import NestedLayout from './layout'
import NewLayout from '../../../layouts/new-layout'
import style from './index.module.scss'

const Page = () => (
  <div className={style.view}>
    <h2 className="w-bold">Instructions</h2>
    <h3 className="h-s w-bold">Key steps</h3>
    <p>
      The following are the key steps that you will need to undertake in order
      to create a plastic strategy for your country. In order to accelerate this
      process a variety of resources have been integrated into the workspace,
      these include data, documents organisations both governmental and non
      governmental as well as individuals active in the space.
    </p>
    <h3 className="h-s w-bold">National Steering Committee and project team</h3>
    <p>
      Establish a National Steering Committee (NSC) with representation from
      relevant government agencies as well as relevant non-governmental
      organisations. The NSC will aim to meet 2-4 times per year to assist with
      and drive the roadmap/strategy/plan. Establish a project team consisting
      of consultants to lead the implementation of the project with the guidance
      of the NSC and UNEP
    </p>
    <h3 className="h-s w-bold">Stakeholder consultation process</h3>
    <p>
      Organize a comprehensive stakeholder consultation process to ensure all
      relevant sectors and stakeholders are consulted, to gather all available
      data and information already available.
    </p>
    <h3 className="h-s w-bold">Legislation & Policy Review and Analysis</h3>
    <p>
      Conduct with UNEP’s guidance a review and analysis of the legislative and
      policy landscape as it pertains to marine litter and plastic pollution.
    </p>
    <h3 className="h-s w-bold">Data Analysis</h3>
    <p>
      Compile existing data and information into a State of Knowledge report
      including areas in need of additional data collection and based on this
      conduct additional secondary data collection. Note that all the data
      collected should be made publicly available.
    </p>
    <h3 className="h-s w-bold">National Roadmap/Strategy/Plan</h3>
    <p>
      Prepare a National Source Inventory (NSI) Report on plastic pollution and
      marine litter. Develop a National Roadmap/Strategy/Plan based on the
      evidence and information gathered in the NSI Report. The roadmap should be
      time bound, measurable and include provisions of periodic revisions.{' '}
    </p>
  </div>
)

export function PageLayout(page) {
  return (
    <NewLayout>
      <NestedLayout>{page}</NestedLayout>
    </NewLayout>
  )
}

export default Page

Page.getLayout = PageLayout
