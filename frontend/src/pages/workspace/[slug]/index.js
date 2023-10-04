import NestedLayout from './layout'
import NewLayout from '../../../layouts/new-layout'

const Page = () => (
  <div>
    <h1>Introduction</h1>
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
