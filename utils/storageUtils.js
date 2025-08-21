const fs = require('fs');

function loadCooldowns(path) {
  if (fs.existsSync(path)) {
    try {
      const data = fs.readFileSync(path, 'utf8').trim();
      if (!data) return {}; // file kosong
      return JSON.parse(data);
    } catch (err) {
      console.error(`Gagal membaca atau mem-parse file JSON: ${path}`);
      console.error(err.message);
      return {};
    }
  }
  return {};
}

function saveCooldowns(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

module.exports = { loadCooldowns, saveCooldowns };
