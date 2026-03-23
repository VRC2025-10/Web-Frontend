const en = require('./src/i18n/messages/en.json');
const ja = require('./src/i18n/messages/ja.json');

function getKeys(obj, prefix) {
  prefix = prefix || '';
  let keys = [];
  for (const key of Object.keys(obj)) {
    const path = prefix ? prefix + '.' + key : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getKeys(obj[key], path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

const enKeys = new Set(getKeys(en));
const jaKeys = new Set(getKeys(ja));

const missingInJa = [...enKeys].filter(function(k) { return !jaKeys.has(k); });
const missingInEn = [...jaKeys].filter(function(k) { return !enKeys.has(k); });

if (missingInJa.length) { console.log('Missing in ja.json:', missingInJa); }
if (missingInEn.length) { console.log('Missing in en.json:', missingInEn); }
if (missingInJa.length === 0 && missingInEn.length === 0) { console.log('All keys match!'); }
