import React from "react";
import { ExclamationCircleFilled, CheckCircleFilled } from "@ant-design/icons";
import { useAuth0 } from "@auth0/auth0-react";

const Auth0Widget = (props) => {
  const { logout } = useAuth0();
  const email = props.schema.description;
  return (
    <>
    <input type="text"
        className="ant-input"
        value={props.value}
        required={props.required}
        disabled={props.disabled}
        onChange={(event) => props.onChange(event.target.value)} />
    <div style={{ marginTop: "10px" }}>
        <span style={{ color: email !== "Verified" ? "red" : "green" }}>
            {email !== "Verified" ? <ExclamationCircleFilled /> : <CheckCircleFilled />} {email}
        </span>
        {email !== "Verified" ? <span style={{ fontWeight: "bold" }}> or </span> : ""}
        <button style={{ marginLeft: "10px" }} onClick={() => logout()}>
            use diffrent email
        </button>
    </div>
    </>
  );
};

export default Auth0Widget;
