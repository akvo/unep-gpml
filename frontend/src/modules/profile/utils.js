import api from "../../utils/api";

export const fetchArchiveData = async (
  page,
  limit,
  resources_or_stakeholders
) => {
  const params = { page, limit, only: resources_or_stakeholders };
  const res = await api.get("/archive", params);
  const data = res.data.data.map((item) => ({
    ...item,
    preview: `/submission/${item.type}/${item.id}`,
  }));
  return { ...res.data, data };
};

export const fetchSubmissionData = async (
  page,
  limit,
  resources_or_stakeholders,
  review_status,
  title
) => {
  let params = {
    page,
    limit,
    only: resources_or_stakeholders,
  };
  if (review_status) {
    params = { review_status, ...params };
  }
  if (title) {
    params = { title, ...params };
  }
  const resp = await api.get("/submission", params);
  return resp.data;
};

export const fetchReviewItems = async (items, reviewStatus) => {
  const { page, limit } = items;
  const params = { "review-status": reviewStatus, page, limit };
  const resp = await api.get("review", params);
  return resp.data;
};

export const fetchStakeholders = async (
  page,
  limit,
  reviewStatus = "APPROVED"
) => {
  const params = { page, limit, "review-status": reviewStatus };
  const resp = await api.get("stakeholder", params);
  return resp.data;
};
