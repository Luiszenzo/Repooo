const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const ENVIRONMENT = process.env.ENVIRONMENT || 'development';
const VERSION = process.env.VERSION || '1.0.0';

app.get('/', (req, res) => {
    res.json({
        message: `Bienvenido al ambiente ${ENVIRONMENT}`,
        environment: ENVIRONMENT,
        timestamp: new Date().toISOString(),
        version: VERSION
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', environment: ENVIRONMENT });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}, ambiente: ${ENVIRONMENT}`);
});
