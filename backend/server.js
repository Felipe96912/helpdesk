const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/*rotas*/
app.use("/auth", authRoutes);
app.use("/chamados", chamadosRoutes);

const path = require('path');

/// 📂 CONFIGURAÇÃO DO FRONTEND
// __dirname é a pasta 'backend'. O '../frontend' sai da backend e entra na frontend.
const caminhoFrontend = path.join(__dirname, '..', 'frontend');

// Serve os arquivos estáticos (CSS, JS, Imagens)
app.use(express.static(caminhoFrontend));

// Rota principal: qualquer URL que não seja API vai carregar o index.html
// Serve a página inicial
app.get('/', (req, res) => {
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
