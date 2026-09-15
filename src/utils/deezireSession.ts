export const DEEZIRE_LAST_RESULT_KEY = 'deezire_last_result';
export const DEEZIRE_LAST_QUERY_KEY = 'deezire_last_query';

export function clearDeezireSession(): void {
  localStorage.removeItem(DEEZIRE_LAST_RESULT_KEY);
  localStorage.removeItem(DEEZIRE_LAST_QUERY_KEY);
}
