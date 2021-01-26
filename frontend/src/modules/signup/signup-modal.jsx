import React, { useState } from "react";
import { Modal, Button } from "antd";
import api from "../../utils/api";
import './styles.scss'
import { useAuth0 } from '@auth0/auth0-react';
import SignupForm from "./signup-form";
import { useRef } from "react";


const SignupModal = ({ visible, onCancel }) => {
    const [sending, setSending] = useState(false)
    const [step, setStep] = useState(1)
    const {user} = useAuth0();
    const formRef = useRef()
    const onSubmit = (vals) => {
      setSending(true)
      api.post('/profile', vals)
      .then(d => {
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
            formRef.current.submit()
          }}
          confirmLoading={sending}
          footer={step === 2 ? (<Button onClick={onCancel}>Close</Button>) : undefined}
        >
          {step === 1 &&
            <SignupForm onSubmit={onSubmit} formRef={ref => { formRef.current = ref }} />
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
