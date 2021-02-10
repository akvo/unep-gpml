import { Button, notification, Tabs } from 'antd'
import React, { useRef, useState } from 'react'
import api from '../../utils/api'
import SignupForm from '../signup/signup-form'
import AdminSection from './admin'
import './styles.scss'
import isEmpty from 'lodash/isEmpty'
import { LoadingOutlined } from '@ant-design/icons';
const {TabPane} = Tabs

const ProfileView = ({profile, tags, setProfile}) => {
  const handleSubmitRef = useRef()
  const [saving, setSaving] = useState(false)
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

  return (
    <div id="profile">
      <div className="ui container">
        {isEmpty(profile)
            ? <h2 className="loading"><LoadingOutlined spin/> Loading Profile</h2>
            : <Tabs tabPosition="left" className="fade-in">
                <TabPane tab="Personal details" key="1">
                    <SignupForm {...{onSubmit, tags }} handleSubmitRef={ref => { handleSubmitRef.current = ref }} initialValues={profile}/>
                    <Button loading={saving} type="primary" onClick={(ev) => { handleSubmitRef.current(ev) }}>Update</Button>
                </TabPane>
                {profile?.role === 'ADMIN' &&
                <TabPane tab="Admin section" key="2">
                    <AdminSection />
                </TabPane>
                }
              </Tabs>}
      </div>
    </div>
  )
}

export default ProfileView
