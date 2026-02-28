const { Pool } = require('pg');

// O Render ou o seu terminal local vai ler a URL daqui
// Remova a URL gigante daqui e deixe apenas o process.env.DATABASE_URL
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("ERRO: A variável DATABASE_URL não foi definida!");
}
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Necessário para conexões seguras na nuvem
  }
});

// Função para criar as tabelas caso não existam (Executa uma vez)
const initDb = async () => {
  try {
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
    console.log("Tabelas verificadas/criadas no Postgres.");
  } catch (err) {
    console.error("Erro ao inicializar banco:", err);
  }
};

initDb();

module.exports = pool;
