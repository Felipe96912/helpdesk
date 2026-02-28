const express = require("express");
const cors = require("cors");
const path = require('path');

const authRoutes = require("./routes/auth");
const chamadosRoutes = require("./routes/chamados");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/chamados", chamadosRoutes);

const caminhoFrontend = path.join(__dirname, '..', 'frontend');
app.use(express.static(caminhoFrontend));

// Rota específica para a home
app.get('/', (req, res) => {
  res.sendFile(path.join(caminhoFrontend, 'index.html'));
});

// Catch-all com REGEX para Express 5 (Solução Definitiva)
app.get(/^\/(.*)/, (req, res) => {
  res.sendFile(path.join(caminhoFrontend, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
