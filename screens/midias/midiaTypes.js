import { doramasApi, filmesApi, seriesApi } from '../../resources';

export const MIDIA_TYPES = {
  series: { api: seriesApi, label: 'Série', pluralLabel: 'Séries' },
  filmes: { api: filmesApi, label: 'Filme', pluralLabel: 'Filmes' },
  doramas: { api: doramasApi, label: 'Dorama', pluralLabel: 'Doramas' },
};
