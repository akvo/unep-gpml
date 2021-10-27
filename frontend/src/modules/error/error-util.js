export const redirectError = (err, history) => {
  const status = err?.response?.status;
  if (status === 403) {
    return history.push("/not-authorized");
  }
  if (status === 404) {
    return history.push("/not-found");
  }

  return history.push("/error");
};
