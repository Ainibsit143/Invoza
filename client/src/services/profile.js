import { api } from "./api";

export const profileService = {
  getBusiness: async () => {
    const data = await api.get("/profile/business");
    return data.business;
  },

  updateBusiness: async (business) => {
    const data = await api.put("/profile/business", business);
    return data.business;
  },
};