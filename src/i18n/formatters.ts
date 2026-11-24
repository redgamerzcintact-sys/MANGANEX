import i18n from './index';

export function getActiveIntlLocale(): string {
  const current = i18n.language || 'en';
  switch (current) {
    case 'hi':
      return 'hi-IN';
    case 'mr':
      return 'mr-IN';
    case 'en':
    default:
      return 'en-IN';
  }
}

export function formatNumber(val: number, options?: Intl.NumberFormatOptions): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const locale = getActiveIntlLocale();
  return new Intl.NumberFormat(locale, options).format(val);
}

export function formatTonnes(val: number): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const locale = getActiveIntlLocale();
  const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(val);
  return `${formatted} ${i18n.t('common.unitT')}`;
}

export function formatMt(val: number, decimals: number = 1): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const locale = getActiveIntlLocale();
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
  return `${formatted} ${i18n.t('common.unitMt')}`;
}

export function formatPercent(val: number, decimals: number = 1): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const locale = getActiveIntlLocale();
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    style: 'percent',
  }).format(val / 100);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return '—';
  const locale = getActiveIntlLocale();
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return String(date);
  return new Intl.DateTimeFormat(locale, options || { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
}
