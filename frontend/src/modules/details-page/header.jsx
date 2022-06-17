import React, {
  Fragment,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import "./styles.scss";
import { Row, Col, List, Avatar, Popover, Input, Button, Tag } from "antd";

import {
  EyeFilled,
  HeartTwoTone,
  MailTwoTone,
  PlayCircleTwoTone,
  HeartFilled,
  InfoCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { resourceTypeToTopicType, topicNames } from "../../utils/misc";

export const HeaderButtons = ({
  data,
  topic,
  handleEditBtn,
  canEdit,
  relation,
  handleRelationChange,
  visible,
  handleVisible,
}) => {
  const { type, id } = topic;

  const handleChangeRelation = (relationType) => {
    let association = relation ? [...relation.association] : [];
    if (!association.includes(relationType)) {
      association = [relationType];
    } else {
      association = association.filter((it) => it !== relationType);
    }
    handleRelationChange({
      topicId: parseInt(id),
      association,
      topic: resourceTypeToTopicType(type),
    });
  };

  const handleVisibleChange = () => {
    handleVisible();
  };

  return (
    <Col className="tool-buttons">
      <Button
        className="view-button "
        icon={<EyeFilled />}
        type="primary"
        shape="round"
        size="middle"
        href={`${
          data?.url && data?.url?.includes("https://")
            ? data?.url
            : data?.languages
            ? data?.languages[0]?.url
            : data?.url?.includes("http://")
            ? data?.url
            : "https://" + data?.url
        }`}
        target="_blank"
      >
        View
      </Button>
      {data?.recording && (
        <Button
          className="recording-button two-tone-button"
          icon={<PlayCircleTwoTone twoToneColor="#09689a" />}
          type="primary"
          shape="round"
          size="middle"
          ghost
          onClick={() => {
            window.open(
              data?.recording.includes("https://")
                ? data?.recording
                : "https://" + data?.recording,
              "_blank"
            );
          }}
        >
          Recording
        </Button>
      )}
      <Popover
        placement="top"
        overlayStyle={{
          width: "22vw",
        }}
        overlayClassName="popover-share"
        content={
          <Input.Group compact>
            <Input
              style={{ width: "calc(100% - 20%)" }}
              defaultValue={`${
                data?.url && data?.url?.includes("https://")
                  ? data?.url
                  : data?.languages
                  ? data?.languages[0]?.url
                  : data?.url?.includes("http://")
                  ? data?.url
                  : "https://" + data?.url
              }`}
              disabled
            />
            <Button
              style={{ width: "20%" }}
              type="primary"
              onClick={() => {
                navigator.clipboard.writeText(
                  data?.url && data?.url?.includes("https://")
                    ? data?.languages
                      ? data?.languages[0]?.url
                      : data?.url
                    : "https://" + data?.url
                );
                handleVisibleChange();
              }}
            >
              Copy
            </Button>
          </Input.Group>
        }
        trigger="click"
        visible={visible}
        onVisibleChange={handleVisibleChange}
        placement="left"
      >
        <div>
          <Button
            className="share-button two-tone-button"
            icon={<MailTwoTone twoToneColor="#09689a" />}
            type="primary"
            shape="round"
            size="middle"
            ghost
            onClick={handleVisibleChange}
          >
            Share
          </Button>
        </div>
      </Popover>
      <Button
        className="bookmark-button two-tone-button"
        icon={
          relation?.association?.indexOf("interested in") !== -1 ? (
            <HeartFilled className="heart-filled" />
          ) : (
            <HeartTwoTone className="two-tone-heart" twoToneColor="#09689a" />
          )
        }
        type="primary"
        shape="round"
        size="middle"
        ghost
        onClick={() => handleChangeRelation("interested in")}
      >
        Bookmark
      </Button>
      {canEdit() && (
        <Button
          className="edit-button two-tone-button"
          type="primary"
          shape="round"
          size="middle"
          ghost
          onClick={handleEditBtn}
        >
          Edit
        </Button>
      )}
    </Col>
  );
};

const Header = ({
  data,
  LeftImage,
  profile,
  isAuthenticated,
  params,
  handleEditBtn,
  allowBookmark,
  visible,
  handleVisible,
  showLess,
  setShowLess,
  placeholder,
  handleRelationChange,
  relation,
}) => {
  const toolButtons = (
    data,
    LeftImage,
    profile,
    isAuthenticated,
    params,
    handleEditBtn,
    allowBookmark,
    visible,
    handleVisible,
    showLess,
    setShowLess,
    placeholder,
    relation,
    handleRelationChange
  ) => {
    const noEditTopics = new Set(["stakeholder"]);

    const find = data?.stakeholderConnections?.find(
      (it) => it.stakeholderId === profile.id
    );

    const canEdit = () =>
      isAuthenticated &&
      profile.reviewStatus === "APPROVED" &&
      (profile.role === "ADMIN" ||
        profile.id === params.createdBy ||
        data.owners.includes(profile.id) ||
        find) &&
      ((params.type !== "project" && !noEditTopics.has(params.type)) ||
        (params.type === "project" && params.id > 10000));

    const canDelete = () =>
      isAuthenticated &&
      profile.reviewStatus === "APPROVED" &&
      profile.role === "ADMIN";

    return (
      <HeaderButtons
        data={data}
        canDelete={canDelete}
        topic={{ ...data, ...params }}
        handleEditBtn={handleEditBtn}
        canEdit={canEdit}
        relation={relation.relation}
        handleRelationChange={relation.handleRelationChange}
        allowBookmark={allowBookmark}
        visible={visible}
        handleVisible={handleVisible}
      />
    );
  };

  return (
    <div className="detail-header">
      <h3 className="detail-resource-type content-heading">
        {topicNames(params?.type)}
      </h3>
      <h4 className="detail-resource-title">{data?.title}</h4>
      {toolButtons(
        data,
        LeftImage,
        profile,
        isAuthenticated,
        params,
        handleEditBtn,
        allowBookmark,
        visible,
        handleVisible,
        showLess,
        setShowLess,
        placeholder,
        { ...{ handleRelationChange, relation } }
      )}
    </div>
  );
};

export default Header;
