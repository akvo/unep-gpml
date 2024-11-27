import NestedLayout from './layout'
import NewLayout from '../../../layouts/new-layout'
import style from './index.module.scss'
import { Trans } from '@lingui/macro'
import Button from '../../../components/button'
import { loadCatalog } from '../../../translations/utils'
import { useRouter } from 'next/router'
import { PREFIX_SLUG, isoA2 } from '../../../modules/workspace/ps/config'

const links = {
  PG:
    'https://docs.google.com/document/d/1MTWraV20XYzwXDxkFTdRcbkMz-GO-xgE/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  ZA:
    'https://docs.google.com/document/d/129KI2ideXphYCfMubD8KSXp0SHlDx3v9/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  TG:
    'https://docs.google.com/document/d/1wjyDbvgqhyNLBHecgEoYJmzrpQ2IqFzUi0TJTav_lw8/edit?usp=sharing',
  SN:
    'https://docs.google.com/document/d/1BhaiuBY5gpnvtsl2CWY2RdMLpBEeT3Af/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  KI:
    'https://docs.google.com/document/d/1Mg7723ABDnF8gEecDjw035N1xgaAQSI4/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  VU:
    'https://docs.google.com/document/d/1-CyDFV-ZqPG_c0Um8vk743CBphuB9OWq/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  SB:
    'https://docs.google.com/document/d/12sa2TIOa5wKENeefOEIbvAknYXaD1HHu/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  TO:
    'https://docs.google.com/document/d/1cIgDRB-5HS5O_1R-WteDeLJj58bbgWkP/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  EC:
    'https://docs.google.com/document/d/11Wo7ebDmcJ6bgpCnD16Bw-2suMZSm8i9/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  TT:
    'https://docs.google.com/document/d/1nwNthT0sUM5A11T7VxEtjvT-ElfWmdWw/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  KH:
    'https://docs.google.com/document/d/1tkRQTf8i5PUvlqHbHM-MpjWLP4zKG8u9/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  TV:
    'https://docs.google.com/document/d/1nif7gPJfq71bRbYCbQYs9MkNQoMXcaYH/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  MU:
    'https://docs.google.com/document/d/10HqdlypQtYOmT53Uwc4JWbi4MZb5rQ3Z/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  PE:
    'https://docs.google.com/document/d/1Hgr9I0DXc5jjxuIwv76M73IyRl7LzEIg/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  FJ:
    'https://docs.google.com/document/d/1DX6ZQSYe1k6kTlJ7py7v63_8LSVXcqh4/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  GN:
    'https://docs.google.com/document/d/1LRTO9IPY9xaZZ_RiNBRjJbYQ4_1CPISp/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  CI:
    'https://docs.google.com/document/d/1xdgmeCv6MKdpdI2Zy5FM5ytwrNZYDt7m/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  WS:
    'https://docs.google.com/document/d/1nMYX7rTRwhrffTCXMvaGIFPxFSTUy33Wl7qQKtJwSUI/edit?usp=sharing',
}

const Page = () => {
  const router = useRouter()
  const { slug } = router.query

  const [_, countrySlug] = slug?.split(`${PREFIX_SLUG}-`)
  const countryISOA2 =
    isoA2?.[countrySlug === 'cote-d-ivoire' ? 'ivory-coast' : countrySlug]

  return (
    <div className={style.view}>
      <Trans>
        <h2 className="w-bold">Instructions</h2>
        <p>
          This workflow tool has been created to assist your team with the
          development of a plastics strategy for your country. Some key steps
          are suggested for consideration while in the ‘create’ phase. The
          workflow will be further developed to assist with the phase of
          ‘implement’, ‘report’, and ‘review.’ <br />
          <br />
          The workflow and resources associated with each suggested step are
          designed to facilitate and accelerate the activities of the ‘create’
          phase of your plastic strategy. Such resources include data,
          documents, templates, case studies, relevant organizations
          (governmental and non governmental) as well as individuals active in
          the space.
        </p>
        {links[countryISOA2] && (
          <a href={links[countryISOA2]} target="_blank">
            <Button size="small" type="link">
              Country Factsheet
            </Button>
          </a>
        )}
        <h3 className="h-s w-bold">
          Step 1: National Steering Committee & Project Team
        </h3>
        <p>
          This step assists in the establishment of a National Steering
          Committee (NSC) with representation from necessary government agencies
          as well as relevant non-governmental organizations. The NSC should aim
          to meet 2-4 times per year to assist with and drive the
          roadmap/strategy/plan. A project team should be established to assist
          the NSC, consisting of consultants and focal points, to lead the
          implementation of the project with the guidance of the NSC and UNEP.
        </p>
        <h3 className="h-s w-bold">Step 2: Stakeholder consultations</h3>
        <p>
          Consultation should aim to understand the current issues faced by
          various stakeholders, as well as their role in solving the problem
          (actors) and how proposed activities of the national plastics strategy
          may affect them positively or negatively. Different stakeholders may
          also have access to important data. This step of the workflow provides
          guidance on organizing a comprehensive stakeholder consultation
          process to ensure all relevant sectors and stakeholders are consulted.
        </p>
        <h3 className="h-s w-bold">
          Step 3: State of Knowledge on Plastic Data
        </h3>
        <p>
          Data is at the core of understanding the issues and current state of
          play, as well as the tracking of trends to determine effectiveness of
          the national plastics strategy. This step will help in compiling
          existing data and information into a State of Knowledge Report. This
          could include identification of areas in need of additional data
          collection, leading to additional secondary data collection.
        </p>
        <h3 className="h-s w-bold">Step 4: Legislation & Policy Review</h3>
        <p>
          An analysis of the legal and policy framework in your country can help
          identify current goals and targets that the national plastics strategy
          should aim to achieve, as well as gaps in this framework that the
          strategy could help close. This allows for the identification of
          priority areas to track and the type of data needed to do so. In this
          stage, together with UNEP’s guidance, a review and analysis of the
          legislative and policy landscape as it pertains to marine litter and
          plastic pollution would be conducted.
        </p>
        <h3 className="h-s w-bold">Step 5: National Source Inventory</h3>
        <p>
          National plastics strategies should be underpinned by a National
          Source Inventory (NSI). This step will help in analysing the data
          available and collected into a National Source Inventory Report on
          plastic pollution and marine litter that can inform discussions on
          possible actions to be included in the national plastics strategy.
        </p>
        <h3 className="h-s w-bold">
          Final Step: National Roadmap/Strategy/Plan
        </h3>
        <p>
          This step facilitates the development of a National
          Roadmap/Strategy/Plan based on the evidence and information gathered
          in the NSI Report. The roadmap should be time bound, measurable and
          include provisions of periodic revisions. The strategy can be formally
          adopted through parliament or act as a voluntary guideline for action.
        </p>
      </Trans>
    </div>
  )
}

export function PageLayout(page) {
  const {
    isAuthenticated,
    loginVisible,
    setLoginVisible,
    profile,
    auth0Client,
  } = page.props
  return (
    <NewLayout
      {...{
        isAuthenticated,
        loginVisible,
        setLoginVisible,
        profile,
        auth0Client,
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
