import React from "react";
import "./styles.scss";
import {
  Col,
  Modal,
  Avatar,
  notification,
  Input,
  Button,
  Form,
  Comment,
} from "antd";
import { eventTrack } from "../../utils/misc";
import {
  MessageOutlined,
  SendOutlined,
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
} from "@ant-design/icons";
import api from "../../utils/api";
import moment from "moment";
import TextArea from "rc-textarea";

export const CommentList = ({
  item,
  showReplyBox,
  setShowReplyBox,
  onReply,
  setComment,
  profile,
  getComment,
  params,
  editComment,
  setEditComment,
  onEditComment,
}) => {
  return (
    <Comment
      key={item.id}
      actions={
        profile &&
        profile.reviewStatus === "APPROVED" && [
          <>
            {profile && profile.reviewStatus === "APPROVED" && (
              <>
                <span
                  key="comment-nested-reply-to"
                  className={item.id === showReplyBox ? "active" : ""}
                  onClick={() => {
                    if (item.id === showReplyBox) {
                      setShowReplyBox("");
                    } else {
                      setShowReplyBox(item.id);
                    }
                    setEditComment("");
                  }}
                >
                  Reply to
                </span>
                {profile.id === item.authorId && (
                  <span
                    key="comment-nested-edit"
                    className={item.id === editComment ? "active" : ""}
                    onClick={() => {
                      if (item.id === editComment) {
                        setEditComment("");
                      } else {
                        setEditComment(item.id);
                      }
                      setShowReplyBox("");
                    }}
                  >
                    Edit
                  </span>
                )}
                {profile.role === "ADMIN" && (
                  <span
                    key="comment-nested-delete"
                    onClick={() => {
                      Modal.error({
                        className: "popup-delete",
                        centered: true,
                        closable: true,
                        icon: <DeleteOutlined />,
                        title: "Are you sure you want to delete this comment?",
                        content:
                          "Please be aware this action cannot be undone.",
                        okText: "Delete",
                        okType: "danger",
                        async onOk() {
                          try {
                            const res = await api.delete(`/comment/${item.id}`);
                            notification.success({
                              message: "Comment deleted successfully",
                            });

                            getComment(
                              params.id,
                              params.type.replace("-", "_")
                            );
                          } catch (err) {
                            console.error(err);
                            notification.error({
                              message: "Oops, something went wrong",
                            });
                          }
                        },
                      });
                    }}
                  >
                    Delete
                  </span>
                )}
              </>
            )}
            {(item.id === showReplyBox || item.id === editComment) && (
              <>
                <Form.Item>
                  {editComment ? (
                    <EditOutlined
                      onClick={() => {
                        if (showReplyBox) {
                          setShowReplyBox("");
                          onReply(item.id, item.title);
                        } else {
                          setEditComment("");
                          onEditComment(item.id, item.title);
                        }
                      }}
                    />
                  ) : (
                    <SendOutlined
                      onClick={() => {
                        if (showReplyBox) {
                          setShowReplyBox("");
                          onReply(item.id, item.title);
                        } else {
                          setEditComment("");
                          onEditComment(item.id, item.title);
                        }
                      }}
                    />
                  )}
                  <Input.TextArea
                    rows={1}
                    defaultValue={editComment && item.content}
                    onChange={(e) => setComment(e.target.value)}
                    onPressEnter={(e) => {
                      if (e.ctrlKey) {
                        if (showReplyBox) {
                          setShowReplyBox("");
                          onReply(item.id, item.title);
                        } else {
                          setEditComment("");
                          onEditComment(item.id, item.title);
                        }
                      }
                    }}
                  />
                </Form.Item>
              </>
            )}
          </>,
        ]
      }
      author={item?.authorName}
      datetime={moment(item?.createdAt).fromNow()}
      avatar={
        item?.authorPicture ? (
          <Avatar src={item.authorPicture} alt={"author"} />
        ) : (
          <Avatar className="default-comment-avatar" icon={<UserOutlined />} />
        )
      }
      content={
        <>
          {!item.parentId && <h5>{item.title}</h5>}
          <p>{item.content}</p>
        </>
      }
    >
      {item?.children?.map((children) => (
        <CommentList
          key={children.id}
          item={children}
          showReplyBox={showReplyBox}
          setShowReplyBox={setShowReplyBox}
          onReply={onReply}
          setComment={setComment}
          profile={profile}
          getComment={getComment}
          params={params}
          editComment={editComment}
          setEditComment={setEditComment}
          onEditComment={onEditComment}
        />
      ))}
    </Comment>
  );
};

const Comments = ({
  comment,
  comments,
  showReplyBox,
  setShowReplyBox,
  setComment,
  profile,
  getComment,
  params,
  editComment,
  setEditComment,
  setLoginVisible,
  isAuthenticated,
  newComment,
  setNewComment,
}) => {
  const onSubmit = (val) => {
    const resourceType = (type) => {
      if (type === "project") {
        return "initiative";
      } else {
        return type;
      }
    };
    const data = {
      author_id: profile.id,
      resource_id: parseInt(params.id),
      resource_type: resourceType(params?.type.replace("-", "_")),
      ...(val.parent_id && { parent_id: val.parent_id }),
      title: val.title,
      content: val.description,
    };

    api
      .post("/comment", data)
      .then((data) => {
        getComment(params.id, params.type.replace("-", "_"));
      })
      .catch(() => {
        notification.error({ message: "An error occured" });
      })
      .finally(() => {});
    setNewComment("");
  };

  const onReply = (id, title) => {
    const val = {
      parent_id: id,
      title: title,
      description: comment,
    };
    onSubmit(val);
  };

  const onEditComment = (id, title) => {
    const val = {
      id: id,
      title: title,
      content: comment,
    };
    api
      .put("/comment", val)
      .then((data) => {
        getComment(params.id, params.type.replace("-", "_"));
      })
      .catch(() => {})
      .finally(() => {});
  };

  return (
    <>
      <Col className="section comment-section">
        <h3
          className="content-heading"
          style={
            comments && comments.length > 0
              ? { marginBottom: "0" }
              : { marginBottom: "16px" }
          }
        >
          Discussion
        </h3>
        {comments &&
          comments.length > 0 &&
          comments?.map((item, index) => {
            return (
              <CommentList
                key={item?.id}
                item={item}
                showReplyBox={showReplyBox}
                setShowReplyBox={setShowReplyBox}
                onReply={onReply}
                setComment={setComment}
                profile={profile}
                getComment={getComment}
                params={params}
                editComment={editComment}
                setEditComment={setEditComment}
                onEditComment={onEditComment}
              />
            );
          })}
        {!isAuthenticated && (
          <Button
            className="login-button"
            onClick={() => setLoginVisible(true)}
            icon={<MessageOutlined twoToneColor="#09689a" />}
            shape="round"
          >
            Login to comment
          </Button>
        )}
      </Col>
      {isAuthenticated && (
        <Col className="input-wrapper">
          <MessageOutlined className="message-icon" />
          <div className="input">
            <SendOutlined
              onClick={() => {
                eventTrack("Resource view", "Comment", "Button");
                onSubmit({ description: newComment });
              }}
            />
            <Input.TextArea
              rows={1}
              className="comment-input"
              placeholder={
                comments && comments.length > 0
                  ? "Join the discussion..."
                  : "Be the first to comment..."
              }
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onPressEnter={(e) =>
                e.ctrlKey && onSubmit({ description: newComment })
              }
            />
          </div>
        </Col>
      )}
    </>
  );
};
export default Comments;
