import React, { useRef, useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
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
  return (
    <div className="photo-upload">
      <Button
        onClick={() => inputFile.current.click()}
        style={{ marginTop: "5px" }}
        className="upload-btn"
      >
        <UploadOutlined /> Choose File
      </Button>{" "}
      <span style={{ marginLeft: "20px" }}>{file?.name}</span>
      {!output && props?.value && props?.name === "cv" && (
        <ViewWidget url={props.value} download={false} />
      )}
      {props?.name === "cv" && file?.name && (
        <ViewWidget url={output} download={file.name} />
      )}
      <input
        type="file"
        onChange={(e) =>
          handleFileChange(e, props, setFile, setOutput, setError)
        }
        ref={inputFile}
        accept={props?.accept}
        style={{ display: "none" }}
      />
      <br />
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
