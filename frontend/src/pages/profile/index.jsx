import React from "react";
import ProfileLayout from "./ProfileLayout";
import SignupForm from "../../modules/signup-old/signup-form";
import { Button } from "antd";

function ProfilePage(props) {
  return (
    <div>
      <SignupForm
        onSubmit={props.onSubmit}
        handleSubmitRef={(ref) => {
          props.handleSubmitRef.current = ref;
        }}
        initialValues={props?.profile}
        isModal={false}
      />
      <Button
        loading={props.saving}
        type="ghost"
        className="black"
        onClick={(ev) => {
          props.handleSubmitRef.current(ev);
        }}
      >
        Update
      </Button>
    </div>
  );
}

function Profile() {
  return (
    <ProfileLayout>
      <ProfilePage />
    </ProfileLayout>
  );
}

export default Profile;
