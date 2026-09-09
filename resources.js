import { api } from './api';

export function createResourceApi(path) {
  return {
    list: () => api.get(`${path}/`).then((res) => res.data),
    get: (id) => api.get(`${path}/${id}`).then((res) => res.data),
    create: (data) => api.post(`${path}/`, data).then((res) => res.data),
    update: (id, data) => api.put(`${path}/${id}`, data).then((res) => res.data),
    remove: (id) => api.delete(`${path}/${id}`),
  };
}

export const livrosApi = createResourceApi('/livros');
export const seriesApi = createResourceApi('/series');
export const filmesApi = createResourceApi('/filmes');
export const animesApi = createResourceApi('/animes');
export const doramasApi = createResourceApi('/doramas');

// Indexado pelo mesmo identificador usado pelo backend em /me/continue,
// para navegar direto do item devolvido por lá.
export const API_BY_TYPE = {
  livros: livrosApi,
  series: seriesApi,
  filmes: filmesApi,
  animes: animesApi,
  doramas: doramasApi,
};

export function fetchStats() {
  return api.get('/me/stats').then((res) => res.data);
}

export function fetchContinue() {
  return api.get('/me/continue').then((res) => res.data);
}
