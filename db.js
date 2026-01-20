const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.join(__dirname, "leads.db"));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      telefone TEXT NOT NULL,
      renda REAL NOT NULL,
      pendencias TEXT NOT NULL,
      filhos TEXT NOT NULL,
      clt_pj TEXT NOT NULL,
      clt_3anos TEXT,
      declara_ir TEXT NOT NULL,
      paga_aluguel TEXT NOT NULL,
      observacoes TEXT,
      created_at TEXT NOT NULL
    )
  `);
});

module.exports = db;
