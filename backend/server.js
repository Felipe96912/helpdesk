const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/*rotas*/
app.use("/chamados", require("./routes/chamados"));
app.use("/auth", require("./routes/auth"));

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});