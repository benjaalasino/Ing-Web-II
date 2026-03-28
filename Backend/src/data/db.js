const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { databaseUrl } = require('../config/env');

const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl && databaseUrl.includes('railway')
        ? { rejectUnauthorized: false }
        : undefined
});

const initDb = async () => {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schema);

    const seed = require('./seed');
    await seed(pool);

    console.log('[DB] PostgreSQL ready.');
};

module.exports = {
    pool,
    initDb
};
