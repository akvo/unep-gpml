import React from 'react'
import { Modal, Upload, Button } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import SignUpForm from './sign-up-form'

const SignupModal = ({ visible, onCancel }) => {
  return [
    <Modal
      {...{ visible, onCancel }}
      width={600} title="Complete your signup"
      okText="Submit"
      onOk={() => {
        // TODO: call form submit
      }}
    >
      <Upload>
        <Button icon={<UploadOutlined />}>Click to Upload</Button>
      </Upload>
      <SignUpForm />
    </Modal>
  ]
}

export default SignupModal