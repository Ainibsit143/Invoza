import { api } from "./api";

export const customerService = {
  list: async () => {
    const data = await api.get("/customers");
    return data.customers;
  },

  create: async (customer) => {
    const data = await api.post("/customers", customer);
    return data.customer;
  },

  update: async (id, customer) => {
    const data = await api.put(
      `/customers/${encodeURIComponent(id)}`,
      customer
    );
    return data.customer;
  },

  remove: (id) => api.delete(`/customers/${encodeURIComponent(id)}`),
};