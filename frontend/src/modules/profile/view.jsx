import { Button, notification, Tabs } from 'antd'
import React, { useRef, useState } from 'react'
import api from '../../utils/api'
import SignupForm from '../signup/signup-form'
import AdminSection from './admin'
import './styles.scss'
const {TabPane} = Tabs

const ProfileView = ({ profile }) => {
  const handleSubmitRef = useRef()
  const [saving, setSaving] = useState(false)
  const onSubmit = (vals) => {
    setSaving(true)
    api.put('/profile', vals)
    .then(() => {
      notification.success({ message: 'Profile updated' })
      setSaving(false)
    })
    .catch(() => {
      notification.error({ message: 'An error occured' })
      setSaving(false)
    })
  }
  return (
    <div id="profile">
      <div className="ui container">
        <Tabs tabPosition="left">
          <TabPane tab="Personal details" key="1">
            <SignupForm onSubmit={onSubmit} handleSubmitRef={ref => { handleSubmitRef.current = ref }} initialValues={profile} />
            <Button loading={saving} type="primary" onClick={(ev) => { handleSubmitRef.current(ev) }}>Update</Button>
          </TabPane>
          {profile?.role === 'ADMIN' &&
          <TabPane tab="Admin section" key="2">
            <AdminSection />
          </TabPane>
          }
        </Tabs>
      </div>
    </div>
  )
}

export default ProfileView