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
const path = require('path');

// Se o server.js está em /backend e o index.html em /frontend
const caminhoFrontend = path.join(__dirname, '..', 'frontend');

app.use(express.static(caminhoFrontend));

app.get('/', (req, res) => {
  res.sendFile(path.join(caminhoFrontend, 'index.html'));
});

// IMPORTANTE: Esta rota "catch-all" deve vir por último
app.get('*', (req, res) => {
  res.sendFile(path.join(caminhoFrontend, 'index.html'));
});

// Se o usuário digitar qualquer outra coisa, manda pro index também
app.use((req, res) => {
  res.sendFile(path.join(caminhoFrontend, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
