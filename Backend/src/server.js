const app = require('./app');
const { port } = require('./config/env');
const { initDb } = require('./data/db');

initDb()
    .then(() => {
        app.listen(port, () => {
            console.log(`Backend ejecutandose en http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error('[DB] Failed to initialize:', err.message);
        process.exit(1);
    });
