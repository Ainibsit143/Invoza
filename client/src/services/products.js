import { api } from "./api";

export const productService = {
  list: async () => {
    const data = await api.get("/products");
    return data.products;
  },

  create: async (product) => {
    const data = await api.post("/products", product);
    return data.product;
  },

  update: async (id, product) => {
    const data = await api.put(
      `/products/${encodeURIComponent(id)}`,
      product
    );
    return data.product;
  },

  remove: (id) => api.delete(`/products/${encodeURIComponent(id)}`),
};