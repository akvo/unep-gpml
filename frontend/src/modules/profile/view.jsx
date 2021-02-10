import { Button, notification, Tabs } from 'antd'
import React, { useRef, useState, useEffect } from 'react'
import api from '../../utils/api'
import SignupForm from '../signup/signup-form'
import AdminSection from './admin'
import './styles.scss'
const {TabPane} = Tabs

const ProfileView = ({profile, tags, setProfile}) => {
  const handleSubmitRef = useRef()
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState(false)
  const onSubmit = (vals) => {
    setSaving(true)
    if (vals.geoCoverageType === 'national' && typeof(vals.geoCoverageValue) === 'string'){
        vals.geoCoverageValue = [vals.geoCoverageValue]
    }
    api.put('/profile', vals)
    .then(() => {
      setProfile(vals)
      notification.success({ message: 'Profile updated' })
      setSaving(false)
    })
    .catch(() => {
      notification.error({ message: 'An error occured' })
      setSaving(false)
    })
  }
  useEffect(() => {
      setUser(profile)
  }, [profile]);

  return (
    <div id="profile">
      <div className="ui container">
        <Tabs tabPosition="left">
          <TabPane tab="Personal details" key="1">
            <SignupForm {...{onSubmit, tags }} handleSubmitRef={ref => { handleSubmitRef.current = ref }} initialValues={user} />
            <Button loading={saving} type="primary" onClick={(ev) => { handleSubmitRef.current(ev) }}>Update</Button>
          </TabPane>
          {user?.role === 'ADMIN' &&
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
