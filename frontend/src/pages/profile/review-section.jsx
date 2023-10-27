import React from 'react'
import ProfileLayout from './ProfileLayout'
import ReviewSection from '../../modules/profile/review'
import { loadCatalog } from '../../translations/utils'

function ReviewPage(props) {
  return (
    <>
      {props?.reviewerRoles.has(props?.profile?.role) && (
        <ReviewSection
          reviewItems={props.reviewItems}
          setReviewItems={props.setReviewItems}
          reviewedItems={props.reviewedItems}
          setReviewedItems={props.setReviewedItems}
        />
      )}
    </>
  )
}

function Review() {
  return (
    <ProfileLayout>
      <ReviewPage />
    </ProfileLayout>
  )
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default Review
