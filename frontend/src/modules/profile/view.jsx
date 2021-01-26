import { Button, Tabs } from 'antd'
import React, { useRef } from 'react'
import SignupForm from '../signup/signup-form'
import './styles.scss'
const {TabPane} = Tabs

const ProfileView = ({ profile }) => {
  const formRef = useRef()
  return (
    <div id="profile">
      <div className="ui container">
        <Tabs tabPosition="left">
          <TabPane tab="Personal details" key="1">
            <SignupForm onSubmit={(vals) => { console.log(vals) }} formRef={ref => { formRef.current = ref }} initialValues={profile} />
            <Button type="primary" onClick={() => formRef.current.submit()}>Update</Button>
          </TabPane>
        </Tabs>
      </div>
    </div>
  )
}

export default ProfileView