import { api } from './api';

export function createResourceApi(path) {
  return {
    list: () => api.get(`${path}/`).then((res) => res.data),
    create: (data) => api.post(`${path}/`, data).then((res) => res.data),
    update: (id, data) => api.put(`${path}/${id}`, data).then((res) => res.data),
    remove: (id) => api.delete(`${path}/${id}`),
  };
}

export const livrosApi = createResourceApi('/livros');
export const seriesApi = createResourceApi('/series');
export const filmesApi = createResourceApi('/filmes');
export const animesApi = createResourceApi('/animes');
