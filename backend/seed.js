const db = require("./database");
const bcrypt = require("bcryptjs");

async function criarUsuario() {
  const nome = "Admin";
  const email = "admin@email.com";
  const senhaPlana = "123456"; // Esta é a senha que você usará no formulário

  // Criptografando a senha antes de salvar
  const senhaHash = await bcrypt.hash(senhaPlana, 10);

  db.run(
    "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
    [nome, email, senhaHash],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          console.log("⚠️ Usuário já existe no banco de dados.");
        } else {
          console.error("❌ Erro ao criar usuário:", err.message);
        }
      } else {
        console.log("✅ Usuário de teste criado com sucesso!");
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Senha: ${senhaPlana}`);
      }
      process.exit(); // Fecha o script
    }
  );
}

criarUsuario();