const { Pool } = require('pg');

// O Render ou o seu terminal local vai ler a URL daqui
const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_GleKznh8VvF0@ep-orange-base-aitic8dp-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

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