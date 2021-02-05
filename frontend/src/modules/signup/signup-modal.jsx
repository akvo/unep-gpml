import React, { useState } from "react";
import { Modal, Button } from "antd";
import api from "../../utils/api";
import './styles.scss'
import { useAuth0 } from '@auth0/auth0-react';
import SignupForm from "./signup-form";
import { useRef } from "react";


const SignupModal = ({ visible, onCancel, setProfile, profile, tagsRef}) => {
    const [sending, setSending] = useState(false)
    const [step, setStep] = useState(1)
    const {user} = useAuth0();
    const handleSubmitRef = useRef()
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
    const handleOnCancel = () => {
      if(step === 2) onCancel()
    }
    return (
        <Modal
          {...{ visible, onCancel: handleOnCancel }}
          width={600}
          title="Complete your signup"
          okText="Submit"
          className="signup-modal"
          cancelButtonProps={{ disabled: true }}
          onOk={() => {
            handleSubmitRef.current()
          }}
          confirmLoading={sending}
          closable={false}
          footer={step === 2 ? (<Button onClick={onCancel}>Close</Button>) : undefined}
        >
          {step === 1 &&
            <SignupForm onSubmit={onSubmit} handleSubmitRef={ref => { handleSubmitRef.current = ref }} initialValues={profile} tagsRef={tagsRef}/>
          }
          {step === 2 &&
          <div className="submitted">
            <h2>Pending approval</h2>
            <p>
              We will review your signup request shortly.
              {user.email_verified === false && <span><br />
              Meanwhile please confirm your email.
              <br />
              <small>Registrations with unconfirmed emails will not be approved</small></span>}
            </p>
          </div>
          }
        </Modal>
    );
};


export default SignupModal;
