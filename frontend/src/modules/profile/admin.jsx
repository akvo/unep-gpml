import { Button, Collapse, Space, Spin, Modal } from "antd";
import React from "react";
import { useEffect, useState } from "react";
import api from "../../utils/api";
import moment from "moment";

const ModalReject = ({ visible, close, reject, item }) => {
  return (
    <Modal
      width={600}
      okText="Close"
      visible={visible}
      footer={
        <div>
          <Button onClick={(e) => reject()}>Yes</Button>
          <Button onClick={(e) => close()} type="primary">
            No
          </Button>
        </div>
      }
      closable={false}
    >
      <div className="warning-modal-user">
        <p>Are you sure you want to decline?</p>
      </div>
    </Modal>
  );
};

const AdminSection = () => {
  const [pendingItems, setPendingItems] = useState([]);
  const [modalRejectVisible, setModalRejectVisible] = useState(false);
  const [modalRejectFunction, setModalRejectFunction] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async function fetchData() {
      const profileResp = await api.get("/profile/pending");
      const eventResp = await api.get("/event/pending");
      setPendingItems([
        ...profileResp.data.map((it) => ({
          type: "profile",
          ...it,
          title: `${it.firstName} ${it.lastName}`,
        })),
        ...eventResp.data.map((it) => ({ type: "event", ...it })),
      ]);
      setLoading(false);
    })();
  }, []);
  const review = (item, review_status) => () => {
    api
      .put(`/${item.type}/review`, {
        id: item.id,
        review_status: review_status,
      })
      .then(() => {
        setPendingItems(pendingItems.filter((it) => it.id !== item.id));
        setModalRejectVisible(false);
      });
  };

  const reject = (item, review_status) => () => {
    setModalRejectFunction(() => review(item, review_status));
    setModalRejectVisible(true);
  };
  return (
    <div className="admin-view">
      <h2>New approval requests</h2>
      {loading && <Spin size="large" />}
      <div className="row head">
        <div className="col">Type</div>
        <div className="col">Title</div>
        <div className="col">Action</div>
      </div>
      <Collapse>
        {pendingItems.map((item, index) => (
          <Collapse.Panel
            key={`collapse-${index}`}
            header={
              <div className="row">
                <div className="col">{item.type}</div>
                <div className="col">{item.title}</div>
                <div
                  className="col"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Space size="middle">
                    <Button type="primary" onClick={review(item, "APPROVED")}>
                      Approve
                    </Button>
                    <Button type="link" onClick={reject(item, "REJECTED")}>
                      Decline
                    </Button>
                  </Space>
                </div>
              </div>
            }
          >
            <div>
              {item.type === "profile" && (
                <div className="stakeholder-info">
                  <div className="info-img">
                    {item.photo && (
                      <div className="info-img">
                        <img src={item.photo} alt="profile" />
                      </div>
                    )}
                  </div>
                  <ul>
                    <li>{item.email}</li>
                    <li>{item.about}</li>
                    {item.org && (
                      <li>
                        <a href={item.org.url} target="_blank" rel="noreferrer">
                          {item.org.name}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              )}
              {item.type === "event" && (
                <div className="event-info">
                  {item.image && (
                    <div className="info-img">
                      <img src={item.image} alt="event" />
                    </div>
                  )}
                  <ul>
                    <li>
                      <span>Submitted At</span>:{" "}
                      {moment(item.createdAt).format("DD MMM YYYY")}
                    </li>
                    <li>
                      <span>Event Date</span>:{" "}
                      {moment(item.startDate).format("DD MMM YYYY")} to{" "}
                      {moment(item.endDate).format("DD MMM YYYY")}
                    </li>
                    <li>
                      <span>Country</span>: {item.country}
                    </li>
                    <li>
                      <span>City: {item.city}</span>
                    </li>
                    <li>
                      <span>Coverage</span>: <b>{item.geoCoverageType}</b>
                      {item?.geoCoverageValues && (
                        <ul className={"ul-children"}>
                          {item.geoCoverageValues.map((x, i) => (
                            <li key={`coverage-${i}`}>{x}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                    <li>
                      <span>Description</span>: <br />
                      {item.description}
                    </li>
                    <li>
                      <span>Remarks</span>: {item.remarks}
                    </li>
                    {item?.tags && (
                      <li>
                        <span>Tags</span>: {item.tags.map((x) => `${x}, `)}
                      </li>
                    )}
                    <li>
                      <span>Urls</span>:
                      {item?.urls && (
                        <ul className={"ul-children"}>
                          {item.urls.map((x, i) => (
                            <li key={`url-${i}`}>
                              {x.isoCode}: {x.url}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </Collapse.Panel>
        ))}
      </Collapse>
      <ModalReject
        visible={modalRejectVisible}
        reject={modalRejectFunction}
        close={() => setModalRejectVisible(false)}
      />
    </div>
  );
};

export default AdminSection;
