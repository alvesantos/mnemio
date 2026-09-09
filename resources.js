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
export const doramasApi = createResourceApi('/doramas');

// Indexado pelo mesmo identificador usado pelo backend em /me/continue,
// para navegar direto do item devolvido por lá.
export const API_BY_TYPE = {
  livros: livrosApi,
  series: seriesApi,
  filmes: filmesApi,
  doramas: doramasApi,
};

export function fetchStats() {
  return api.get('/me/stats').then((res) => res.data);
}

export function fetchContinue() {
  return api.get('/me/continue').then((res) => res.data);
}

// --------------------------------------------------------------------------
// Catálogo de mídias
//
// A busca vai direto na fonte externa (TMDB, AniList, Google Books) pelo
// backend. Nada é gravado até o usuário abrir o detalhe ou cadastrar o item.
// --------------------------------------------------------------------------

export function searchMedia({ type, query, limit = 20, signal }) {
  return api
    .get('/busca', { params: { tipo: type, q: query, limit }, signal })
    .then((res) => ({
      results: res.data,
      // A fonte não respondeu e o backend serviu só o que já estava em cache.
      degraded: res.headers['x-search-degraded'] === 'true',
    }));
}

export function fetchMediaItem({ type, source, externalId }) {
  return api
    .get(`/midias/${type}/${source}/${encodeURIComponent(externalId)}`)
    .then((res) => res.data);
}
