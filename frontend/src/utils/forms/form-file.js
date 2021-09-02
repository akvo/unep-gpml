import React, { useRef, useState } from "react";
import { UIStore } from "../../store";
import { UploadOutlined, FileOutlined } from "@ant-design/icons";
import { Button } from "antd";

const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.result);
    }
    if (!file) {
      reject("discard");
    }
  });
};

const ViewWidget = ({ url, download }) => {
  if (download) {
    return (
      <a
        className="view-cv ant-btn"
        href={url}
        target="_blank"
        rel="noreferrer"
        download={download}
      >
        Download CV
      </a>
    );
  }
  return (
    <a className="view-cv ant-btn" href={url} target="_blank" rel="noreferrer">
      View CV
    </a>
  );
};

const removeFile = (inputFile, setFile, setOutput, onChange) => {
  inputFile.current.value = "";
  onChange("");
  setFile(null);
  setOutput("");
};

const handleFileChange = (el, props, setFile, setOutput, setError) => {
  const input = el.target.files[0];
  let isValid = true;
  if (!input) {
    return;
  }
  // type validation when drag drop
  const { type } = input;
  let accepts = props?.accept || props?.uiSchema?.["ui:options"]?.accept;
  accepts = accepts.includes(",") ? accepts.split(",") : accepts;
  if (accepts.includes(".doc") && !accepts.includes(type)) {
    setError(`File should match format document, text or pdf`);
    return;
  }
  if (accepts.includes("image") && !type.includes("image")) {
    setError(`File should match format image`);
    return;
  }
  setError("");
  // end of type validation when drag drop

  if (props?.maxFileSize) {
    isValid = props.maxFileSize * 1000000 >= input.size;
  }
  if (isValid) {
    setFile(input);
    const base64 = getBase64(input);
    base64
      .then((res) => {
        setOutput(res);
        props.onChange(res);
      })
      .catch((err) => {
        props.onChange(props?.value || null);
      });
  }
  if (!isValid) {
    setError(`Max filesize is ${props.maxFileSize}mb.`);
    setTimeout(() => {
      setError("");
    }, 5000);
  }
};

const FileWidget = (props) => {
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState();
  const inputFile = useRef(null);
  const accepts = props?.accept || props?.uiSchema?.["ui:options"]?.accept;

  const { required } = props;
  const highlight = UIStore.useState((s) => s.highlight);
  const border =
    required && highlight ? "2px #22ba9a solid" : "2px dotted lightgray";

  return (
    <div className="photo-upload">
      <div
        className="photo-upload-border"
        style={{
          position: "relative",
          border,
          padding: "25px",
          borderRadius: "5px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "5px",
        }}
      >
        <FileOutlined style={{ fontSize: "40px", color: "lightgray" }} />
        <p>Drag and drop your files here or</p>
        <Button
          onClick={() => inputFile.current.click()}
          style={{
            marginTop: "5px",
            appearance: "none",
            position: "relative",
            zIndex: 1,
          }}
          className="upload-btn"
        >
          <UploadOutlined /> Choose File
        </Button>{" "}
        <input
          type="file"
          onChange={(e) =>
            handleFileChange(e, props, setFile, setOutput, setError)
          }
          ref={inputFile}
          accept={accepts}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            border: "none",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            left: 0,
            opacity: 0,
          }}
        />
      </div>
      {/* End Drag drop container */}

      {file?.name && <div style={{ marginTop: "10px" }}>{file?.name}</div>}
      {!output && props?.value && props?.name === "cv" && (
        <ViewWidget url={props.value} download={false} />
      )}
      {props?.name === "cv" && file?.name && (
        <ViewWidget url={output} download={file.name} />
      )}
      {(output || props?.value) && props?.name !== "cv" && (
        <img src={props?.value || output} alt="upload" />
      )}
      {props?.value || output ? (
        <Button
          onClick={(e) =>
            removeFile(inputFile, setFile, setOutput, props.onChange)
          }
          style={{ marginTop: "10px", display: "block" }}
        >
          Remove
        </Button>
      ) : (
        ""
      )}
      <div className="ant-form-item-explain ant-form-item-explain-error">
        <div role="alert">{error}</div>
      </div>
    </div>
  );
};

export default FileWidget;
