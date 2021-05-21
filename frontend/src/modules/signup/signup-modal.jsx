import { UIStore } from "../../store";
import React, { useState, useContext, useEffect } from "react";
import { Modal, Button } from "antd";
import api from "../../utils/api";
import "./styles.scss";
import { useAuth0 } from "@auth0/auth0-react";
import SignupForm from "./signup-form";
import { useRef } from "react";
import Checkbox from "antd/lib/checkbox/Checkbox";

const SignupModal = ({ visible, onCancel }) => {
  const { user } = useAuth0();
  const { countries, tags, profile, organisations } = UIStore.currentState;
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState(1);
  const handleSubmitRef = useRef();
  const [consent, setConsent] = useState(false);

  const onSubmit = (vals) => {
    setSending(true);
    if (!vals?.publicEmail) {
      vals = { ...vals, publicEmail: false };
    }
    if (vals.geoCoverageType === "national") {
      vals.geoCoverageValue = [vals.geoCoverageValue];
    }
    api
      .post("/profile", vals)
      .then((d) => {
        UIStore.update((e) => {
          e.profile = d.data;
        });
        setSending(false);
        document.cookie = `profile=SUBMITTED`;
        document.cookie = `profileMessage=1`;
        setStep(2);
      })
      .catch(() => {
        setSending(false);
      });
  };

  useEffect(() => {
    if (!visible) {
      return;
    }
    let modal = document.getElementsByClassName("signup-modal");
    if (modal.length > 0) {
      let modalContent = document.getElementsByClassName("ant-modal-wrap");
      modalContent.length > 0 &&
        modalContent[0].addEventListener("scroll", (e) => {
          let selectDropdown = document.getElementsByClassName(
            "ant-select-dropdown"
          );
          selectDropdown.length > 0 &&
            Array.prototype.forEach.call(selectDropdown, (x) =>
              x.classList.add("ant-select-dropdown-hidden")
            );
        });
    }
  }, [visible]);

  return (
    <Modal
      {...{ visible, onCancel }}
      width={800}
      title="Complete your signup"
      okText="Submit"
      className="signup-modal"
      onOk={() => {
        handleSubmitRef.current();
      }}
      okButtonProps={{ disabled: !consent }}
      maskClosable={false}
      confirmLoading={sending}
      footer={
        step === 2 ? <Button onClick={onCancel}>Close</Button> : undefined
      }
    >
      {step === 1 && (
        <div>
          <SignupForm
            onSubmit={onSubmit}
            handleSubmitRef={(ref) => {
              handleSubmitRef.current = ref;
            }}
            initialValues={profile}
            isModal={true}
            dropdownOpen
            setDropdownOpen
          />
          <Checkbox
            className="consent-check"
            checked={consent}
            onChange={({ target: { checked } }) => setConsent(checked)}
          >
            By submitting this form, I will be included in the public database
            of GPML Digital Platform members and acknowledge that the provided
            information will be made public and used to find and connect via
            smart-matchmaking functionalities with other stakeholders and
            resources.
          </Checkbox>
        </div>
      )}
      {step === 2 && (
        <div className="submitted">
          <p>
            {user?.email_verified === false && (
              <b>
                Click on the link we sent in your email to verify your email
                address.
              </b>
            )}
            We will review your sign-up request
            {user?.email_verified === false &&
              " as soon as you verify your email address"}
            . Please, allow for 1 business day.
          </p>
        </div>
      )}
    </Modal>
  );
};

export default SignupModal;
