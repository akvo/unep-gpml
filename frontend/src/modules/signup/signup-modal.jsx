import React, { useState } from "react";
import { Modal, Button } from "antd";
import api from "../../utils/api";
import './styles.scss'
import { useAuth0 } from '@auth0/auth0-react';
import SignupForm from "./signup-form";
import { useRef } from "react";
import Checkbox from "antd/lib/checkbox/Checkbox";


const SignupModal = ({ visible, onCancel, setProfile, profile, tags }) => {
    const [sending, setSending] = useState(false)
    const [step, setStep] = useState(1)
    const handleSubmitRef = useRef()
    const [consent, setConsent] = useState(false)
    const onSubmit = (vals) => {
      setSending(true)
      if (vals.geoCoverageType === 'national'){
          vals.geoCoverageValue = [vals.geoCoverageValue]
      }
      api.post('/profile', vals)
      .then(d => {
        setProfile(d.data)
        setSending(false)
        setStep(2)
      })
      .catch(() => {
        setSending(false)
      })
    }
    return (
        <Modal
          {...{ visible, onCancel }}
          width={600}
          title="Complete your signup"
          okText="Submit"
          className="signup-modal"
          onOk={() => {
            handleSubmitRef.current()
          }}
          okButtonProps={{ disabled: !consent }}
          maskClosable={false}
          confirmLoading={sending}
          footer={step === 2 ? (<Button onClick={onCancel}>Close</Button>) : undefined}
        >
          {step === 1 &&
            <div>
              <SignupForm
                onSubmit={onSubmit}
                handleSubmitRef={ref => { handleSubmitRef.current = ref; }}
                initialValues={profile}
                tags={tags}
              />
              <Checkbox className="consent-check" checked={consent} onChange={({ target: { checked }}) => setConsent(checked)}>By submitting this form, I will be included in the public database of GPML Digital Platform members and acknowledge that the provided information will be made public and used to find and connect via smart-matchmaking functionalities with other stakeholders and resources.</Checkbox>
            </div>
          }
          {step === 2 &&
          <div className="submitted">
            <p>
              <b>Click on the link we sent in your email to verify your email address.</b>
              We will review your sign-up request as soon as you verify your email address. Please, allow for 1 business day.
            </p>
          </div>
          }
        </Modal>
    );
};


export default SignupModal;
