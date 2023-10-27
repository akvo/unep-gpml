import React from 'react'
import ProfileLayout from './ProfileLayout'
import { AdminSection } from '../../modules/profile/admin'
import { loadCatalog } from '../../translations/utils'

function AdminPage(props) {
  return (
    <>
      {props?.adminRoles.has(props?.profile?.role) && (
        <AdminSection
          stakeholdersData={props?.stakeholdersData}
          setStakeholdersData={props?.setStakeholdersData}
          resourcesData={props?.resourcesData}
          setResourcesData={props?.setResourcesData}
          entitiesData={props?.entitiesData}
          nonMemberEntitiesData={props?.nonMemberEntitiesData}
          setEntitiesData={props?.setEntitiesData}
          setNonMemberEntitiesData={props?.setNonMemberEntitiesData}
          tagsData={props?.tagsData}
          setTagsData={props?.setTagsData}
        />
      )}
    </>
  )
}

function Admin({ isAuthenticated, profile, loadingProfile }) {
  return (
    <ProfileLayout>
      <AdminPage
        {...{
          isAuthenticated,
          profile,
          loadingProfile,
        }}
      />
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

export default Admin
