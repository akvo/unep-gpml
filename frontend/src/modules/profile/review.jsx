import React, { useState } from "react";
import { Button, Collapse, Space, Pagination, Input, Avatar } from "antd";
import { DetailCollapse } from "./preview";
import { HeaderSearch } from "./admin";
import {
  topicNames,
  reviewStatusUIText,
  reviewCommentModalTitle,
  reviewCommentPlaceholder,
} from "../../utils/misc";
import api from "../../utils/api";
import { fetchReviewItems } from "./utils";
import { UserOutlined } from "@ant-design/icons";

const ReviewCommentModal = ({
  item,
  status,
  visible,
  handleOk,
  handleCancel,
}) => {
  const [reviewComment, setReviewComment] = useState();
  const action = status.slice(0, -2);
  const topicName = topicNames(item.type);

  return (
    <div
      className={`review-comment-wrapper ${visible ? "show" : "hide"}`}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <p>{`${reviewCommentModalTitle[status]} ${topicName}`}</p>
      <Input.TextArea
        rows={4}
        bordered={true}
        className="review-comment-input"
        placeholder={`${reviewCommentPlaceholder[status]} ${topicName}`}
        value={reviewComment}
        onChange={(e) => setReviewComment(e.target.value)}
      />
      <div className="review-comment-btn-wrapper">
        <Space size="small">
          <Button
            className="black"
            type="primary"
            onClick={() => handleOk(reviewComment)}
          >
            {reviewStatusUIText[action]}
          </Button>
          <Button className="black" type="link" onClick={handleCancel}>
            Cancel
          </Button>
        </Space>
      </div>
    </div>
  );
};

const ReviewSection = ({
  reviewItems,
  setReviewItems,
  reviewedItems,
  setReviewedItems,
}) => {
  const ReviewHeader = ({ item }) => {
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [modalReviewStatus, setModalReviewStatus] = useState("");

    const submitReview = (item, reviewStatus, reviewComment) => {
      const data = {
        "review-status": reviewStatus,
        "review-comment": reviewComment || "",
      };
      api.patch(`review/${item.type}/${item.topicId}`, data).then((resp) => {
        // Move current item to reviewed items
        const reviewedItem = { ...item, reviewStatus };
        setReviewedItems({
          ...reviewedItems,
          count: reviewedItems.count + 1,
          reviews: [reviewedItem, ...reviewedItems.reviews],
        });
        // Fetch review items again, to fetch any new items in the current page, etc.
        (async () => {
          setReviewItems(await fetchReviewItems(reviewItems, "PENDING"));
          setModalReviewStatus("");
        })();
      });
    };

    return (
      <div>
        <div className="row">
          <div className="col content">
            <Avatar
              className="content-img"
              size={{
                xs: 24,
                sm: 32,
                md: 40,
                lg: 50,
                xl: 50,
                xxl: 50,
              }}
              icon={item.picture || <UserOutlined />}
            />
            <div className="content-body">
              <div className="title">{item.title || "No Title"}</div>
              <div className="topic">{topicNames(item.type)}</div>
            </div>
          </div>
          <div
            className="col action"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Space size="small">
              <Button
                className="black"
                type="ghost"
                disabled={modalReviewStatus === "REJECTED"}
                onClick={() => {
                  setShowNoteInput(true);
                  setModalReviewStatus("ACCEPTED");
                }}
              >
                {reviewStatusUIText["ACCEPT"]}
              </Button>
              <Button
                className="black"
                type="link"
                disabled={modalReviewStatus === "ACCEPTED"}
                onClick={() => {
                  setShowNoteInput(true);
                  setModalReviewStatus("REJECTED");
                }}
              >
                {reviewStatusUIText["REJECT"]}
              </Button>
            </Space>
          </div>
        </div>
        <ReviewCommentModal
          item={item}
          status={modalReviewStatus}
          visible={showNoteInput}
          handleCancel={() => {
            setShowNoteInput(false);
            setModalReviewStatus("");
          }}
          handleOk={(reviewComment) =>
            submitReview(item, modalReviewStatus, reviewComment)
          }
        />
      </div>
    );
  };

  const ReviewedHeader = ({ item }) => {
    return (
      <>
        <div className="content-status">
          <span className="status">
            {reviewStatusUIText[item.reviewStatus]}
          </span>
        </div>
        <div className="row">
          <div className="col content">
            <Avatar
              className="content-img"
              size={50}
              icon={item.picture || <UserOutlined />}
            />
            <div className="content-body">
              <div className="title">{item.title || "No Title"}</div>
              <div className="topic">{topicNames(item.type)}</div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const CollapseItemTable = ({
    columns,
    Header,
    items,
    setItems,
    reviewStatus,
    collapsePanelClassName,
  }) => {
    const [previewContent, storePreviewContent] = useState({});

    const getPreviewContent = (urls) => {
      if (urls.length > 0) {
        urls.forEach((url) => {
          if (!previewContent[url]) {
            api.get(url).then((res) => {
              storePreviewContent({ ...previewContent, [url]: res.data });
            });
          }
        });
      }
    };

    const onChangePage = (page) => {
      const params = { ...items, page };
      (async () => {
        setItems(await fetchReviewItems(params, reviewStatus));
      })();
    };

    return (
      <>
        <div className="table-wrapper">
          <div className="row head">
            <HeaderSearch />
          </div>
          <Collapse onChange={getPreviewContent}>
            {items?.reviews?.length > 0 ? (
              items?.reviews?.map((item, index) => {
                const previewUrl = `/submission/${item.type}/${item.topicId}`;
                return (
                  <Collapse.Panel
                    key={previewUrl}
                    className={collapsePanelClassName}
                    header={<Header item={item} />}
                  >
                    <DetailCollapse
                      data={previewContent?.[previewUrl] || {}}
                      item={item}
                    />
                  </Collapse.Panel>
                );
              })
            ) : (
              <Collapse.Panel
                showArrow={false}
                collapsible="disabled"
                key="collapse-pending-no-data"
                header={<div className="row">No items to display</div>}
              ></Collapse.Panel>
            )}
          </Collapse>
        </div>
        <div className="pagination-wrapper">
          <Pagination
            defaultCurrent={1}
            current={items.page}
            onChange={onChangePage}
            pageSize={items.limit}
            total={items.count}
            defaultPageSize={items.limit}
          />
        </div>
      </>
    );
  };
  return (
    <div className="admin-view">
      <div key="new-review" className="review">
        <h2>New review requests ({`${reviewItems.count}`})</h2>
        <CollapseItemTable
          key="new-review-table"
          columns={["Name", "Action"]}
          Header={ReviewHeader}
          items={reviewItems}
          setItems={setReviewItems}
          reviewStatus="PENDING"
          collapsePanelClassName="request-collapse-panel-item"
        />
      </div>
      <div key="reviewed" className="archive">
        <h2>Reviewed requests ({`${reviewedItems.count}`})</h2>
        <CollapseItemTable
          key="review-table"
          columns={["Name", "Status"]}
          Header={ReviewedHeader}
          items={reviewedItems}
          setItems={setReviewedItems}
          reviewStatus="ACCEPTED,REJECTED"
          collapsePanelClassName="archive-collapse-panel-item status-show"
        />
      </div>
    </div>
  );
};

export default ReviewSection;
