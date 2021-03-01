import React from "react";
import { ExclamationCircleFilled, CheckCircleFilled } from "@ant-design/icons";
import { useAuth0 } from "@auth0/auth0-react";

const Auth0Widget = (props) => {
  const { logout } = useAuth0();
  const onChange = (x) => {
    props.onChange(x.target.value);
  };
  return (
    <>
      <input
        type="text"
        className="ant-input"
        defaultValue={props.value}
        required={props.required}
        disabled={props.disabled}
        onChange={onChange}
      />
      <div style={{ marginTop: "10px" }}>
        <span
          style={{
            color: props.schema.description !== "Verified" ? "red" : "green",
          }}
        >
          {props.schema.description !== "Verified" ? (
            <ExclamationCircleFilled />
          ) : (
            <CheckCircleFilled />
          )}{" "}
          {props.schema.description}
        </span>
        {props.schema.description !== "Verified" ? (
          <span style={{ fontWeight: "bold" }}> or </span>
        ) : (
          ""
        )}
        <button style={{ marginLeft: "10px" }} onClick={() => logout()}>
          use diffrent email
        </button>
      </div>
    </>
  );
};

export default Auth0Widget;
