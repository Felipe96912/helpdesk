const { Pool } = require('pg');

// O Render lerá a URL da variável de ambiente que você configurou no painel
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("ERRO CRÍTICO: A variável DATABASE_URL não foi encontrada no ambiente!");
}

const pool = new Pool({
  connectionString,
  ssl: {
    // Obrigatório para conectar ao Neon a partir do Render
    rejectUnauthorized: false 
  }
});

// Função para garantir que as tabelas existam no branch 'production'
const initDb = async () => {
  try {
    // Criando tabelas com nomes em minúsculo para evitar erros de busca
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        tipo TEXT DEFAULT 'user'
      );
      
      CREATE TABLE IF NOT EXISTS chamados (
        id SERIAL PRIMARY KEY,
        titulo TEXT NOT NULL,
        descricao TEXT,
        status TEXT DEFAULT 'Aberto',
        data_abertura TEXT,
        data_finalizacao TEXT,
        solucao TEXT
      );
    `);
    console.log("✅ Conexão com o Postgres estabelecida e tabelas verificadas.");
  } catch (err) {
    console.error("❌ Erro ao inicializar banco no Neon:", err.message);
  }
};

initDb();

module.exports = pool;
