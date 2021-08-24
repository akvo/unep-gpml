import api from "../../utils/api";

export const fetchArchiveData = async (page, limit) => {
  const params = { page, limit };
  const res = await api.get("/archive", params);
  const data = res.data.data.map((item) => ({
    ...item,
    preview: `/submission/${item.type}/${item.id}`,
  }));
  return { ...res.data, data };
};

export const fetchSubmissionData = async (page, limit) => {
  const params = { page, limit };
  const resp = await api.get("/submission", params);
  return resp.data;
};
