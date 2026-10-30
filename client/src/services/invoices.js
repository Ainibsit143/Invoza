import { api } from "./api";

export const invoiceService = {
  list: async () => {
    const data = await api.get("/invoices");
    return data.invoices;
  },

  get: async (id) => {
    const data = await api.get(`/invoices/${encodeURIComponent(id)}`);
    return data.invoice;
  },

  create: async (invoice) => {
    const data = await api.post("/invoices", invoice);
    return data.invoice;
  },

  update: async (id, invoice) => {
    const data = await api.put(
      `/invoices/${encodeURIComponent(id)}`,
      invoice
    );
    return data.invoice;
  },

  updateStatus: async (id, status) => {
    const data = await api.patch(
      `/invoices/${encodeURIComponent(id)}/status`,
      { status }
    );
    return data.invoice;
  },

  remove: (id) => api.delete(`/invoices/${encodeURIComponent(id)}`),
};