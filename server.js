const express = require("express");
const cors = require("cors");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

// Render SEMPRE passa a porta por aqui:
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

// ======================
// DB (SQLite)
// ======================
const DB_PATH = path.join(__dirname, "leads.db");
const db = new sqlite3.Database(DB_PATH, () => {
  console.log("📦 Banco SQLite:", DB_PATH);
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      telefone TEXT,
      renda REAL,
      pendencias TEXT,
      filhos TEXT,
      clt_pj TEXT,
      clt_3anos TEXT,
      ir TEXT,
      aluguel TEXT,
      observacoes TEXT,
      created_at TEXT
    )
  `, () => {
    console.log("📊 Tabela 'leads' OK");
  });
});

// rota teste
app.get("/", (req, res) => {
  res.json({ status: "API online 🚀" });
});

// START
app.listen(PORT, HOST, () => {
  console.log(`🚀 API rodando em ${HOST}:${PORT}`);
});
