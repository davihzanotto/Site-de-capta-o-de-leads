require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || "1234";

function checkOwner(req, res, next) {
  const pass = req.headers["x-owner-pass"];
  if (!pass || pass !== OWNER_PASSWORD) {
    return res.status(401).json({ error: "Senha inválida." });
  }
  next();
}

app.get("/api/health", (req, res) => res.json({ ok: true }));

// ✅ Criar lead (form)
app.post("/api/leads", (req, res) => {
  const {
    nome,
    telefone,
    renda,
    pendencias,
    filhos,
    clt_pj,
    clt_3anos,
    declara_ir,
    paga_aluguel,
    observacoes
  } = req.body;

  if (!nome || !telefone || renda === undefined || !pendencias || !filhos || !clt_pj || !declara_ir || !paga_aluguel) {
    return res.status(400).json({ error: "Campos obrigatórios faltando." });
  }

  const createdAt = new Date().toISOString();

  const sql = `
    INSERT INTO leads
    (nome, telefone, renda, pendencias, filhos, clt_pj, clt_3anos, declara_ir, paga_aluguel, observacoes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      nome,
      telefone,
      Number(renda),
      pendencias,
      filhos,
      clt_pj,
      clt_3anos || null,
      declara_ir,
      paga_aluguel,
      observacoes || null,
      createdAt
    ],
    function (err) {
      if (err) return res.status(500).json({ error: "Erro ao salvar lead." });
      res.json({ ok: true, id: this.lastID });
    }
  );
});

// ✅ Listar leads (protegido)
app.get("/api/leads", checkOwner, (req, res) => {
  db.all("SELECT * FROM leads ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar leads." });
    res.json(rows);
  });
});

// ✅ Apagar lead (protegido)
app.delete("/api/leads/:id", checkOwner, (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM leads WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: "Erro ao apagar lead." });
    res.json({ ok: true, deleted: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`✅ API rodando em http://localhost:${PORT}`);
});
