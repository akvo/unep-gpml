import React, {useState } from "react";
import { Modal } from "antd";
import SignUpForm from "./signup-form";

const SignupModal = ({ visible, onCancel }) => {
    const [data, updateData] = useState({});

    return (
        <Modal
            {...{ visible, onCancel }}
            width={600}
            title="Complete your signup"
            okText="Submit"
            onOk={() => {
                // TODO: call form submit
                console.log(data);
            }}
        >
            <SignUpForm dispatchData={updateData} initialData={data}/>
        </Modal>
    );
};

export default SignupModal;
