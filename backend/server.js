const express = require("express");
const cors = require("cors");
const path = require('path'); // 1. Mantenha esta linha aqui no topo

const authRoutes = require("./routes/auth");
const chamadosRoutes = require("./routes/chamados");

const app = express();

app.use(cors());
app.use(express.json());

/* 🚀 Rotas da API */
app.use("/auth", authRoutes);
app.use("/chamados", chamadosRoutes);

// --- 2. DELETEI A LINHA REPETIDA "const path = require('path')" QUE ESTAVA AQUI ---

/// 📂 CONFIGURAÇÃO DO FRONTEND
// Se o server.js está em /backend e o index.html em /frontend
// __dirname é a pasta 'backend'. O '..' sai dela e entra na 'frontend'.
const caminhoFrontend = path.join(__dirname, '..', 'frontend');

// Serve os arquivos estáticos (CSS, JS, Imagens)
app.use(express.static(caminhoFrontend));

// Rota principal: Serve o index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(caminhoFrontend, 'index.html'));
});

// Catch-all: qualquer outra rota (como /login) volta para o index
// Isso é vital para que o sistema não dê "Cannot GET /rota" ao atualizar a página
app.get('*', (req, res) => {
  res.sendFile(path.join(caminhoFrontend, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
