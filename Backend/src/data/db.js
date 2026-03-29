const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { databaseUrl } = require('../config/env');
const seed = require('./seed');

const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl && databaseUrl.includes('railway')
        ? { rejectUnauthorized: false }
        : undefined
});

const ensureDatabaseExists = async () => {
    const dbUrl = new URL(databaseUrl);
    const dbName = dbUrl.pathname.replace(/^\//, '');

    if (!dbName || !/^[a-zA-Z0-9_]+$/.test(dbName)) {
        throw new Error('DATABASE_URL inválida: nombre de base no válido.');
    }

    const adminUrl = new URL(databaseUrl);
    adminUrl.pathname = '/postgres';

    const adminPool = new Pool({
        connectionString: adminUrl.toString(),
        ssl: databaseUrl && databaseUrl.includes('railway')
            ? { rejectUnauthorized: false }
            : undefined
    });

    try {
        const { rows } = await adminPool.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
        if (rows.length === 0) {
            await adminPool.query(`CREATE DATABASE ${dbName}`);
            console.log(`[DB] Database created: ${dbName}`);
        }
    } finally {
        await adminPool.end();
    }
};

const initDb = async () => {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    try {
        await pool.query(schemaSql);
        await seed(pool);
        console.log('[DB] Schema ready.');
    } catch (error) {
        if (error?.code === '3D000') {
            await ensureDatabaseExists();
            await pool.query(schemaSql);
            await seed(pool);
            console.log('[DB] Schema ready.');
            return;
        }

        throw error;
    }
};

module.exports = {
    pool,
    initDb
};
