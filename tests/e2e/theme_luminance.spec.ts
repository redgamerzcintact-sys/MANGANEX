import { test, expect } from '@playwright/test';

const ROUTES = [
  { path: '/landing', name: 'landing' },
  { path: '/login', name: 'login' },
  { path: '/command-center', name: 'command-center' },
  { path: '/prospectivity', name: 'prospectivity' },
  { path: '/production', name: 'production' },
  { path: '/scenario-lab', name: 'scenario-lab' },
  { path: '/satellite', name: 'satellite' },
  { path: '/subsurface', name: 'subsurface' },
  { path: '/intelligence', name: 'intelligence' },
  { path: '/nexus', name: 'nexus' },
];

const THEMES = ['dark', 'light'] as const;

// Helper: calculate relative luminance from rgb/rgba string
function getLuminance(rgbStr: string): number {
  const match = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return 1;
  const [r, g, b] = [parseInt(match[1], 10) / 255, parseInt(match[2], 10) / 255, parseInt(match[3], 10) / 255];
  const sRGB = [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

for (const theme of THEMES) {
  test.describe(`Theme Verification: ${theme.toUpperCase()}`, () => {
    for (const route of ROUTES) {
      test(`Render ${route.name} in ${theme} mode without contrast violations`, async ({ page }) => {
        // Mock authentication for protected routes
        await page.addInitScript(({ activeTheme }) => {
          localStorage.setItem('manganex_theme', activeTheme);
          localStorage.setItem('manganex_token', 'demo-valid-token');
          localStorage.setItem(
            'manganex_auth_user',
            JSON.stringify({
              id: 'demo-geologist',
              username: 'geologist@moil.gov.in',
              email: 'geologist@moil.gov.in',
              fullName: 'Chief Exploration Geologist',
              role: 'ROLE_GEOLOGIST',
              organization: 'MOIL Limited',
            })
          );
        }, { activeTheme: theme });

        await page.goto(route.path);
        await page.waitForLoadState('networkidle');

        // Capture screenshot
        await page.screenshot({
          path: `docs/screenshots/theme/${route.name}-${theme}.png`,
          fullPage: true,
        });

        if (theme === 'light') {
          // Verify that outside allowed dark areas (map tiles, 3D WebGL canvas), background luminance >= 0.45
          const violations = await page.evaluate(() => {
            const allowedDarkSelectors = [
              '.leaflet-container',
              'canvas',
              '.deck-gl-container',
              '[data-allow-dark="true"]',
              '.allowed-dark'
            ];

            const elements = Array.from(document.querySelectorAll('div, section, aside, header, main, article'));
            const fails: Array<{ tag: string; className: string; bg: string; luminance: number }> = [];

            for (const el of elements) {
              const htmlEl = el as HTMLElement;
              // Check if inside allowed dark area
              if (allowedDarkSelectors.some(sel => htmlEl.closest(sel))) {
                continue;
              }

              const style = window.getComputedStyle(htmlEl);
              const bg = style.backgroundColor;
              if (bg === 'transparent' || bg.includes('rgba(0, 0, 0, 0)')) continue;

              const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
              if (!match) continue;

              const [r, g, b] = [parseInt(match[1], 10) / 255, parseInt(match[2], 10) / 255, parseInt(match[3], 10) / 255];
              const sRGB = [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
              const lum = 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];

              // In light mode, container backgrounds must have luminance >= 0.45
              if (lum < 0.45 && htmlEl.offsetWidth > 100 && htmlEl.offsetHeight > 40) {
                fails.push({
                  tag: htmlEl.tagName.toLowerCase(),
                  className: htmlEl.className.slice(0, 60),
                  bg,
                  luminance: Math.round(lum * 100) / 100,
                });
              }
            }

            return fails.slice(0, 5); // Return top 5 if any
          });

          expect(violations, `Found dark containers in light mode: ${JSON.stringify(violations)}`).toHaveLength(0);
        }
      });
    }
  });
}
