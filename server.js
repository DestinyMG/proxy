const express = require('express');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Servir archivos estáticos (HTML, JS, CSS si los tienes)
app.use(express.static('public'));

// Proxy para el stream de radio
app.get('/stream', (req, res) => {
    const streamUrl = 'http://78.129.241.110:6240/stream';

    http.get(streamUrl, (streamRes) => {
        // Copiar headers importantes
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'no-cache');

        // Redirigir datos del stream al cliente
        streamRes.pipe(res);
    }).on('error', (err) => {
        console.error('Error en proxy del stream:', err);
        res.status(500).send('Error al cargar el stream');
    });
});

// Ruta raíz para probar
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});
