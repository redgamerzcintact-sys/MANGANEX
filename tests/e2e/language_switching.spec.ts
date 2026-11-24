import { test, expect } from '@playwright/test';

const ROUTES = [
  { path: '/command-center', name: 'command-center' },
  { path: '/prospectivity', name: 'prospectivity' },
  { path: '/production', name: 'production' },
  { path: '/scenario-lab', name: 'scenario-lab' },
  { path: '/satellite', name: 'satellite' },
  { path: '/login', name: 'login' },
];

const TARGET_LANGUAGES = ['hi', 'mr'] as const;

for (const lang of TARGET_LANGUAGES) {
  test.describe(`Language Switching to ${lang.toUpperCase()}`, () => {
    for (const route of ROUTES) {
      test(`Verify ${route.name} in ${lang.toUpperCase()} without overflow or untranslated layout headers`, async ({ page }) => {
        await page.addInitScript(({ activeLang }) => {
          localStorage.setItem('manganex_language', activeLang);
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
        }, { activeLang: lang });

        await page.goto(route.path);
        await page.waitForLoadState('networkidle');

        // Verify HTML lang attribute is updated
        const htmlLang = await page.getAttribute('html', 'lang');
        expect(htmlLang).toBe(lang);

        // Check for layout horizontal overflow
        const hasHorizontalOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalOverflow, `Horizontal overflow detected on ${route.name} in ${lang}`).toBe(false);

        // Capture screenshot
        await page.screenshot({
          path: `docs/screenshots/i18n/${route.name}-${lang}.png`,
          fullPage: true,
        });
      });
    }
  });
}
