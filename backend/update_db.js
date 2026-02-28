const db = require("./database");

db.all("PRAGMA table_info(chamados)", (err, colunas) => {

  const existe = colunas.some(col => col.name === "solucao");

  if (!existe) {

    db.run("ALTER TABLE chamados ADD COLUMN solucao TEXT");
    console.log("Coluna criada ✅");

  } else {

    console.log("Já existe 👍");

  }

});