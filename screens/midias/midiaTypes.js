import { animesApi, doramasApi, filmesApi, seriesApi } from '../../resources';

// `searchable` diz se o tipo tem fonte externa ligada no backend. Anime está
// sem: a API da AniList foi desativada, então o "+" vai direto pro cadastro
// manual em vez de abrir uma busca que não devolve nada.
export const MIDIA_TYPES = {
  series: { api: seriesApi, label: 'Série', pluralLabel: 'Séries', searchable: true },
  filmes: { api: filmesApi, label: 'Filme', pluralLabel: 'Filmes', searchable: true },
  doramas: { api: doramasApi, label: 'Dorama', pluralLabel: 'Doramas', searchable: true },
  animes: { api: animesApi, label: 'Anime', pluralLabel: 'Animes', searchable: false },
};
