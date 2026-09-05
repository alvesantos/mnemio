import { animesApi, filmesApi, seriesApi } from '../../resources';

export const MIDIA_TYPES = {
  series: { api: seriesApi, label: 'Série', pluralLabel: 'Séries' },
  filmes: { api: filmesApi, label: 'Filme', pluralLabel: 'Filmes' },
  animes: { api: animesApi, label: 'Anime', pluralLabel: 'Animes' },
};
