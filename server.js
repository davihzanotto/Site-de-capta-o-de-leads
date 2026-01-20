const express = require("express");
const cors = require("cors");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

// ======================
// CONFIG
// ======================
const PORT = 3000;
const HOST = "127.0.0.1"; // use 127.0.0.1 para evitar confusão no Windows

// ======================
// DB (SQLite)
// ======================
const DB_PATH = path.join(__dirname, "leads.db");
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("❌ ERRO AO ABRIR O BANCO:", err.message);
  } else {
    console.log("✅ Banco aberto:", DB_PATH);
  }
});

db.serialize(() => {
  const createSql = `
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      telefone TEXT NOT NULL,
      renda REAL,
      pendencias TEXT,
      filhos TEXT,
      clt_pj TEXT,
      clt_3anos TEXT,
      ir TEXT,
      aluguel TEXT,
      observacoes TEXT,
      created_at TEXT NOT NULL
    )
  `;

  db.run(createSql, (err) => {
    if (err) {
      console.error("❌ ERRO AO CRIAR TABELA:", err.message);
      console.error("SQL:", createSql);
    } else {
      console.log("✅ Tabela 'leads' OK");
    }
  });
});

// Helpers
function toNumberBR(value) {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  const normalized = s.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function sanitizePhone(phone) {
  if (!phone) return "";
  return String(phone).replace(/[^\d]/g, "");
}

// ======================
// ROUTES
// ======================

// Health check
app.get("/", (req, res) => {
  res.json({
    ok: true,
    status: "API funcionando 🚀",
    db: DB_PATH,
  });
});

// Criar lead
app.post("/api/leads", (req, res) => {
  const body = req.body || {};

  const nome = (body.nome || "").trim();
  const telefone = sanitizePhone(body.telefone || "");
  const renda = toNumberBR(body.renda);

  const pendencias = (body.pendencias || "").trim();
  const filhos = (body.filhos || "").trim();
  const clt_pj = (body.clt_pj || "").trim();
  const clt_3anos = (body.clt_3anos || "").trim();
  const ir = (body.ir || "").trim();
  const aluguel = (body.aluguel || "").trim();
  const observacoes = (body.observacoes || "").trim();

  if (!nome) return res.status(400).json({ error: "Campo nome é obrigatório." });
  if (!telefone) return res.status(400).json({ error: "Campo telefone é obrigatório." });

  const created_at = new Date().toISOString();

  const sql = `
    INSERT INTO leads
    (nome, telefone, renda, pendencias, filhos, clt_pj, clt_3anos, ir, aluguel, observacoes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    nome,
    telefone,
    renda,
    pendencias,
    filhos,
    clt_pj,
    clt_3anos,
    ir,
    aluguel,
    observacoes,
    created_at,
  ];

  db.run(sql, params, function (err) {
    if (err) {
      console.error("❌ DB INSERT ERROR:", err.message);
      console.error("SQL:", sql);
      console.error("PARAMS:", params);
      return res.status(500).json({
        error: "Erro ao salvar lead no banco.",
        details: err.message, // <- agora você vai ver o motivo real
      });
    }

    res.status(201).json({
      ok: true,
      id: this.lastID,
      message: "Lead salvo com sucesso ✅",
    });
  });
});

// Listar leads
app.get("/api/leads", (req, res) => {
  db.all(`SELECT * FROM leads ORDER BY datetime(created_at) DESC`, [], (err, rows) => {
    if (err) {
      console.error("❌ DB SELECT ERROR:", err.message);
      return res.status(500).json({ error: "Erro ao listar leads.", details: err.message });
    }
    res.json(rows || []);
  });
});

// ======================
// START
// ======================
app.listen(PORT, HOST, () => {
  console.log(`✅ API rodando em http://${HOST}:${PORT}`);
  console.log(`📦 Banco SQLite: ${DB_PATH}`);
});
