const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Proxy para el stream de radio
app.get('/stream', async (req, res) => {
    try {
        const streamUrl = 'http://78.129.241.110:6240/stream'; // tu radio
        const response = await fetch(streamUrl);

        // Copiar headers importantes
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'no-cache');

        // Redirigir datos del stream al cliente
        response.body.pipe(res);
    } catch (err) {
        console.error('Error en proxy del stream:', err);
        res.status(500).send('Error al cargar el stream');
    }
});

// Ruta raíz para probar
app.get('/', (req, res) => {
    res.send('Proxy de radio funcionando ✅');
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});
