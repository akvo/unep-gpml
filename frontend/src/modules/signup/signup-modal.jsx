import React, {useState } from "react";
import { Modal, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import SignUpForm from "./sign-up-form";

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
            <Upload>
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
            <SignUpForm dispatchData={updateData} initialData={data}/>
        </Modal>
    );
};

export default SignupModal;
