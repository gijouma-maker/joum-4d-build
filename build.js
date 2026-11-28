/* Joum 4D Build – Bündeln: alle App-Dateien → js/app.min.js (ein Download statt 25, kleiner gepackt).
   Aufruf: node build.js   (nach jeder Änderung an js/*.js ausführen und app.min.js mit hochladen)
   3D-Dateien werden NICHT gebündelt – die lädt js/lade3d.js erst bei Bedarf. */
const fs = require('fs'), { execSync } = require('child_process');
const DATEIEN = ['data-raeume', 'data-anleitungen', 'data-garten', 'core', 'lade3d', 'screens-projekte', 'screens-garten', 'screens-markt', 'symbole', 'ki-pruefung',
  'screens-installation', 'tour', 'assistent', 'vorlesen', 'sprachsteuerung', 'loslegen', 'studio', 'stile-mehr', 'studio-mehr', 'studio-material', 'umbau', 'haus', 'laser','fachfrage', 'moebel', 'fitness', 'deko', 'anschluesse', 'plan-ziehen', 'wohnung', 'druck', 'teilen', 'foto-tools','treppe', 'bauamt', 'bauteile3d', 'ar', 'konfig', 'anmeldung', 'sprachen', 'funktionen', 'startseite', 'nav']
  .filter((n) => fs.existsSync('js/' + n + '.js'));
const roh = DATEIEN.map((n) => `/* ===== ${n}.js ===== */\n` + fs.readFileSync('js/' + n + '.js', 'utf8')).join('\n;\n');
fs.writeFileSync('js/app.js', roh);
try { execSync('terser js/app.js --compress --mangle --keep-fnames -o js/app.min.js', { stdio: 'inherit' }); }
catch (e) { console.log('terser fehlt – ungepackt übernommen'); fs.copyFileSync('js/app.js', 'js/app.min.js'); }
fs.unlinkSync('js/app.js');
const kb = (f) => Math.round(fs.statSync(f).size / 1024);
console.log('Gebündelt:', DATEIEN.length, 'Dateien →', kb('js/app.min.js'), 'KB (vorher', DATEIEN.reduce((s, n) => s + kb('js/' + n + '.js'), 0), 'KB)');
