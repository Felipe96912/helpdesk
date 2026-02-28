const express = require("express");
const cors = require("cors");
const path = require('path'); // Mantenha esta linha aqui (Linha 3 ou 4)

const authRoutes = require("./routes/auth");
const chamadosRoutes = require("./routes/chamados");

const app = express();

app.use(cors());
app.use(express.json());

/* rotas API */
app.use("/auth", authRoutes);
app.use("/chamados", chamadosRoutes);;

const path = require('path');

/// 📂 CONFIGURAÇÃO DO FRONTEND
// __dirname é a pasta 'backend'. O '../frontend' sai da backend e entra na frontend.

// Se o server.js está em /backend e o index.html em /frontend
/// 📂 CONFIGURAÇÃO DO FRONTEND
// __dirname é a pasta 'backend'. O '../frontend' sai da backend e entra na frontend.
const caminhoFrontend = path.join(__dirname, '..', 'frontend');

// Serve os arquivos estáticos (CSS, JS, Imagens)
app.use(express.static(caminhoFrontend));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(caminhoFrontend, 'index.html'));
});

// Catch-all: qualquer outra rota volta para o index (importante para SPAs)
app.use((req, res) => {
  res.sendFile(path.join(caminhoFrontend, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
