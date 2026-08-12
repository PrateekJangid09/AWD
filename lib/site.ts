export const SITE_NAME = 'AllWebsites.Design';
export const SITE_URL = 'https://www.allwebsites.design';
export const AUDIT_REVIEW_DATE = '2026-08-11';
export const PAGE_SIZE = 30;

export function pageCount(total: number, size = PAGE_SIZE) {
  return Math.max(1, Math.ceil(total / size));
}

export function validPage(value: string | string[] | undefined, totalPages: number) {
  const parsed = Number.parseInt(Array.isArray(value) ? value[0] : value || '1', 10);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), totalPages) : 1;
}

export function absoluteUrl(path = '/') {
  return new URL(path, SITE_URL).toString();
}
