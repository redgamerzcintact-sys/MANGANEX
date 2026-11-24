import { useAppStore } from '../stores/appStore';

export interface ChartThemeColors {
  series1: string;
  series2: string;
  series3: string;
  series4: string;
  series5: string;
  grid: string;
  text: string;
  textMuted: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  targetLine: string;
  actualBar: string;
  shortfall: string;
  recovery: string;
  cardBg: string;
  border: string;
}

export const useChartTheme = (): ChartThemeColors => {
  const { theme } = useAppStore();
  const isDark = theme === 'dark';

  return {
    series1: isDark ? '#FB923C' : '#C2410C',
    series2: isDark ? '#38BDF8' : '#0284C7',
    series3: isDark ? '#10B981' : '#059669',
    series4: isDark ? '#F59E0B' : '#D97706',
    series5: isDark ? '#C084FC' : '#7C3AED',
    grid: isDark ? 'rgba(255, 248, 240, 0.08)' : 'rgba(31, 22, 16, 0.08)',
    text: isDark ? '#DEC8B7' : '#57463A',
    textMuted: isDark ? '#A69282' : '#8C7667',
    tooltipBg: isDark ? '#1A1613' : '#FFFFFF',
    tooltipBorder: isDark ? '#4D4037' : '#E2D7CC',
    tooltipText: isDark ? '#FFF8F0' : '#1F1610',
    targetLine: isDark ? '#38BDF8' : '#0284C7',
    actualBar: isDark ? '#FB923C' : '#C2410C',
    shortfall: isDark ? '#EF4444' : '#DC2626',
    recovery: isDark ? '#10B981' : '#059669',
    cardBg: isDark ? '#241E1A' : '#FFFFFF',
    border: isDark ? '#4D4037' : '#E2D7CC',
  };
};
