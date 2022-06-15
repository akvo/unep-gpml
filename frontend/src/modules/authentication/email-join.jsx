import React from "react";
import {
  Carousel,
  Col,
  Row,
  Typography,
  Button,
  Avatar,
  Form,
  Input,
  Upload,
  Switch,
  Select,
  AutoComplete,
} from "antd";
const { Title, Link } = Typography;
const { Dragger } = Upload;
import "./join.scss";
import { InboxOutlined } from "@ant-design/icons";
import { ReactComponent as SearchIcon } from "../../images/auth/search.svg";

const options = [
  {
    value: "Burns Bay Road",
  },
  {
    value: "Downing Street",
  },
  {
    value: "Wall Street",
  },
];

function EmailJoin() {
  const [form] = Form.useForm();
  return (
    <div className="ui container wave-background bg-white">
      <Row className="join-form">
        <Col span={24}>
          <Title level={2}>JOIN WITH EMAIL</Title>
          <Form form={form} layout="vertical">
            <Form.Item label="Email">
              <Input placeholder="Enter your email" />
              <div className="public-email-switch">
                <Switch key="publicEmail" name="publicEmail" />
                &nbsp;&nbsp;&nbsp;{"Show my email address on public listing"}
              </div>
            </Form.Item>
            <Form.Item label="Password" name="password">
              <Input.Password placeholder="Choose your password" />
            </Form.Item>
            <Form.Item label="Retype Password" name="password">
              <Input.Password placeholder="Retype your password" />
            </Form.Item>
            <Input.Group compact className="title-group">
              <Form.Item label="Title" name={"title"}>
                <Select placeholder="Title">
                  {["Mr", "Mrs", "Ms", "Dr", "Prof"].map((it) => (
                    <Option value={it}>{it}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Last Name" name="lastName">
                <Input placeholder="Last Name" />
              </Form.Item>
            </Input.Group>
            <Form.Item label="First Name" name="firstName">
              <Input placeholder="First Name" />
            </Form.Item>
            <Form.Item
              label={
                <p>
                  Photo <span>OPTIONAL</span>
                </p>
              }
              name="photo"
            >
              <Dragger>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Drag file here</p>
                <p className="ant-upload-hint">
                  <span>or</span> Browse your computer
                </p>
              </Dragger>
            </Form.Item>
            <Form.Item label="Country" name="country">
              <AutoComplete options={options}>
                <Input placeholder="Search country" prefix={<SearchIcon />} />
              </AutoComplete>
            </Form.Item>
            <Button className="next-button">Next {">"}</Button>
          </Form>{" "}
        </Col>
      </Row>
    </div>
  );
}

export default EmailJoin;
