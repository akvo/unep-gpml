import api from "../../utils/api";

export const fetchArchiveData = async (page, limit) => {
  const params = new URLSearchParams({ page, limit });
  const url = `/archive?${params.toString()}`;
  const res = await api.get(url);
  const data = res.data.data.map((item) => ({
    ...item,
    preview: `/submission/${item.type}/${item.id}`,
  }));
  return { ...res.data, data };
};
