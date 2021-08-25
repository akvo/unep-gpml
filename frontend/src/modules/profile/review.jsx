import React, { Fragment, useState } from "react";
import { Button, Collapse, Space, Pagination, Modal, Input } from "antd";
import { DetailCollapse } from "./preview";
import { topicNames } from "../../utils/misc";
import api from "../../utils/api";
import { fetchReviewItems } from "./utils";
import { titleCase } from "../../utils/string";

const ReviewCommentModal = ({ action, visible, handleOk, handleCancel }) => {
  const [reviewComment, setReviewComment] = useState();
  return (
    <Modal
      title={`${action} the reviewed resource`}
      visible={visible}
      onOk={() => handleOk(reviewComment)}
      okText={action}
      onCancel={handleCancel}
    >
      <Input.TextArea
        rows={4}
        bordered={true}
        placeholder="Add a review comment"
        value={reviewComment}
        onChange={(e) => setReviewComment(e.target.value)}
      />
    </Modal>
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
    const [modalReviewState, setModalReviewState] = useState("");
    const modalActionName = titleCase(`${modalReviewState.slice(0, -2)}`);

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
        })();
      });
    };

    return (
      <div className="row">
        <div className="col">{topicNames(item.type)}</div>
        <div className="col">{item.title}</div>
        <div
          className="col"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Space size="middle">
            <Button
              type="primary"
              onClick={() => {
                setShowNoteInput(true);
                setModalReviewState("ACCEPTED");
              }}
            >
              Accept
            </Button>
            <Button
              type="secondary"
              onClick={() => {
                setShowNoteInput(true);
                setModalReviewState("REJECTED");
              }}
            >
              Reject
            </Button>
          </Space>
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <ReviewCommentModal
            action={modalActionName}
            visible={showNoteInput}
            handleCancel={() => setShowNoteInput(false)}
            handleOk={(reviewComment) =>
              submitReview(item, modalReviewState, reviewComment)
            }
          />
        </div>
      </div>
    );
  };

  const ReviewedHeader = ({ item }) => {
    return (
      <div className="row">
        <div className="col">{topicNames(item.type)}</div>
        <div className="col">{item.title}</div>
        <div className="col">{item.reviewStatus}</div>
      </div>
    );
  };

  const CollapseItemTable = ({ Header, items, setItems, reviewStatus }) => {
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
        <Collapse onChange={getPreviewContent}>
          {items?.reviews?.length > 0 ? (
            items?.reviews?.map((item, index) => {
              const previewUrl = `/submission/${item.type}/${item.topicId}`;
              return (
                <Collapse.Panel
                  key={previewUrl}
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
        <div style={{ padding: "10px 0px" }}>
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
      <Fragment key="new-review">
        <h2>New review requests ({`${reviewItems.count}`})</h2>
        <div className="row head">
          <div className="col">Type</div>
          <div className="col">Name</div>
          <div className="col">Action</div>
        </div>
        <CollapseItemTable
          Header={ReviewHeader}
          items={reviewItems}
          setItems={setReviewItems}
          reviewStatus="PENDING"
        />
      </Fragment>
      <Fragment key="reviewed">
        <h2>Reviewed requests ({`${reviewedItems.count}`})</h2>
        <div className="row head">
          <div className="col">Type</div>
          <div className="col">Name</div>
          <div className="col">Status</div>
        </div>
        <CollapseItemTable
          Header={ReviewedHeader}
          items={reviewedItems}
          setItems={setReviewedItems}
          reviewStatus="ACCEPTED,REJECTED"
        />
      </Fragment>
    </div>
  );
};

export default ReviewSection;
