const express = require("express");
const router = express.Router();
const db = require("../database"); // Agora este arquivo exporta o 'pool' do Postgres
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = "sua_chave_secreta_aqui";

// 🛡️ Middleware de proteção
function auth(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ erro: "Não autorizado" });
  
  const jwtToken = token.split(" ")[1] || token;

  jwt.verify(jwtToken, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ erro: "Token inválido" });
    req.userId = decoded.id;
    req.userTipo = decoded.tipo;
    next();
  });
}

// 🔑 Rota de Login (Convertida para Postgres)
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  console.log("Tentativa de login para:", email); // <--- ADICIONE ISSO
  
  try {
    // No Postgres, usamos db.query e o resultado vem em .rows
    const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(senha, user.senha))) {
      console.log("USUÁRIO NÃO ENCONTRADO NO BANCO"); // <--- ADICIONE ISSO
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    const token = jwt.sign({ id: user.id, tipo: user.tipo }, SECRET, { expiresIn: "1h" });
    
    res.json({ 
      token, 
      tipo: user.tipo 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro no servidor" });
  }
});

// 👤 Rota de Registro Comum
router.post("/register", async (req, res) => {
  const { nome, email, senha } = req.body;
  const hash = await bcrypt.hash(senha, 10);

  try {
    await db.query(
      "INSERT INTO usuarios (nome, email, senha, tipo) VALUES ($1, $2, $3, $4)",
      [nome, email, hash, 'user']
    );
    res.json({ mensagem: "Usuário criado com sucesso!" });
  } catch (err) {
    res.status(400).json({ erro: "Erro ao cadastrar ou email já existe" });
  }
});

// 👮 Rota exclusiva para ADMIN criar usuários (Convertida para Postgres)
router.post("/admin/register", auth, async (req, res) => {
  if (req.userTipo !== 'admin') {
    return res.status(403).json({ erro: "Acesso negado. Apenas administradores podem criar usuários." });
  }

  const { nome, email, senha, tipo } = req.body; 
  const hash = await bcrypt.hash(senha, 10);

  try {
    await db.query(
      "INSERT INTO usuarios (nome, email, senha, tipo) VALUES ($1, $2, $3, $4)",
      [nome, email, hash, tipo || 'user']
    );
    res.json({ mensagem: "Usuário criado com sucesso!" });
  } catch (err) {
    res.status(400).json({ erro: "Email já cadastrado." });
  }
});

module.exports = router;
module.exports.SECRET = SECRET;
