const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ================================
// 🔴 CAMBIA SOLO ESTO CUANDO QUIERAS
// ================================
const RADIO_IP = '78.129.241.110';
const RADIO_PORT = 6240;
const RADIO_PATH = '/stream';
// ================================

app.use(cors());
app.use(express.static('public'));

// PROXY DEL STREAM
app.get('/stream', (req, res) => {
    const streamUrl = `http://${RADIO_IP}:${RADIO_PORT}${RADIO_PATH}`;

    console.log('Proxy a:', streamUrl);

    http.get(streamUrl, (streamRes) => {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        streamRes.pipe(res);
    }).on('error', (err) => {
        console.error('Error del stream:', err.message);
        res.status(500).end('Error al cargar el stream');
    });
});

// INDEX
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// INICIAR SERVIDOR
app.listen(PORT, () => {
    console.log('===============================');
    console.log('Proxy de radio ACTIVO');
    console.log(`Servidor escuchando en puerto ${PORT}`);
    console.log(`Radio real: http://${RADIO_IP}:${RADIO_PORT}${RADIO_PATH}`);
    console.log('===============================');
});
