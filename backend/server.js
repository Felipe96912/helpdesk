const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/*rotas*/
app.use("/chamados", require("./routes/chamados"));
app.use("/auth", require("./routes/auth"));

const path = require('path');

/// 📂 CONFIGURAÇÃO DO FRONTEND
// __dirname é a pasta 'backend'. O '../frontend' sai da backend e entra na frontend.
const caminhoFrontend = path.join(__dirname, '..', 'frontend');

// Serve os arquivos estáticos (CSS, JS, Imagens)
app.use(express.static(caminhoFrontend));

// Rota principal: qualquer URL que não seja API vai carregar o index.html
app.get('/:splat*', (req, res) => {
  res.sendFile(path.join(caminhoFrontend, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
