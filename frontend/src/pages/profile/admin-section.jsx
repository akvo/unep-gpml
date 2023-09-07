import React from "react";
import ProfileLayout from "./ProfileLayout";
import { AdminSection } from "../../modules/profile/admin";

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
  );
}

function Admin() {
  return (
    <ProfileLayout>
      <AdminPage />
    </ProfileLayout>
  );
}

export default Admin;
