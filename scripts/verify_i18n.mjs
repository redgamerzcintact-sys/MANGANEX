import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localesDir = path.resolve(__dirname, '../src/i18n/locales');

function flattenKeys(obj, prefix = '') {
  let keys = {};
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(keys, flattenKeys(v, fullKey));
    } else {
      keys[fullKey] = v;
    }
  }
  return keys;
}

const enRaw = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf-8'));
const hiRaw = JSON.parse(fs.readFileSync(path.join(localesDir, 'hi.json'), 'utf-8'));
const mrRaw = JSON.parse(fs.readFileSync(path.join(localesDir, 'mr.json'), 'utf-8'));

const enFlat = flattenKeys(enRaw);
const hiFlat = flattenKeys(hiRaw);
const mrFlat = flattenKeys(mrRaw);

const enKeys = Object.keys(enFlat).sort();
const hiKeys = Object.keys(hiFlat).sort();
const mrKeys = Object.keys(mrFlat).sort();

let errors = [];

// 1. Verify EN vs HI
for (const k of enKeys) {
  if (!(k in hiFlat)) {
    errors.push(`[MISSING_KEY] Hindi (hi.json) missing key: ${k}`);
  } else if (!hiFlat[k] || hiFlat[k].trim() === '') {
    errors.push(`[EMPTY_VALUE] Hindi key has empty value: ${k}`);
  }
}
for (const k of hiKeys) {
  if (!(k in enFlat)) {
    errors.push(`[EXTRA_KEY] Hindi has unrecognized extra key: ${k}`);
  }
}

// 2. Verify EN vs MR
for (const k of enKeys) {
  if (!(k in mrFlat)) {
    errors.push(`[MISSING_KEY] Marathi (mr.json) missing key: ${k}`);
  } else if (!mrFlat[k] || mrFlat[k].trim() === '') {
    errors.push(`[EMPTY_VALUE] Marathi key has empty value: ${k}`);
  }
}
for (const k of mrKeys) {
  if (!(k in enFlat)) {
    errors.push(`[EXTRA_KEY] Marathi has unrecognized extra key: ${k}`);
  }
}

if (errors.length > 0) {
  console.error(`\x1b[31m[i18n Check FAILED] Found ${errors.length} discrepancies:\x1b[0m`);
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log(`\x1b[32m[i18n Check PASSED] All ${enKeys.length} translation keys match across English, Hindi, and Marathi with 100% coverage.\x1b[0m`);
  process.exit(0);
}
