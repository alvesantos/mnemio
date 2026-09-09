/**
 * Campos de progresso por tipo de mídia. Espelha PROGRESS_BY_TYPE do backend
 * (app/stats.py) — se um lado mudar, o outro precisa acompanhar.
 *
 * Filmes não têm progresso numérico, só status.
 */
export const PROGRESS_BY_TYPE = {
  livros: {
    current: 'pages_read',
    total: 'total_pages',
    label: 'páginas',
    step: 'página',
    currentLabel: 'Páginas lidas',
    totalLabel: 'Total de páginas',
    extra: { field: 'chapters_done', label: 'Capítulos finalizados' },
  },
  series: {
    current: 'episodes_watched',
    total: 'total_episodes',
    label: 'episódios',
    step: 'episódio',
    currentLabel: 'Episódios assistidos',
    totalLabel: 'Total de episódios',
    extra: null,
  },
  doramas: {
    current: 'episodes_watched',
    total: 'total_episodes',
    label: 'episódios',
    step: 'episódio',
    currentLabel: 'Episódios assistidos',
    totalLabel: 'Total de episódios',
    extra: null,
  },
  filmes: null,
};

export function progressFor(type) {
  return PROGRESS_BY_TYPE[type] ?? null;
}
