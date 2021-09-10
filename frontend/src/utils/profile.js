import { storage } from "./storage";

export const updateStatusProfile = (data) => {
  if (
    storage.getCookie("profile") === "SUBMITTED" &&
    data.reviewStatus === "APPROVED"
  ) {
    document.cookie = "profileMessage=1";
  }
  if (
    storage.getCookie("profile") === "APPROVED" &&
    data.reviewStatus === "APPROVED"
  ) {
    document.cookie = "profileMessage=0";
  }
  document.cookie = `profile=${data.reviewStatus}`;
};

export const isRegistered = (profile) => {
  return Boolean(profile.about);
};
