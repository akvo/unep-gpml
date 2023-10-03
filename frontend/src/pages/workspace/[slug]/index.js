import NestedLayout from './layout'
import NewLayout from '../../../layouts/new-layout'

const Page = () => (
  <div>
    <h1>Introduction 11</h1>
  </div>
)

// export const PageLayout = (page) => <NestedLayout>{page}</NestedLayout>

// Page.getLayout = PageLayout

export default Page

Page.getLayout = function getLayout(page) {
  return (
    <NewLayout>
      <NestedLayout>{page}</NestedLayout>
    </NewLayout>
  )
}
