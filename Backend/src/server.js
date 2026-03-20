const app = require('./app');
const { port } = require('./config/env');

app.listen(port, () => {
    console.log(`Backend de facturas ejecutandose en http://localhost:${port}`);
});
