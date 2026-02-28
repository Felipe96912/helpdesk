const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/*rotas*/
app.use("/chamados", require("./routes/chamados"));
app.use("/auth", require("./routes/auth"));

const path = require('path');
/*
// 'frontend' é o nome da sua pasta onde está o index.html
app.use(express.static(path.join(__dirname, '../frontend'))); 

// Rota para servir o index.html na raiz do site
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});*/

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
