import React from 'react'
import ProfileLayout from './ProfileLayout'
import SignupForm from '../../modules/signup-old/signup-form'
import { Button } from 'antd'
import { loadCatalog } from '../../translations/utils'

function ProfilePage(props) {
  return (
    <div>
      <SignupForm
        onSubmit={props.onSubmit}
        handleSubmitRef={(ref) => {
          props.handleSubmitRef.current = ref
        }}
        initialValues={props?.profile}
        isModal={false}
      />
      <Button
        ghost
        size="small"
        loading={props.saving}
        onClick={(ev) => {
          props.handleSubmitRef.current(ev)
        }}
      >
        Update
      </Button>
    </div>
  )
}

function Profile({ isAuthenticated, profile, loadingProfile }) {
  return (
    <ProfileLayout>
      <ProfilePage />
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

export default Profile
