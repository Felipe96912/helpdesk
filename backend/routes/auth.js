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

// 🔑 Rota de Login (COM LOGS DE DEBUG E BUSCA ROBUSTA)
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  console.log("Tentativa de login para:", email); // Ajuda a ver o que chega no Render

  try {
    // LOWER e TRIM evitam erros de espaços ou letras maiúsculas/minúsculas
    const result = await db.query(
      "SELECT * FROM usuarios WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))", 
      [email]
    );
    const user = result.rows[0];

    if (!user) {
      console.log("USUÁRIO NÃO ENCONTRADO NO BANCO"); // Se aparecer isso, o banco está vazio ou email errado
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      console.log("SENHA INCORRETA"); // Se aparecer isso, o hash no banco não bate com a senha digitada
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    console.log("LOGIN SUCESSO!");

    const token = jwt.sign({ id: user.id, tipo: user.tipo }, SECRET, { expiresIn: "1h" });
    
    res.json({ 
      token, 
      tipo: user.tipo 
    });
  } catch (err) {
    console.error("Erro no SQL:", err.message); // Ver logs do Render para erros de conexão
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

// 👮 Rota exclusiva para ADMIN criar usuários
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
