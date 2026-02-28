const express = require("express");
const router = express.Router();
const db = require("../database");
const jwt = require("jsonwebtoken");

const SECRET = "sua_chave_secreta_aqui"; 

// 🛡️ 1. Função Auth (atualizada para capturar o tipo)
function auth(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ erro: "Nenhum token fornecido." });
  }

  const parts = token.split(" ");
  const jwtToken = parts.length === 2 ? parts[1] : token;

  jwt.verify(jwtToken, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ erro: "Token inválido." });
    }
    
    req.userId = decoded.id; 
    req.userTipo = decoded.tipo; // 👈 IMPORTANTE: Salva o tipo (admin ou user) vindo do token
    next();
  });
}

// 🛡️ 2. Middleware isAdmin (Logo após o auth)
function isAdmin(req, res, next) {
  // Agora o req.userTipo existe porque o auth preencheu acima
  if (req.userTipo !== 'admin') {
    return res.status(403).json({ erro: "Acesso negado. Apenas técnicos podem finalizar chamados." });
  }
  next();
}

// 📋 Listar chamados (Qualquer um logado vê)
router.get("/", auth, (req, res) => {
  db.all("SELECT * FROM chamados", [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

// ➕ Criar chamado (Qualquer um logado pode abrir)
router.post("/", auth, (req, res) => {
  const { titulo, descricao } = req.body;
  const dataAbertura = new Date().toLocaleString("pt-BR");

  db.run(
    "INSERT INTO chamados (titulo, descricao, status, data_abertura) VALUES (?, ?, ?, ?)",
    [titulo, descricao, "Aberto", dataAbertura],
    function (err) {
      if (err) return res.status(500).json({ erro: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// ✅ 3. Rota de finalizar PROTEGIDA (Substitua a antiga por esta)
// Note que usamos 'auth' primeiro para identificar e 'isAdmin' depois para autorizar
router.put("/:id", auth, isAdmin, (req, res) => {
  const { solucao } = req.body;
  const dataFinalizacao = new Date().toLocaleString("pt-BR");

  db.run(
    "UPDATE chamados SET status = ?, data_finalizacao = ?, solucao = ? WHERE id = ?",
    ["Finalizado", dataFinalizacao, solucao, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ erro: err.message });
      res.json({ atualizado: true });
    }
  );
});

module.exports = router;